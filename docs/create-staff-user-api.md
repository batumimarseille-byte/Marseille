# Create staff user API

The hotel admin form uses `POST /api/create-staff-user` to create a Supabase Auth user and link that user to the current hotel.

## Server environment

Add these variables in Vercel Project Settings -> Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` must stay server-only. Do not expose it in Vite variables.

## Request

The frontend sends the current admin session in the `Authorization` header:

```http
Authorization: Bearer <admin_access_token>
```

Body:

```json
{
  "hotelId": "marseille",
  "email": "reception@example.com",
  "password": "strong-password",
  "displayName": "Reception",
  "position": "Reception",
  "role": "staff",
  "chatColor": "#4f7cff"
}
```

Only an active `admin` user from the same `hotel_id` can create staff users.

## Result

The API creates or updates the Supabase Auth user, then upserts a matching `hotel_users` profile for the same hotel. Staff users can sign in with their email and password, but they cannot create other staff users unless their role is changed to `admin`.
