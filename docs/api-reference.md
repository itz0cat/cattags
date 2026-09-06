# CatTags REST API Reference

Base URL: `https://cattags-api.onrender.com/api/v1`

## Endpoints

### 1. Health & Status

#### `GET /health`
Returns system and database health.
* Status: 200 OK (or 503 if database disconnected)
* Body:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "cattags-api",
  "database": "connected",
  "timestamp": "2026-09-06T00:00:00.000Z"
}
```

#### `GET /version`
Returns supported Minecraft versions and loader requirements.

#### `GET /config`
Returns client cache TTL, maximum batch size, and limits.

---

### 2. Minecraft Client Resolution

#### `POST /players/resolve`
High-efficiency batch player lookup used by the Fabric mod.
* Rate limit: 300 req/min
* Request:
```json
{
  "players": [
    { "username": "Steve", "uuid": "c06f8906-4c3e-4ba8-bc19-299ac4928940" },
    { "username": "ItzCat" }
  ]
}
```
* Response:
```json
{
  "players": [
    {
      "identifier": "steve",
      "username": "Steve",
      "uuid": "c06f8906-4c3e-4ba8-bc19-299ac4928940",
      "team": {
        "id": "team_8f29c4819d21",
        "slug": "nova",
        "name": "Nova Team",
        "prefix": "NOVA",
        "style": {
          "type": "GRADIENT",
          "colors": ["#3B82F6", "#06B6D4"],
          "direction": "LEFT_TO_RIGHT",
          "bold": true,
          "italic": false
        },
        "logo": null,
        "version": 3
      }
    }
  ],
  "timestamp": 1788652800000
}
```

---

### 3. Team Management

#### `GET /teams`
* Query parameters: `limit` (default: 50), `offset` (default: 0), `search`

#### `GET /teams/:id`
Returns full team details. Supports `ETag` / `If-None-Match` for HTTP 304 caching.

#### `POST /teams`
* Headers: `Authorization: Bearer <token>`
* Body:
```json
{
  "name": "Nova",
  "slug": "nova",
  "prefix": "NOVA",
  "description": "Top competitive team",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#06B6D4",
  "gradientEnabled": true,
  "style": {
    "type": "GRADIENT",
    "colors": ["#3B82F6", "#06B6D4"],
    "bold": true
  }
}
```

#### `POST /teams/:id/members`
* Headers: `Authorization: Bearer <token>`
* Body:
```json
{
  "minecraftUsername": "Steve",
  "role": "MEMBER"
}
```

#### `POST /teams/:id/verify`
Generates an in-game verification code for cracked/offline proof of ownership.
* Body: `{ "minecraftUsername": "Steve" }`
* Response:
```json
{
  "code": "NOVA-7K29",
  "command": "/team verify NOVA-7K29",
  "expiresInSeconds": 900
}
```
