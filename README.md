# ShonellesEZevents Orders v1

This build adds real Supabase order intake and Admin order management.

Before uploading:
1. In Supabase SQL Editor, run `SUPABASE-ORDERS-SETUP.sql`.
2. Then upload the contents of this folder to the existing GitHub repository and commit.
3. Test one storefront order.
4. Sign into `/admin.html` and confirm the order appears.

Payment and email are intentionally not faked. The next activation requires:
- PayPal Business checkout client credentials/configuration for cards, Apple Pay, Google Pay, PayPal and Venmo.
- A transactional email service/server function for merchant and customer confirmations.

No card data or secret API keys belong in GitHub or Supabase browser code.
