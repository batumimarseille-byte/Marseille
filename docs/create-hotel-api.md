# Create Hotel API

This endpoint creates a clean hotel tenant without manual database inserts.

## Vercel environment variables

Add these in Vercel project settings:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
CREATE_HOTEL_SECRET
```

Keep `SUPABASE_SERVICE_ROLE_KEY` private. It must never be exposed in frontend code.

## Endpoint

```text
POST /api/create-hotel
```

Headers:

```text
Content-Type: application/json
X-Setup-Secret: your-create-hotel-secret
```

The response includes `appUrl`, for example:

```text
/?hotel=demo-hotel
```

Use `supabase/create-hotel-api-example.json` as a starting payload.
