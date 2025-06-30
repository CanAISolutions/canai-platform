# API Authentication Requirements (PRD Aligned)

## Authentication Middleware

- **Production**: All protected endpoints require a valid Memberstack JWT in the
  `Authorization: Bearer <token>` header.
- **Non-Production**: Authentication is bypassed for testing.
- **Error Responses**:
  - `401 Unauthorized` if the header is missing, malformed, or the token is invalid/expired.
- **PRD Alignment**: F2 (Discovery Funnel), F4 (Purchase Flow), F5 (Input Collection)

## Example Request

```http
GET /api/protected-endpoint
Authorization: Bearer <memberstack-jwt>
```

## Example Error Response

```json
{
  "error": "Missing or invalid Authorization header"
}
```

## Notes

- The backend verifies JWTs using Memberstack's JWKS endpoint.
- On success, user info is attached to `req.user` for downstream use.
