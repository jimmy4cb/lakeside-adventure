# LakeSide Adventure Community

This project is a responsive static recreation of the public LakeSide Adventures MeDo app at https://app-9xfbam1ifuv5.appmedo.com/.

## Local preview

Run a local web server from the project root:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in the browser.

## Included pages/sections

- Hero and intro
- Adventures and upcoming events
- React-powered featured events styled with LakeSide colors
- Adventure stories, social links, and contact information
- Gallery with category filtering
- Community membership form
- Partner section and contact form
- Client sign-in and booking flow
- Admin event editor and transaction dashboard prototype

## Files

- [index.html](./index.html)
- [styles.css](./styles.css)
- [script.js](./script.js)
- [featured-events.js](./featured-events.js)
- [login.html](./login.html)
- [login.js](./login.js)
- [admin.html](./admin.html)
- [admin.js](./admin.js)
- [admin-auth.js](./admin-auth.js)

Featured event cards use React 18 from a CDN and keep static fallback cards if the CDN is unavailable. This is a browser-only prototype: sign-in is simulated, and bookings, events, and payment confirmations are stored in local browser storage. They are not secure, shared across devices, or suitable for real customers. It does not process Paystack payments. Before launch, add server-side authentication and role permissions, a shared database, and a Paystack backend that initializes and verifies transactions before recording bookings or allowing an admin to confirm payment.

Admin setup is limited to `owinocliff328@gmail.com` on first use. The admin can later change the email and password from the dashboard. Credentials are stored in browser-local storage (the password is salted and hashed), and the dashboard is omitted from public navigation and marked `noindex`; these client-side measures are only for the prototype and do not replace server-side authentication and access control.