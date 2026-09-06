package com.itzcat.cattags.client.render;

import net.minecraft.client.MinecraftClient;
import net.minecraft.client.texture.NativeImage;
import net.minecraft.client.texture.NativeImageBackedTexture;
import net.minecraft.util.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LogoTextureManager {
    private static final Logger LOGGER = LoggerFactory.getLogger("LogoTextureManager");
    private final Map<String, Identifier> teamToTexture = new ConcurrentHashMap<>();
    private final Set<String> downloadingUrls = ConcurrentHashMap.newKeySet();
    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private File logoCacheDir;

    public void init(File runDir) {
        this.logoCacheDir = new File(runDir, "config" + File.separator + "cattags" + File.separator + "cache" + File.separator + "logos");
        if (!logoCacheDir.exists()) {
            logoCacheDir.mkdirs();
        }
    }

    public Identifier getLogoTexture(String teamId, String logoUrl) {
        if (teamId == null || logoUrl == null || logoUrl.isEmpty()) {
            return null;
        }

        Identifier cachedId = teamToTexture.get(teamId);
        if (cachedId != null) {
            return cachedId;
        }

        if (downloadingUrls.add(logoUrl)) {
            executor.submit(() -> fetchAndRegisterLogo(teamId, logoUrl));
        }

        return null;
    }

    private void fetchAndRegisterLogo(String teamId, String logoUrl) {
        try {
            String hash = hashUrl(logoUrl);
            File cachedFile = new File(logoCacheDir, hash + ".png");

            if (!cachedFile.exists()) {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(logoUrl))
                        .timeout(Duration.ofSeconds(10))
                        .GET()
                        .build();

                HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
                if (response.statusCode() == 200) {
                    try (InputStream in = response.body(); FileOutputStream out = new FileOutputStream(cachedFile)) {
                        in.transferTo(out);
                    }
                } else {
                    LOGGER.warn("Failed to download logo from {}: HTTP {}", logoUrl, response.statusCode());
                    return;
                }
            }

            if (cachedFile.exists()) {
                MinecraftClient client = MinecraftClient.getInstance();
                client.execute(() -> {
                    try (FileInputStream fis = new FileInputStream(cachedFile)) {
                        NativeImage image = NativeImage.read(fis);
                        NativeImageBackedTexture texture = new NativeImageBackedTexture(image);
                        Identifier textureId = Identifier.of("cattags", "logo_" + teamId.toLowerCase().replace("-", "_"));
                        client.getTextureManager().registerTexture(textureId, texture);
                        teamToTexture.put(teamId, textureId);
                    } catch (Exception e) {
                        LOGGER.error("Failed to register native texture for team " + teamId, e);
                    }
                });
            }
        } catch (Exception e) {
            LOGGER.error("Error fetching logo for team " + teamId, e);
        } finally {
            downloadingUrls.remove(logoUrl);
        }
    }

    private String hashUrl(String url) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(url.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return Integer.toHexString(url.hashCode());
        }
    }
}
