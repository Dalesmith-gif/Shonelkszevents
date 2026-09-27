# ShonellesEZevents — Final Build Foundation

Included:
- Correct visible brand title: ShonellesEZevents
- Responsive storefront and real product photos
- Product selection/order summary
- Admin page foundation (`admin.html`)
- Order-status model: New → Awaiting Payment → Paid → In Production → Ready → Shipped/Completed
- Payment architecture for cards, Apple Pay, Google Pay, PayPal and Venmo
- Safe configuration template; no secret payment/database credentials are stored in GitHub

## What still requires account activation
A static ZIP cannot securely create external merchant/database accounts. To make Admin changes global and accept real money, connect:
1. Supabase project (authentication, products, orders, storage)
2. PayPal Business checkout (payment methods supported for the account/device/region)
3. Transactional email provider or server function for merchant/customer confirmations
4. Custom domain DNS

Do not put private API keys, PayPal secrets, database passwords, or Supabase service-role keys in GitHub.
