package com.itzcat.cattags.client.api;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.itzcat.cattags.client.cache.TeamCacheManager;
import com.itzcat.cattags.client.config.CatTagsConfig;
import com.itzcat.cattags.client.model.CompactTeam;
import com.itzcat.cattags.client.model.ResolvedPlayer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

public class CatTagsApiClient {
    private static final Logger LOGGER = LoggerFactory.getLogger("CatTagsApiClient");
    private static final Gson GSON = new Gson();

    private final HttpClient httpClient;
    private final TeamCacheManager cacheManager;
    private final Set<String> pendingQueries = ConcurrentHashMap.newKeySet();

    public CatTagsApiClient(TeamCacheManager cacheManager) {
        this.cacheManager = cacheManager;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(4))
                .build();
    }

    public CompletableFuture<Void> resolvePlayersBatch(Collection<PlayerQuery> players) {
        if (players.isEmpty() || !CatTagsConfig.get().enabled) {
            return CompletableFuture.completedFuture(null);
        }

        List<PlayerQuery> toQuery = players.stream()
                .filter(p -> p.username() != null && pendingQueries.add(p.username().toLowerCase()))
                .limit(100)
                .toList();

        if (toQuery.isEmpty()) {
            return CompletableFuture.completedFuture(null);
        }

        String backendUrl = CatTagsConfig.get().backendUrl;
        if (backendUrl.endsWith("/")) {
            backendUrl = backendUrl.substring(0, backendUrl.length() - 1);
        }

        JsonObject body = new JsonObject();
        JsonArray array = new JsonArray();
        for (PlayerQuery p : toQuery) {
            JsonObject item = new JsonObject();
            item.addProperty("username", p.username());
            if (p.uuid() != null) {
                item.addProperty("uuid", p.uuid().toString());
            }
            array.add(item);
        }
        body.add("players", array);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(backendUrl + "/api/v1/players/resolve"))
                .header("Content-Type", "application/json")
                .header("User-Agent", "CatTags-Fabric-1.21.11")
                .timeout(Duration.ofSeconds(6))
                .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body)))
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    if (response.statusCode() == 200) {
                        handleBatchResponse(response.body());
                    } else {
                        LOGGER.warn("Backend returned status code {} on resolve", response.statusCode());
                    }
                })
                .exceptionally(ex -> {
                    // Graceful failure handling - never crash client
                    if (CatTagsConfig.get().debugMode) {
                        LOGGER.warn("CatTags backend unreachable, continuing with cached identities: {}", ex.getMessage());
                    }
                    return null;
                })
                .whenComplete((res, err) -> {
                    for (PlayerQuery p : toQuery) {
                        if (p.username() != null) {
                            pendingQueries.remove(p.username().toLowerCase());
                        }
                    }
                });
    }

    private void handleBatchResponse(String responseJson) {
        try {
            JsonObject json = GSON.fromJson(responseJson, JsonObject.class);
            if (json.has("players")) {
                JsonArray players = json.getAsJsonArray("players");
                for (int i = 0; i < players.size(); i++) {
                    JsonObject p = players.get(i).getAsJsonObject();
                    String username = p.has("username") && !p.get("username").isJsonNull() ? p.get("username").getAsString() : null;
                    UUID uuid = null;
                    if (p.has("uuid") && !p.get("uuid").isJsonNull()) {
                        try {
                            uuid = UUID.fromString(p.get("uuid").getAsString());
                        } catch (Exception ignored) {}
                    }

                    CompactTeam team = null;
                    if (p.has("team") && !p.get("team").isJsonNull()) {
                        team = GSON.fromJson(p.get("team"), CompactTeam.class);
                    }

                    cacheManager.cachePlayer(username, uuid, team);
                }
                cacheManager.saveToDisk();
            }
        } catch (Exception e) {
            LOGGER.error("Failed to parse player resolve response", e);
        }
    }

    public CompletableFuture<VerificationResult> verifyCode(String code, String minecraftUsername) {
        String backendUrl = CatTagsConfig.get().backendUrl;
        if (backendUrl.endsWith("/")) {
            backendUrl = backendUrl.substring(0, backendUrl.length() - 1);
        }

        JsonObject body = new JsonObject();
        body.addProperty("code", code.trim());
        if (minecraftUsername != null) {
            body.addProperty("minecraftUsername", minecraftUsername.trim());
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(backendUrl + "/api/v1/teams/verify/confirm"))
                .header("Content-Type", "application/json")
                .header("User-Agent", "CatTags-Fabric-1.21.11")
                .timeout(Duration.ofSeconds(8))
                .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body)))
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    try {
                        JsonObject json = GSON.fromJson(response.body(), JsonObject.class);
                        if (response.statusCode() == 200 && json.has("success") && json.get("success").getAsBoolean()) {
                            String message = json.has("message") ? json.get("message").getAsString() : "Successfully verified!";
                            return new VerificationResult(true, message);
                        } else {
                            String err = json.has("error") ? json.get("error").getAsString() : "Verification failed (" + response.statusCode() + ")";
                            return new VerificationResult(false, err);
                        }
                    } catch (Exception e) {
                        return new VerificationResult(false, "Failed to parse response: " + e.getMessage());
                    }
                })
                .exceptionally(ex -> new VerificationResult(false, "Network error: " + ex.getMessage()));
    }

    public record PlayerQuery(String username, UUID uuid) {}
    public record VerificationResult(boolean success, String message) {}
}
