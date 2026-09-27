# ShonellesZEvents

A simple, editable storefront for ShonellesZEvents.

## Easiest edits
Open `products.js` in GitHub and click the pencil icon.

Each product has:
- `name`
- `description`
- `price`
- `image`

Put product photos in the `images` folder and set the image path, for example:
`image: "images/beaded-pens.jpg"`

## Important
The order form currently demonstrates the customer workflow and success message, but it does **not** send email or collect payment yet. Those should be connected before replacing the current live site.

## Free hosting
This package is static and can be hosted on GitHub Pages or Cloudflare Pages.

For Cloudflare Pages:
- connect the GitHub repository
- framework preset: None
- build command: leave blank
- output directory: `/`

Do not point `shonellesezevents.com` to the replacement until you have tested and approved it.
