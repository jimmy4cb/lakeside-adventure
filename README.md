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
- [client-auth.js](./client-auth.js)
- [admin.html](./admin.html)
- [admin.js](./admin.js)
- [admin-auth.js](./admin-auth.js)

Featured event cards use React 18 from a CDN and keep static fallback cards if the CDN is unavailable. Client account credentials and bookings are stored in local browser storage; they are not secure or shared across devices. Booking checkout opens Paystack Inline using the selected event price, participant count, and signed-in client's email. The browser callback is not proof of payment. Before launch, add server-side authentication and role permissions, a shared database, and a Paystack backend that verifies transactions before recording bookings or allowing an admin to confirm payment.

The current admin sign-in is a local prototype, not secure access control. Do not use it for real admin data until authentication and authorization are enforced by a server.
