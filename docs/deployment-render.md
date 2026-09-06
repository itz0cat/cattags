# CatTags Render Deployment Guide

This guide details the deployment of the CatTags backend and database to Render.

## Prerequisites
* Authenticated Render CLI: `render whoami`
* GitHub repository: `https://github.com/itz0cat/cattags`

## Blueprint Deployment (`render.yaml`)

CatTags includes a standard Render Blueprint that provisions:
1. **Web Service (`cattags-api`)**: Node.js 20 runtime, exposes port `10000`, health check at `/api/v1/health`.
2. **PostgreSQL Database (`cattags-db`)**: Managed PostgreSQL instance with automated backups.

### Validating Blueprint Locally
```bash
render blueprints validate ./render.yaml
```

### Deploying via Render Dashboard
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **Blueprints** -> **New Blueprint Instance**.
3. Connect your repository `itz0cat/cattags`.
4. Render will parse `render.yaml` and create the web service and PostgreSQL database.
5. Database migrations execute automatically during startup via `npm run migrate`.

### Environment Variables
| Variable | Description | Managed By |
|---|---|---|
| `PORT` | Web service listening port (default: 10000) | Render |
| `NODE_ENV` | Environment mode (`production`) | `render.yaml` |
| `DATABASE_URL` | PostgreSQL connection string | Render Blueprint sync |
| `JWT_SECRET` | Secret key for signing auth tokens | Render auto-generated |
| `CORS_ORIGINS` | Permitted client origins | Configurable |
