package com.itzcat.cattags.client;

import com.itzcat.cattags.client.api.CatTagsApiClient;
import com.itzcat.cattags.client.cache.TeamCacheManager;
import com.itzcat.cattags.client.command.CatTagsCommand;
import com.itzcat.cattags.client.config.CatTagsConfig;
import com.itzcat.cattags.client.render.LogoTextureManager;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.api.EnvType;
import net.fabricmc.api.Environment;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientLifecycleEvents;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.network.AbstractClientPlayerEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

@Environment(EnvType.CLIENT)
public class CatTagsClient implements ClientModInitializer {
    public static final Logger LOGGER = LoggerFactory.getLogger("CatTagsClient");

    private static TeamCacheManager cacheManager;
    private static CatTagsApiClient apiClient;
    private static LogoTextureManager logoManager;

    private int tickCounter = 0;

    @Override
    public void onInitializeClient() {
        MinecraftClient client = MinecraftClient.getInstance();

        cacheManager = new TeamCacheManager();
        cacheManager.init(client.runDirectory);

        apiClient = new CatTagsApiClient(cacheManager);

        logoManager = new LogoTextureManager();
        logoManager.init(client.runDirectory);

        CatTagsConfig.init(client.runDirectory);

        // Register client commands (/cattags)
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
            CatTagsCommand.register(dispatcher);
        });

        // Periodic batch player identity resolution
        ClientTickEvents.END_CLIENT_TICK.register(mc -> {
            if (mc.world == null || !CatTagsConfig.get().enabled) return;

            tickCounter++;
            if (tickCounter % 100 == 0) { // Check every 5 seconds (100 ticks)
                List<CatTagsApiClient.PlayerQuery> unverifiedPlayers = new ArrayList<>();
                for (AbstractClientPlayerEntity player : mc.world.getPlayers()) {
                    String name = player.getGameProfile().getName();
                    if (cacheManager.getTeam(name, player.getUuid()) == null) {
                        unverifiedPlayers.add(new CatTagsApiClient.PlayerQuery(name, player.getUuid()));
                    }
                }
                if (!unverifiedPlayers.isEmpty()) {
                    apiClient.resolvePlayersBatch(unverifiedPlayers);
                }
            }
        });

        // Save cache on client stopping
        ClientLifecycleEvents.CLIENT_STOPPING.register(mc -> {
            cacheManager.saveToDisk();
            CatTagsConfig.save();
        });

        LOGGER.info("CatTags client initialized successfully.");
    }

    public static TeamCacheManager getCacheManager() { return cacheManager; }
    public static CatTagsApiClient getApiClient() { return apiClient; }
    public static LogoTextureManager getLogoManager() { return logoManager; }
}
