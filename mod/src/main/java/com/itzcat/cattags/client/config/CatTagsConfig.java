package com.itzcat.cattags.client.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class CatTagsConfig {
    private static final Logger LOGGER = LoggerFactory.getLogger("CatTagsConfig");
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    public boolean enabled = true;
    public String backendUrl = "https://cattags-api.onrender.com";
    public boolean nametagsEnabled = true;
    public boolean tabListEnabled = true;
    public boolean chatEnabled = false;
    public boolean showLogos = true;
    public int cacheTtlSeconds = 300;
    public boolean debugMode = false;

    private static CatTagsConfig instance;
    private static File configFile;

    public static CatTagsConfig get() {
        if (instance == null) {
            load();
        }
        return instance;
    }

    public static void init(File runDir) {
        File configDir = new File(runDir, "config" + File.separator + "cattags");
        if (!configDir.exists()) {
            configDir.mkdirs();
        }
        configFile = new File(configDir, "config.json");
        load();
    }

    public static void load() {
        if (configFile != null && configFile.exists()) {
            try (FileReader reader = new FileReader(configFile)) {
                instance = GSON.fromJson(reader, CatTagsConfig.class);
            } catch (Exception e) {
                LOGGER.error("Failed to load CatTags config, using defaults", e);
                instance = new CatTagsConfig();
            }
        }
        if (instance == null) {
            instance = new CatTagsConfig();
            save();
        }
    }

    public static void save() {
        if (configFile == null || instance == null) return;
        try (FileWriter writer = new FileWriter(configFile)) {
            GSON.toJson(instance, writer);
        } catch (IOException e) {
            LOGGER.error("Failed to save CatTags config", e);
        }
    }
}
