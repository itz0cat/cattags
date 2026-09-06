# CatTags Dashboard & Verification Guide

> **Official Guide by ItzCat**  
> Everything you need to know about the CatTags Web Dashboard, Team Appearance Customizer, Member Rosters, and In-Game Cracked Verification.

---

## 1. Why Are There "Add Member" AND "Verify" Options?

If you opened the team management page and wondered:  
*"Why is there an option to add a member, and also an option to verify a member? Why can't I just add them?"*

Here is the exact technical reason:

### The Cracked / Offline-Mode Problem
* In official Minecraft (online mode), Mojang's authentication servers verify every player's identity via Microsoft accounts.
* In **offline / cracked Minecraft**, anyone can launch their launcher and type any username they want (e.g., `ItzCat`, `Steve`, or `Dream`).
* If CatTags only allowed typing a username to get a team tag, **any random player could launch a cracked launcher with your username and impersonate your team!**

### The Solution: Two Roster States
1. **Direct Add (Unverified / Staged)**:  
   As the team owner, you can add any teammate by their Minecraft username. They are placed on your team roster. In the mod, they will get the team tag, but their status is unverified.
2. **In-Game Verification (`/team verify <code>`)**:  
   To prove that the person on your roster actually controls that Minecraft account on an active server, the dashboard generates a temporary secret token (e.g. `NOVA-7K29`).  
   The player enters their server and runs:
   ```mcfunction
   /team verify NOVA-7K29
   ```
   Once executed, the server confirms their ownership and marks them as **Verified** with a green shield badge in the dashboard and in-game!

---

## 2. Complete Dashboard Walkthrough

### Step 1: Create an Account & Log In
* Visit **[https://cattags-api.onrender.com](https://cattags-api.onrender.com)**.
* Click **Register** in the top right.
* Enter your Email, Password, and your in-game Minecraft Username (e.g. `ItzCat`).
* Once registered, you are automatically logged in and redirected to your **Dashboard**.

---

### Step 2: Register a New Team
1. In the top navbar, click **New Team** (or **Create New Team** on your dashboard).
2. Fill in the team profile:
   * **Team Name**: The full name of your squad (e.g. `Nova Esports`).
   * **URL Slug**: The unique identifier for your team URL (e.g. `nova`).
   * **Prefix**: The tag displayed in brackets next to names in Minecraft (max 10 characters, e.g. `NOVA`).
   * **Description**: A short bio for your team.
3. Select your styling:
   * Choose **Solid** or **Gradient**.
   * Pick your primary color and optional secondary color using the color picker.
   * Watch the **Live Nametag Preview** update in real-time as you change colors!
4. Click **Register Team**.

---

### Step 3: Customizing Team Appearance (Live Preview)
Inside your team's page under the **Appearance & Preview** tab:
* **Prefix Text**: Change your in-game bracket text at any time.
* **Style Mode**:
  * `SOLID`: Clean single-color tag (e.g. Electric Blue `#3B82F6`).
  * `GRADIENT`: Two-color linear interpolation across the characters (e.g. `#3B82F6` to `#06B6D4`).
  * `RAINBOW`: Smooth dynamic hue rotation cycle.
* **Font Styling**: Toggle **Bold** or **Italic**.
* **Live In-Game Preview Box**: Replicates the exact Minecraft nametag font, bracket formatting, and backdrop so you see what your tag looks like before saving.
* **Save Appearance**: Increments your team's sync version. All Minecraft clients running the mod will download the new style automatically on their next background sync.

---

### Step 4: Managing Team Members
Inside your team's page under the **Members** tab:
1. **Adding a Member**:
   * Type their exact Minecraft username in the input box.
   * Select their role (`Member` or `Admin`).
   * Click **Add**.
   * The teammate is now registered with your team!
2. **Verifying a Member**:
   * Click the **Verify** button next to their name.
   * A unique code is generated (e.g. `/team verify NOVA-8F21`).
   * Send that command to your teammate.
   * When they run it in-game, their badge turns to **Verified**!
3. **Removing a Member**:
   * Click the red trash icon next to any member to remove them from your team.

---

## 3. In-Game Mod Commands

Players running the CatTags Fabric 1.21.11 mod can run these commands in-game:

| Command | What it does |
|---|---|
| `/cattags status` | Shows connection status to Render backend and number of cached teams/players. |
| `/cattags reload` | Forces an immediate reload of configurations and team database from disk. |
| `/cattags clear` | Clears local cache if you want to perform a fresh sync. |
| `/cattags resolve <player>` | Immediately queries the backend for a specific player's team tag. |
| `/team verify <token>` | Verifies your Minecraft identity for cracked/offline proof of ownership. |

---

## 4. How the Technology Works Behind the Scenes

```
+-------------------+        Background Batch Sync        +-------------------+
|  Minecraft Client | <=================================> |  Render Cloud API |
|   (Fabric Mod)    |     POST /api/v1/players/resolve    |    (PostgreSQL)   |
+---------+---------+                                     +---------+---------+
          |                                                         |
          | Zero Frame-Drop Cache                                   | HTTPS
          v                                                         v
+-------------------+                                     +-------------------+
|  Local Disk JSON  |                                     |   Web Dashboard   |
|   (.minecraft)    |                                     | (Vite / React UI) |
+-------------------+                                     +-------------------+
```

1. **Zero Lag**: When you play Minecraft, the mod **never** freezes your game with network requests. It checks local RAM and disk cache instantly (`.minecraft/config/cattags/cache/teams.json`).
2. **Automatic Background Sync**: Every 5 seconds, an asynchronous background thread checks for newly joined players and asks the backend for their team tags in a single batch request.
3. **Graceful Offline Fallback**: If your internet drops or the server is updating, Minecraft will **never crash**. It simply continues displaying the cached team tags seamlessly.

---

## Summary Checklist
* **Web Dashboard**: [https://cattags-api.onrender.com](https://cattags-api.onrender.com)
* **Live Health Check**: [https://cattags-api.onrender.com/api/v1/health](https://cattags-api.onrender.com/api/v1/health)
* **GitHub Repository**: [https://github.com/itz0cat/cattags](https://github.com/itz0cat/cattags)
* **Minecraft Version**: 1.21.11 (Fabric) on Java 21
