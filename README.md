# WishTale

WishTale is a responsive celebration website built with standalone HTML, CSS, and JavaScript. The catalogue and its previews are served by the Node.js app; genuine custom-site and template enquiries are sent to `wishtale.in@gmail.com` by the server.

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and enter the SMTP connection details for your mail provider.
4. Run `npm start`, then open `http://localhost:3000`.

Email delivery needs all of these server-only settings:

- `SMTP_HOST`: SMTP server host.
- `SMTP_PORT`: provider port, commonly `587` for STARTTLS or `465` for TLS.
- `SMTP_USER` and `SMTP_PASSWORD`: SMTP authentication credentials.
- `SMTP_FROM_EMAIL`: an address verified with the provider and permitted as the message sender.
- `PORT` (optional): HTTP port; defaults to `3000`.

The enquiry endpoint always delivers to `wishtale.in@gmail.com`. Missing SMTP settings or delivery failures return an error to the form rather than showing a success state. Keep `.env` private and never add SMTP credentials to browser code. `.env.example` contains placeholders only.

The website enquiry form and template-order enquiry form post to `POST /api/enquiries`. The endpoint validates and sanitizes fields, checks a honeypot, limits requests per client, and honors an idempotency key to avoid repeat sends. Rate-limit and idempotency records are held in memory for this single-process app. Configure SMTP credentials before testing live delivery.

Run the automated backend checks with `npm test`. These use a fake mail transport and do not send email.
