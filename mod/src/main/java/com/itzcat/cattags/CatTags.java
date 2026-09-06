package com.itzcat.cattags;

import net.fabricmc.api.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CatTags implements ModInitializer {
    public static final String MOD_ID = "cattags";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    @Override
    public void onInitialize() {
        LOGGER.info("CatTags initialized on common side");
    }
}
