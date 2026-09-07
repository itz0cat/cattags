package com.itzcat.cattags.client.gui;

import com.itzcat.cattags.client.config.CatTagsConfig;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.text.Text;

public class CatTagsConfigScreen extends Screen {
    private final Screen parent;

    public CatTagsConfigScreen(Screen parent) {
        super(Text.literal("CatTags Configuration"));
        this.parent = parent;
    }

    @Override
    protected void init() {
        CatTagsConfig config = CatTagsConfig.get();
        int centerX = this.width / 2;
        int startY = 40;
        int spacing = 24;

        // Enabled Toggle
        this.addDrawableChild(ButtonWidget.builder(
                getToggleText("Mod Status", config.enabled),
                button -> {
                    config.enabled = !config.enabled;
                    button.setMessage(getToggleText("Mod Status", config.enabled));
                }
        ).dimensions(centerX - 105, startY, 210, 20).build());

        // Nametags Toggle
        this.addDrawableChild(ButtonWidget.builder(
                getToggleText("Nametag Tags", config.nametagsEnabled),
                button -> {
                    config.nametagsEnabled = !config.nametagsEnabled;
                    button.setMessage(getToggleText("Nametag Tags", config.nametagsEnabled));
                }
        ).dimensions(centerX - 105, startY + spacing, 210, 20).build());

        // Tab List Toggle
        this.addDrawableChild(ButtonWidget.builder(
                getToggleText("Tab List Prefixes", config.tabListEnabled),
                button -> {
                    config.tabListEnabled = !config.tabListEnabled;
                    button.setMessage(getToggleText("Tab List Prefixes", config.tabListEnabled));
                }
        ).dimensions(centerX - 105, startY + spacing * 2, 210, 20).build());

        // Chat Toggle
        this.addDrawableChild(ButtonWidget.builder(
                getToggleText("Chat Prefixes", config.chatEnabled),
                button -> {
                    config.chatEnabled = !config.chatEnabled;
                    button.setMessage(getToggleText("Chat Prefixes", config.chatEnabled));
                }
        ).dimensions(centerX - 105, startY + spacing * 3, 210, 20).build());

        // Show Logos Toggle
        this.addDrawableChild(ButtonWidget.builder(
                getToggleText("Team Logos/Badges", config.showLogos),
                button -> {
                    config.showLogos = !config.showLogos;
                    button.setMessage(getToggleText("Team Logos/Badges", config.showLogos));
                }
        ).dimensions(centerX - 105, startY + spacing * 4, 210, 20).build());

        // Done / Save Button
        this.addDrawableChild(ButtonWidget.builder(
                Text.literal("Save & Done"),
                button -> {
                    CatTagsConfig.save();
                    if (this.client != null) {
                        this.client.setScreen(this.parent);
                    }
                }
        ).dimensions(centerX - 105, startY + spacing * 6, 210, 20).build());
    }

    private Text getToggleText(String label, boolean value) {
        return Text.literal(label + ": " + (value ? "§aON" : "§cOFF"));
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        super.render(context, mouseX, mouseY, delta);
        context.drawCenteredTextWithShadow(this.textRenderer, this.title, this.width / 2, 18, 0xFFFFFF);
    }

    @Override
    public void close() {
        CatTagsConfig.save();
        if (this.client != null) {
            this.client.setScreen(this.parent);
        }
    }
}
