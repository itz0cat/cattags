# CatTags Architecture

## System Overview

CatTags operates as a distributed system uniting Minecraft clients with a centralized team identity backend:

```
+-------------------------------------------------------------+
|                      Minecraft Client                       |
|  +---------------------+        +------------------------+  |
|  |   EntityRenderer    |        |    PlayerListEntry     |  |
|  |     (Nametags)      |        |       (Tab List)       |  |
|  +----------+----------+        +-----------+------------+  |
|             |                               |               |
|             v                               v               |
|  +-------------------------------------------------------+  |
|  |                      StyleEngine                      |  |
|  +--------------------------+----------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  |                   TeamCacheManager                    |  |
|  |             (Memory Map + Disk JSON)                  |  |
|  +--------------------------+----------------------------+  |
|                             |                               |
|                             v (Async Batch Queries)         |
|  +-------------------------------------------------------+  |
|  |                   CatTagsApiClient                    |  |
|  +--------------------------+----------------------------+  |
+-----------------------------|-------------------------------+
                              | HTTP POST /api/v1/players/resolve
                              v
+-------------------------------------------------------------+
|                     Render Cloud Host                       |
|                                                             |
|  +-------------------------------------------------------+  |
|  |                  CatTags REST API                     |  |
|  |   - Express / TypeScript (Node.js 20)                 |  |
|  |   - Rate Limiter (300 req/min)                        |  |
|  |   - Health check (/api/v1/health)                     |  |
|  +--------------------------+----------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  |                  PostgreSQL Database                  |  |
|  |   - Indexed player_identifiers                        |  |
|  |   - Teams, Members, Logos, Tokens                     |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
                              ^
                              | HTTPS Web Administration
+-----------------------------|-------------------------------+
|                    CatTags Web Dashboard                    |
|   - Vite + React + TypeScript + Tailwind CSS                |
|   - Live Minecraft Nametag Preview                          |
|   - Team Roster & Verification Token Generation             |
+-------------------------------------------------------------+
```

## Resilience & Zero Frame Drops

* **Non-blocking Rendering**: Rendering code in Mixins queries the `TeamCacheManager` synchronously from local memory. Lookups take sub-microsecond time.
* **Background HTTP**: The `CatTagsApiClient` runs exclusively on a background executor pool. Minecraft render threads are never blocked.
* **Offline Fallback**: If the server drops offline, the client continues serving cached team identities indefinitely.
