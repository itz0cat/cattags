package com.itzcat.cattags;

import com.itzcat.cattags.client.cache.TeamCacheManager;
import com.itzcat.cattags.client.model.CompactTeam;
import com.itzcat.cattags.client.model.TeamStyle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class CacheManagerTest {

    private TeamCacheManager cacheManager;

    @BeforeEach
    public void setup(@TempDir File tempDir) {
        cacheManager = new TeamCacheManager();
        cacheManager.init(tempDir);
    }

    @Test
    public void testPlayerTeamCachingAndRetrieval() {
        TeamStyle style = new TeamStyle("GRADIENT", List.of("#3B82F6", "#06B6D4"), true, false);
        CompactTeam team = new CompactTeam("team_1", "nova", "Nova", "NOVA", style, null, 1);

        UUID uuid = UUID.randomUUID();
        cacheManager.cachePlayer("Steve", uuid, team);

        CompactTeam byName = cacheManager.getTeam("steve", null);
        assertNotNull(byName);
        assertEquals("NOVA", byName.getPrefix());

        CompactTeam byUuid = cacheManager.getTeam(null, uuid);
        assertNotNull(byUuid);
        assertEquals("Nova", byUuid.getName());

        assertEquals(1, cacheManager.getCachedPlayerCount());
        assertEquals(1, cacheManager.getCachedTeamCount());
    }

    @Test
    public void testCacheClear() {
        TeamStyle style = new TeamStyle("SOLID", List.of("#3B82F6"), false, false);
        CompactTeam team = new CompactTeam("team_2", "void", "Void", "VOID", style, null, 1);

        cacheManager.cachePlayer("Alex", null, team);
        assertEquals(1, cacheManager.getCachedPlayerCount());

        cacheManager.clear();
        assertEquals(0, cacheManager.getCachedPlayerCount());
        assertNull(cacheManager.getTeam("Alex", null));
    }
}
