# FastAPI Microservice

## Project structure

```text
.
├── app/
│   ├── api/
│   │   ├── routes/       # HTTP route modules
│   │   └── router.py     # Route registration
│   ├── core/              # Configuration and security primitives
│   ├── schemas/           # Request and response models
│   ├── services/          # Business logic
│   ├── models/            # Database models
│   └── db.py              # Database session and engine
│   └── main.py            # Application factory
├── database/
│   └── users.db           # SQLite database (created automatically if missing)
├── tests/                 # Automated tests
├── main.py                # Uvicorn compatibility entry point
├── requirements.txt
└── .gitignore
```

## Run locally

Configuration is loaded from `.env`. `CORS_ORIGINS` accepts a comma-separated list of allowed frontend origins.

Install dependencies and start the service:

```bash
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload
```

The server runs at <http://127.0.0.1:8000>. Interactive API documentation is available at <http://127.0.0.1:8000/docs>.

## Endpoints

- `GET /` returns a greeting.
- `GET /health` returns the server health status.
- `POST /register` creates a user in SQLite from a JSON body.
- `POST /token` accepts the login form and returns a JWT.
- `GET /protected` requires a bearer token.
- `GET /tasks` lists the authenticated user's tasks.
- `POST /tasks` creates a task for the authenticated user.
- `PATCH /tasks/{task_id}` updates the status of one of that user's tasks.
- `DELETE /tasks/{task_id}` deletes one of that user's tasks.

The SQLite database is stored at `database/users.db`, relative to the backend project, regardless of the server's working directory. It is created automatically if missing; set `DATABASE_URL` to use a different database. Tasks are stored in this database. On startup, sample tasks are added for the seeded admin and up to three other existing users that do not already have tasks. Every task endpoint requires authentication and scopes access to the signed-in user's account.

## Authentication

The local demo credentials are `admin` / `admin`. The seeded demo account has the `admin` role; accounts created through registration receive the `user` role. New accounts require a username of 3–50 characters, a valid email address, and a password of 8–128 characters. Set `AUTH_SECRET_KEY` to a strong secret before using this outside local development.

Successful sign-in sets an `HttpOnly` authentication cookie with `SameSite=Lax`. For HTTPS deployments, set `AUTH_COOKIE_SECURE=true`; use `AUTH_COOKIE_SAMESITE=strict` for stricter same-site behavior. `SameSite=None` requires `AUTH_COOKIE_SECURE=true`. Bearer tokens remain supported for API clients, while the dashboard uses the cookie and does not store tokens in browser local storage.

Register from Bruno with JSON, then log in using `application/x-www-form-urlencoded` fields. Send the returned token as an `Authorization: Bearer <token>` header when calling `/protected`.

Example registration body:

```json
{"username": "brian", "email": "brian@example.com", "password": "admin1234"}
```
