"use strict";

const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");
const { createApp, RECIPIENT } = require("../server");

const smtpEnv = {
  SMTP_HOST: "smtp.example.test",
  SMTP_PORT: "587",
  SMTP_USER: "smtp-user",
  SMTP_PASSWORD: "test-password",
  SMTP_FROM_EMAIL: "sender@example.test"
};

async function startApp(options = {}) {
  const server = createApp(options).listen(0, "127.0.0.1");
  await once(server, "listening");
  return {
    server,
    url: `http://127.0.0.1:${server.address().port}`
  };
}

async function post(url, body, key = "test-submission-key-0001") {
  return fetch(`${url}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(body)
  });
}

test("sends owner enquiries once when the same submission is retried", async t => {
  const sent = [];
  let transportOptions;
  const { server, url } = await startApp({
    env: smtpEnv,
    transportFactory: options => {
      transportOptions = options;
      return { sendMail: async message => { sent.push(message); return { accepted: [message.to] }; } };
    }
  });
  t.after(() => new Promise(resolve => server.close(resolve)));

  const payload = {
    type: "custom",
    name: "Ari",
    contact: "ari@example.test",
    requestType: "Memory timeline",
    date: "2027-02-14",
    details: "A personal page with our story.",
    website: ""
  };
  const [first, retry] = await Promise.all([
    post(url, payload),
    post(url, payload)
  ]);

  assert.equal(first.status, 200);
  assert.equal(retry.status, 200);
  assert.equal(transportOptions.secure, false);
  assert.equal(transportOptions.auth.pass, smtpEnv.SMTP_PASSWORD);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, RECIPIENT);
  assert.equal(sent[0].replyTo, payload.contact);
  assert.match(sent[0].text, /A personal page with our story/);
});

test("rejects invalid contact details and honeypot submissions", async t => {
  const { server, url } = await startApp({
    env: smtpEnv,
    transportFactory: () => ({ sendMail: async () => assert.fail("Invalid enquiries must not be mailed") })
  });
  t.after(() => new Promise(resolve => server.close(resolve)));

  const base = {
    type: "custom",
    name: "Ari",
    contact: "not a contact",
    requestType: "Website",
    details: "A request"
  };
  const invalidContact = await post(url, base, "invalid-contact-key-001");
  assert.equal(invalidContact.status, 400);
  assert.match((await invalidContact.json()).error, /valid email address or phone number/);

  const honeypot = await post(url, { ...base, contact: "ari@example.test", website: "bot" }, "honeypot-submission-key-01");
  assert.equal(honeypot.status, 400);
});

test("sends template order enquiries to the WishTale inbox", async t => {
  const messages = [];
  const { server, url } = await startApp({
    env: { ...smtpEnv, SMTP_PORT: "465" },
    transportFactory: options => {
      assert.equal(options.secure, true);
      return { sendMail: async message => { messages.push(message); } };
    }
  });
  t.after(() => new Promise(resolve => server.close(resolve)));

  const response = await post(url, {
    type: "order",
    name: "Sam",
    contact: "+1 202 555 0100",
    template: "Our Universe",
    occasion: "Memory Reveal",
    price: "₹199",
    date: "",
    notes: "Add the names and photo reveal."
  }, "order-enquiry-submission-001");

  assert.equal(response.status, 200);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].to, RECIPIENT);
  assert.equal(messages[0].replyTo, undefined);
  assert.match(messages[0].text, /Template: Our Universe/);
  assert.match(messages[0].text, /Add the names and photo reveal/);
});

test("reports SMTP configuration gaps without pretending delivery succeeded", async t => {
  const { server, url } = await startApp({ env: {} });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await post(url, {
    type: "order",
    name: "Sam",
    contact: "+1 202 555 0100",
    template: "Our Universe",
    occasion: "Memory Reveal",
    price: "₹199",
    notes: ""
  }, "missing-smtp-config-key-01");
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /Email delivery is not configured/);
});

test("limits repeated enquiries from one client", async t => {
  const { server, url } = await startApp({ env: {} });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const payload = {
    type: "custom",
    name: "Ria",
    contact: "ria@example.test",
    requestType: "Website",
    details: "A personal page"
  };
  const responses = [];
  for (let index = 0; index < 6; index++) {
    responses.push(await post(url, payload, `rate-limit-submission-${String(index).padStart(3, "0")}`));
  }
  assert.deepEqual(responses.slice(0, 5).map(response => response.status), [503, 503, 503, 503, 503]);
  assert.equal(responses[5].status, 429);
  assert.ok(Number(responses[5].headers.get("retry-after")) > 0);
});
