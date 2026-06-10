# Tourist Place API

A REST API for discovering and managing tourist destinations. Built with Django REST Framework and SQLAlchemy, backed by PostgreSQL, with JWT authentication and interactive API documentation.

## Features

### User authentication

- **Sign up** — Register with name, email, and password (minimum 8 characters)
- **Login** — Authenticate with email and password; receive a JWT access token (valid for 1 hour)
- **Secure password storage** — Passwords hashed with Argon2 via Django's password hashers
- **JWT authentication** — Custom `SQLAlchemyJWTAuthentication` integrates Bearer tokens with SQLAlchemy user records
- **Role support** — Users are assigned a role (`user` by default) stored in the database

### Tourist places

- **List places** — Public endpoint with pagination and sorting
- **View place details** — Public read access for any place by ID
- **Create places** — Authenticated users can add new destinations
- **Update places** — Only the creator of a place can edit it
- **Delete places** — Only the creator of a place can remove it

Each place includes:

| Field         | Description                          |
|---------------|--------------------------------------|
| `name`        | Place name                           |
| `location`    | City or region                       |
| `country`     | Country                              |
| `description` | Optional text description            |
| `image_paths` | List of image file paths             |
| `created_at`  | Timestamp when the place was created |
| `created_by`  | User who created the place           |

### Pagination and sorting

The places list endpoint supports query parameters:

| Parameter   | Default | Description                                      |
|-------------|---------|--------------------------------------------------|
| `page`      | `1`     | Page number                                      |
| `page_size` | `10`    | Items per page (max 100)                         |
| `sort_by`   | `id`    | Sort field: `id`, `name`, `location`, `country`, `created_at` |
| `order`     | `asc`   | Sort direction: `asc` or `desc`                  |

Responses include `total_count`, `page`, `page_size`, and `results`.

### Request validation

- **Pydantic schemas** validate all request and response payloads
- Clear validation errors returned on invalid input (400 Bad Request)
- Partial updates supported on place edit (`PUT` with only changed fields)

### Permissions

| Endpoint                    | GET | POST | PUT | DELETE |
|-----------------------------|-----|------|-----|--------|
| `/api/place`                | Public | Authenticated | — | — |
| `/api/places/<id>/`         | Public | — | Creator only | Creator only |
| `/auth/signup`, `/auth/login` | Public | — | — | — |

### API documentation

- **OpenAPI schema** at `/!!!/schema/`
- **Swagger UI** at `/!!!/swagger/` for interactive testing
- Bearer JWT auth configured in Swagger for protected endpoints

### Database and migrations

- **PostgreSQL** as the primary data store via SQLAlchemy
- **Alembic** migrations for schema versioning (`users` and `places` tables)
- Hybrid setup: Django handles routing and auth; SQLAlchemy manages ORM and queries

## Tech stack

- Python 3
- Django 6.0
- Django REST Framework
- SQLAlchemy 2.0
- PostgreSQL (psycopg2)
- Pydantic 2
- PyJWT
- Alembic
- drf-spectacular (OpenAPI / Swagger)
- Argon2 password hashing

## Project structure

```
tourist_place/
├── backend/
│   ├── api/                    # Places API (views, models, schemas, mixins)
│   ├── user_management/        # Auth (signup, login, JWT, permissions)
│   ├── core/                   # Django settings, database, URLs
│   ├── alembic/                # Database migrations
│   └── manage.py
└── README.md
```

## Getting started

### Prerequisites

- Python 3.11+
- PostgreSQL running locally (default config uses port `5433`)

### Installation

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install django djangorestframework sqlalchemy psycopg2-binary pydantic PyJWT alembic drf-spectacular email-validator argon2-cffi django-csp
```

### Database setup

1. Create a PostgreSQL database (default name: `postgresTourist`).
2. Update `SQLALCHEMY_DATABASE_URL` in `backend/core/settings.py` if needed:

   ```
   postgresql+psycopg2://postgres:postgres@localhost:5433/postgresTourist
   ```

3. Run migrations:

   ```bash
   cd backend
   alembic upgrade head
   ```

### Run the server

```bash
cd backend
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/`.

## API endpoints

### Authentication

| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| POST   | `/auth/signup` | Register a new user      |
| POST   | `/auth/login`  | Login and get JWT token  |

**Signup request body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepass123"
}
```

**Login request body:**

```json
{
  "email": "jane@example.com",
  "password": "securepass123"
}
```

**Login response:**

```json
{
  "access_token": "<jwt>",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "created_at": "2026-06-10T12:00:00"
  }
}
```

Use the token in protected requests:

```
Authorization: Bearer <jwt>
```

### Places

| Method | Endpoint              | Auth     | Description        |
|--------|-----------------------|----------|--------------------|
| GET    | `/api/place`          | None     | List places (paginated, sortable) |
| POST   | `/api/place`          | Bearer   | Create a place     |
| GET    | `/api/places/<id>/`   | None     | Get place by ID    |
| PUT    | `/api/places/<id>/`   | Bearer (creator) | Update a place |
| DELETE | `/api/places/<id>/`   | Bearer (creator) | Delete a place |

**Create place request body:**

```json
{
  "name": "Eiffel Tower",
  "location": "Paris",
  "country": "France",
  "description": "Iconic iron lattice tower.",
  "image_paths": ["/images/eiffel-1.jpg", "/images/eiffel-2.jpg"]
}
```

**List places response:**

```json
{
  "total_count": 42,
  "page": 1,
  "page_size": 10,
  "results": [
    {
      "id": 1,
      "name": "Eiffel Tower",
      "location": "Paris",
      "country": "France",
      "description": "Iconic iron lattice tower.",
      "created_at": "2026-06-10T12:00:00",
      "image_paths": ["/images/eiffel-1.jpg"]
    }
  ]
}
```

## License

This project is for educational and development use.
