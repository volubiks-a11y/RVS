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