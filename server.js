"use strict";

const path = require("node:path");
const express = require("express");
const nodemailer = require("nodemailer");

const RECIPIENT = "wishtale.in@gmail.com";
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

function cleanText(value, maxLength, multiline = false) {
  if (typeof value !== "string") return "";
  let cleaned = value.normalize("NFKC").replace(/\r\n?/g, "\n");
  cleaned = cleaned.replace(multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, "");
  cleaned = multiline ? cleaned.split("\n").map(line => line.trim()).join("\n").trim() : cleaned.replace(/\s+/g, " ").trim();
  return cleaned.slice(0, maxLength);
}

function isValidContact(value) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  return /^\+?[\d\s().-]{7,25}$/.test(value) && (value.match(/\d/g) || []).length >= 7;
}

function validDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateEnquiry(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Please check the submitted form and try again." };
  if (cleanText(body.website, 200)) return { error: "We could not accept this submission." };

  const type = cleanText(body.type, 20);
  const name = cleanText(body.name, 100);
  const contact = cleanText(body.contact, 254);
  const date = cleanText(body.date, 10);
  if (!["custom", "order"].includes(type)) return { error: "Choose a valid enquiry type." };
  if (!name) return { error: "Enter your name." };
  if (!contact || !isValidContact(contact)) return { error: "Enter a valid email address or phone number." };
  if (!validDate(date)) return { error: "Enter a valid occasion date." };

  if (type === "custom") {
    const requestType = cleanText(body.requestType, 100);
    const details = cleanText(body.details, 4000, true);
    if (!requestType || !details) return { error: "Add the type of website and a few details about your idea." };
    return { value: { type, name, contact, date, requestType, details } };
  }

  const template = cleanText(body.template, 120);
  const occasion = cleanText(body.occasion, 100);
  const price = cleanText(body.price, 40);
  const notes = cleanText(body.notes, 1000, true);
  if (!template || !occasion || !price) return { error: "The selected design details are incomplete. Please choose it again." };
  return { value: { type, name, contact, date, template, occasion, price, notes } };
}

function smtpSettings(env) {
  const host = cleanText(env.SMTP_HOST, 255);
  const user = cleanText(env.SMTP_USER, 254);
  const password = typeof env.SMTP_PASSWORD === "string" ? env.SMTP_PASSWORD : "";
  const from = cleanText(env.SMTP_FROM_EMAIL, 254);
  const port = Number(env.SMTP_PORT);
  if (!host || !user || !password || !from || !Number.isInteger(port) || port < 1 || port > 65535 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) {
    return null;
  }
  return { host, port, user, password, from };
}

function createApp({ env = process.env, transportFactory = nodemailer.createTransport } = {}) {
  const app = express();
  const requestsByIp = new Map();
  const deliveredKeys = new Map();
  const inFlight = new Map();
  let transporter;

  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.set("X-Frame-Options", "SAMEORIGIN");
    next();
  });

  function limitEnquiries(req, res, next) {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const rate = requestsByIp.get(ip);
    for (const [knownIp, knownRate] of requestsByIp) {
      if (now - knownRate.startedAt >= RATE_WINDOW_MS) requestsByIp.delete(knownIp);
    }
    if (!rate || now - rate.startedAt >= RATE_WINDOW_MS) {
      requestsByIp.set(ip, { startedAt: now, count: 1 });
    } else if (rate.count >= RATE_MAX_REQUESTS) {
      res.set("Retry-After", String(Math.ceil((RATE_WINDOW_MS - (now - rate.startedAt)) / 1000)));
      return res.status(429).json({ error: "Too many requests. Please wait a little before trying again." });
    } else {
      rate.count += 1;
    }
    return next();
  }

  app.post("/api/enquiries", limitEnquiries, express.json({ limit: "16kb", strict: true }), async (req, res) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    for (const [key, expiresAt] of deliveredKeys) {
      if (expiresAt <= now) deliveredKeys.delete(key);
    }

    const validation = validateEnquiry(req.body);
    if (validation.error) return res.status(400).json({ error: validation.error });
    const idempotencyKey = req.get("Idempotency-Key");
    if (typeof idempotencyKey !== "string" || !/^[A-Za-z0-9-]{16,100}$/.test(idempotencyKey)) {
      return res.status(400).json({ error: "This submission could not be verified. Please try again." });
    }
    const key = `${ip}:${idempotencyKey}`;
    if (deliveredKeys.has(key)) return res.json({ ok: true, duplicate: true });
    if (inFlight.has(key)) {
      try {
        await inFlight.get(key);
        return res.json({ ok: true, duplicate: true });
      } catch {
        return res.status(502).json({ error: "We could not deliver your enquiry. Please try again later." });
      }
    }

    const settings = smtpSettings(env);
    if (!settings) {
      return res.status(503).json({ error: "Email delivery is not configured yet. Please try again later or email wishtale.in@gmail.com." });
    }
    const enquiry = validation.value;
    const isCustom = enquiry.type === "custom";
    const subject = `[WishTale] ${isCustom ? "Custom website request" : "Template order enquiry"} from ${enquiry.name}`;
    const lines = [
      isCustom ? "Custom website request" : "Template order enquiry",
      `Name: ${enquiry.name}`,
      `Contact: ${enquiry.contact}`,
      `Occasion date: ${enquiry.date || "Not provided"}`
    ];
    if (isCustom) {
      lines.push(`Website type: ${enquiry.requestType}`, "", "Idea:", enquiry.details);
    } else {
      lines.push(`Template: ${enquiry.template}`, `Occasion: ${enquiry.occasion}`, `Price shown: ${enquiry.price}`, "", "Notes:", enquiry.notes || "None");
    }

    const mail = {
      from: settings.from,
      to: RECIPIENT,
      subject,
      text: lines.join("\n")
    };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.contact)) mail.replyTo = enquiry.contact;

    let delivery;
    try {
      if (!transporter) {
        transporter = transportFactory({
          host: settings.host,
          port: settings.port,
          secure: settings.port === 465,
          auth: { user: settings.user, pass: settings.password }
        });
      }
      delivery = Promise.resolve().then(() => transporter.sendMail(mail));
      inFlight.set(key, delivery);
      await delivery;
      deliveredKeys.set(key, now + IDEMPOTENCY_TTL_MS);
      return res.json({ ok: true });
    } catch (error) {
      const reason = error && (error.code || error.name);
      console.error("[WishTale email] Delivery failed:", reason || "SMTP_ERROR");
      return res.status(502).json({ error: "We could not deliver your enquiry. Please try again later." });
    } finally {
      if (inFlight.get(key) === delivery) inFlight.delete(key);
    }
  });

  app.use(express.static(path.join(__dirname), { dotfiles: "deny", index: "index.html" }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error && (error.type === "entity.too.large" || error.type === "entity.parse.failed")) {
      return res.status(400).json({ error: "The submitted form could not be read. Please check it and try again." });
    }
    console.error("[WishTale server] Request failed:", error && error.code ? error.code : "REQUEST_ERROR");
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  });

  return app;
}

if (require.main === module) {
  require("dotenv").config();
  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`WishTale is listening on http://localhost:${port}`));
}

module.exports = { createApp, validateEnquiry, RECIPIENT };
