Stripe Checkout integration (server-side)

This project intentionally keeps payment interactions client-side for demo purposes.

To integrate Stripe Checkout (recommended flow):

1. Install Stripe server SDK on your backend (Node example):
   npm install stripe

2. Add a server endpoint `/api/create-checkout-session` that:
   - Accepts cart/summary payload
   - Creates a Checkout Session with `success_url` and `cancel_url`
   - Returns `{ url: session.url }` to the client

3. Securely store your Stripe secret key in env vars and never put it in the frontend.

4. Update the frontend `Payment.jsx` button to POST to `/api/create-checkout-session` (demo already includes a fetch stub that expects `{ url }`).

5. Test in Stripe test mode using test card numbers (e.g., 4242 4242 4242 4242).

Docs:
- https://stripe.com/docs/payments/checkout

If you'd like, I can add an example Node/Express server file that implements `/api/create-checkout-session` for local testing. Let me know.

Paystack & Opay (overview)

This repo includes demo UI helpers that allow you to paste a Paystack webhook secret and an Opay merchant identifier into the browser (under Payment → Payment Configuration). This is strictly for local demos — DO NOT store real secrets client-side in production.

To accept real payments with Paystack or Opay you must implement server-side endpoints that:

- Initialize a transaction (create authorization URL or redirect) and return the client a URL to redirect to.
- Verify and handle webhooks sent by the provider. For Paystack this is typically a signed webhook (verify the signature using your webhook secret). For Opay follow their webhook verification docs.
- Update your orders on successful payment and respond with appropriate HTTP status codes to acknowledge webhooks.

Suggested server endpoints (Node/Express examples):

- `POST /api/paystack/initialize` — accepts cart summary, calls Paystack `/transaction/initialize`, returns `authorization_url`.
- `POST /api/opay/initialize` — accepts cart summary and merchant id, returns a redirect URL for Opay checkout.
- `POST /webhooks/paystack` — receives Paystack webhook events; verify using your webhook secret and mark orders as paid.
- `POST /webhooks/opay` — Opay webhook endpoint; verify and process accordingly.

Webhook security & keys

- Keep webhook secrets and API keys on the server only (env vars). Never commit or expose them to the frontend.
- When testing locally you can use tools like `ngrok` to expose a local webhook endpoint for Paystack/Opay callbacks.

Demo: AdminPayments UI

This repository adds a small demo UI (`AdminPayments` in the frontend) that stores a Paystack webhook secret and Opay merchant id in `localStorage` purely for convenience while developing locally. It does not create real server-side integrations. Use the AdminPayments panel only for local testing and follow the server-side steps above for production.

If you want, I can scaffold a minimal Node/Express server with the initialize and webhook endpoints, plus example verification logic for Paystack and Opay. Tell me if you prefer Node or another backend and I will generate the server code.