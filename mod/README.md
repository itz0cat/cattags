# CatTags — Fabric 1.21.11 Client Mod

**CatTags** is a high-performance, persistent team identity and custom prefix system for Minecraft communities. It operates purely client-side: when players look at any registered team member in-game, in the tablist, or in chat, their custom team prefix, styling, colors, gradients, and badges are automatically displayed.

---

## Features

- **Fabric 1.21.11 Native**: Built specifically for Minecraft Java Edition 1.21.11 using Yarn mappings and Fabric Loader.
- **Cracked & Offline Support**: Works seamlessly on both online (Mojang UUID) and cracked/offline networks.
- **Custom Style Engine**:
  - Solid HEX colors (`#3B82F6`)
  - Two-color & Multi-color linear gradients (horizontal left-to-right interpolation)
  - Bold and italic prefix typography
  - Team badges / logo textures
- **Asynchronous & Zero-Lag**: Batch player identity resolution (`POST /api/v1/players/resolve`) with persistent LRU disk caching. Network calls never block the Minecraft render thread.
- **Mod Menu Integration**: Full compatibility with Mod Menu (`ModMenuApi`) plus an in-game config GUI.
- **In-Game Token Verification**: One-click in-game identity verification via `/cattags verify <code>` or `/team verify <code>`.

---

## In-Game Commands

| Command | Description |
|---|---|
| `/cattags status` | View client connection status, cached team counts, and active players |
| `/cattags config` | Open the interactive in-game configuration GUI |
| `/cattags reload` | Reload configuration and team database from disk |
| `/cattags clear` | Flush the local identity cache |
| `/cattags resolve <player>` | Force-resolve a player's team identity immediately |
| `/cattags verify <code>` | Verify your Minecraft identity for team membership |
| `/team verify <code>` | Shorthand verification command |

---

## Configuration

Configuration is saved at `.minecraft/config/cattags/config.json`.

```json
{
  "enabled": true,
  "backendUrl": "https://cattags-api.onrender.com",
  "nametagsEnabled": true,
  "tabListEnabled": true,
  "chatEnabled": false,
  "showLogos": true,
  "cacheTtlSeconds": 300,
  "debugMode": false
}
```

### Config Options

- `enabled` (*boolean*, default `true`): Master switch for the mod.
- `backendUrl` (*string*, default `"https://cattags-api.onrender.com"`): API endpoint used for player resolution and token verification.
- `nametagsEnabled` (*boolean*, default `true`): Render custom team prefix tags above player heads.
- `tabListEnabled` (*boolean*, default `true`): Render styled team prefixes in the player tablist list.
- `chatEnabled` (*boolean*, default `false`): Render styled prefixes preceding player names in the chat window.
- `showLogos` (*boolean*, default `true`): Display team icons/badges alongside prefixes when available.
- `cacheTtlSeconds` (*integer*, default `300`): Cache validity period before re-validating with the backend.
- `debugMode` (*boolean*, default `false`): Print verbose network and resolution logs in the client console.

---

## Mod Menu Compatibility

CatTags registers the official `modmenu` entrypoint (`com.itzcat.cattags.client.gui.CatTagsModMenu`). If Mod Menu is installed, you can configure all toggles visually from the Mods list in your Minecraft pause or title screen. You can also open this screen anytime in-game by typing `/cattags config`.

---

## Building from Source

Requirements:
- Java 21 JDK
- Gradle 8+

```bash
cd mod
gradle build
```

The compiled mod JAR will be located at:
`mod/build/libs/cattags-1.0.0.jar`
