package com.itzcat.cattags.client.cache;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.itzcat.cattags.client.model.CompactTeam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class TeamCacheManager {
    private static final Logger LOGGER = LoggerFactory.getLogger("TeamCacheManager");
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    private final Map<String, CompactTeam> usernameToTeam = new ConcurrentHashMap<>();
    private final Map<UUID, CompactTeam> uuidToTeam = new ConcurrentHashMap<>();
    private final Map<String, CompactTeam> teamById = new ConcurrentHashMap<>();

    private File cacheFile;

    public void init(File runDir) {
        File cacheDir = new File(runDir, "config" + File.separator + "cattags" + File.separator + "cache");
        if (!cacheDir.exists()) {
            cacheDir.mkdirs();
        }
        this.cacheFile = new File(cacheDir, "teams.json");
        loadFromDisk();
    }

    public CompactTeam getTeam(String username, UUID uuid) {
        if (username != null) {
            CompactTeam team = usernameToTeam.get(username.toLowerCase().trim());
            if (team != null) return team;
        }
        if (uuid != null) {
            return uuidToTeam.get(uuid);
        }
        return null;
    }

    public void cachePlayer(String username, UUID uuid, CompactTeam team) {
        if (team != null) {
            teamById.put(team.getId(), team);
            if (username != null) {
                usernameToTeam.put(username.toLowerCase().trim(), team);
            }
            if (uuid != null) {
                uuidToTeam.put(uuid, team);
            }
        } else {
            // Negative cache or removed
            if (username != null) usernameToTeam.remove(username.toLowerCase().trim());
            if (uuid != null) uuidToTeam.remove(uuid);
        }
    }

    public void saveToDisk() {
        if (cacheFile == null) return;
        try (FileWriter writer = new FileWriter(cacheFile)) {
            GSON.toJson(usernameToTeam, writer);
        } catch (Exception e) {
            LOGGER.error("Failed to save team cache to disk", e);
        }
    }

    public void loadFromDisk() {
        if (cacheFile == null || !cacheFile.exists()) return;
        try (FileReader reader = new FileReader(cacheFile)) {
            Type type = new TypeToken<Map<String, CompactTeam>>() {}.getType();
            Map<String, CompactTeam> loaded = GSON.fromJson(reader, type);
            if (loaded != null) {
                usernameToTeam.putAll(loaded);
                for (CompactTeam team : loaded.values()) {
                    if (team != null && team.getId() != null) {
                        teamById.put(team.getId(), team);
                    }
                }
                LOGGER.info("Loaded {} cached player team associations from disk", loaded.size());
            }
        } catch (Exception e) {
            LOGGER.error("Failed to load team cache from disk", e);
        }
    }

    public void clear() {
        usernameToTeam.clear();
        uuidToTeam.clear();
        teamById.clear();
        if (cacheFile != null && cacheFile.exists()) {
            cacheFile.delete();
        }
    }

    public int getCachedPlayerCount() {
        return usernameToTeam.size();
    }

    public int getCachedTeamCount() {
        return teamById.size();
    }
}
