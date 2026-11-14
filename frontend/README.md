# React + Vite

## Login API

The sign-in form sends `POST /token` to `http://localhost:8000` by default, using
`application/x-www-form-urlencoded` fields `grant_type=password`, `username`,
and `password`. The API must set the authentication JWT in an
`HttpOnly; Secure; SameSite` cookie. The browser sends credentials with the
login request; the frontend does not read or store the JWT.

The registration form sends `POST /register` to the same API host with a JSON
body containing `email`, `username`, and `password`. It accepts either an empty
successful response or a JSON response.

To use a different API host, set `VITE_API_BASE_URL` in a local `.env` file, for
example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

The JWT is not exposed to or stored by frontend JavaScript. The API must allow
credentialed CORS requests from the Vite app's exact origin and set the cookie
using `HttpOnly`, `Secure`, and an appropriate `SameSite` policy. Backend
endpoints must still enforce authorization; the dashboard gate is only a UI
state.

The dashboard is shown after successful login and is not restored after a page
refresh because no session-check endpoint is configured. Sign out currently
exits the dashboard locally; configure a backend logout endpoint that expires
the cookie before relying on sign out to invalidate the server session. The
dashboard uses sample workspace content.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
