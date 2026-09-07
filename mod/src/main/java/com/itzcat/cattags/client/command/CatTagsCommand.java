package com.itzcat.cattags.client.command;

import com.itzcat.cattags.client.CatTagsClient;
import com.itzcat.cattags.client.api.CatTagsApiClient;
import com.itzcat.cattags.client.config.CatTagsConfig;
import com.itzcat.cattags.client.model.CompactTeam;
import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;
import net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;

import java.util.List;

public class CatTagsCommand {
    public static void register(CommandDispatcher<FabricClientCommandSource> dispatcher) {
        dispatcher.register(ClientCommandManager.literal("cattags")
                .then(ClientCommandManager.literal("status")
                        .executes(ctx -> {
                            int teams = CatTagsClient.getCacheManager().getCachedTeamCount();
                            int players = CatTagsClient.getCacheManager().getCachedPlayerCount();
                            ctx.getSource().sendFeedback(Text.literal("CatTags: ")
                                    .formatted(Formatting.BLUE)
                                    .append(Text.literal(String.format("Active | %d teams, %d players cached", teams, players))
                                            .formatted(Formatting.WHITE)));
                            return 1;
                        }))
                .then(ClientCommandManager.literal("reload")
                        .executes(ctx -> {
                            CatTagsConfig.load();
                            CatTagsClient.getCacheManager().loadFromDisk();
                            ctx.getSource().sendFeedback(Text.literal("CatTags configuration and cache reloaded.")
                                    .formatted(Formatting.GREEN));
                            return 1;
                        }))
                .then(ClientCommandManager.literal("clear")
                        .executes(ctx -> {
                            CatTagsClient.getCacheManager().clear();
                            ctx.getSource().sendFeedback(Text.literal("CatTags local cache cleared.")
                                    .formatted(Formatting.YELLOW));
                            return 1;
                        }))
                .then(ClientCommandManager.literal("config")
                        .executes(ctx -> {
                            net.minecraft.client.MinecraftClient.getInstance().send(() -> {
                                net.minecraft.client.MinecraftClient.getInstance().setScreen(new com.itzcat.cattags.client.gui.CatTagsConfigScreen(null));
                            });
                            return 1;
                        }))
                .then(ClientCommandManager.literal("verify")
                        .then(ClientCommandManager.argument("code", StringArgumentType.string())
                                .executes(ctx -> {
                                    String code = StringArgumentType.getString(ctx, "code");
                                    String username = ctx.getSource().getPlayer() != null ?
                                            ctx.getSource().getPlayer().getGameProfile().name() :
                                            ctx.getSource().getClient().getSession().getUsername();

                                    ctx.getSource().sendFeedback(Text.literal("[CatTags] Verifying token " + code + " with backend...")
                                            .formatted(Formatting.YELLOW));

                                    CatTagsClient.getApiClient().verifyCode(code, username).thenAccept(result -> {
                                        if (result.success()) {
                                            ctx.getSource().sendFeedback(Text.literal("[CatTags] " + result.message())
                                                    .formatted(Formatting.GREEN));
                                            // Force resolve to refresh cache
                                            CatTagsClient.getApiClient().resolvePlayersBatch(List.of(
                                                    new CatTagsApiClient.PlayerQuery(username, null)
                                            ));
                                        } else {
                                            ctx.getSource().sendFeedback(Text.literal("[CatTags] Verification failed: " + result.message())
                                                    .formatted(Formatting.RED));
                                        }
                                    });
                                    return 1;
                                })))
                .then(ClientCommandManager.literal("resolve")
                        .then(ClientCommandManager.argument("player", StringArgumentType.word())
                                .executes(ctx -> {
                                    String player = StringArgumentType.getString(ctx, "player");
                                    CatTagsClient.getApiClient().resolvePlayersBatch(List.of(
                                            new CatTagsApiClient.PlayerQuery(player, null)
                                    )).thenRun(() -> {
                                        CompactTeam team = CatTagsClient.getCacheManager().getTeam(player, null);
                                        if (team != null) {
                                            ctx.getSource().sendFeedback(Text.literal("Player " + player + " is in team [" + team.getPrefix() + "] " + team.getName())
                                                    .formatted(Formatting.GREEN));
                                        } else {
                                            ctx.getSource().sendFeedback(Text.literal("No team found for player " + player)
                                                    .formatted(Formatting.RED));
                                        }
                                    });
                                    return 1;
                                })))
        );

        // Also register /team verify <code> as standard shorthand
        try {
            dispatcher.register(ClientCommandManager.literal("team")
                    .then(ClientCommandManager.literal("verify")
                            .then(ClientCommandManager.argument("code", StringArgumentType.string())
                                    .executes(ctx -> {
                                        String code = StringArgumentType.getString(ctx, "code");
                                        String username = ctx.getSource().getPlayer() != null ?
                                                ctx.getSource().getPlayer().getGameProfile().name() :
                                                ctx.getSource().getClient().getSession().getUsername();

                                        ctx.getSource().sendFeedback(Text.literal("[CatTags] Verifying token " + code + " with backend...")
                                                .formatted(Formatting.YELLOW));

                                        CatTagsClient.getApiClient().verifyCode(code, username).thenAccept(result -> {
                                            if (result.success()) {
                                                ctx.getSource().sendFeedback(Text.literal("[CatTags] " + result.message())
                                                        .formatted(Formatting.GREEN));
                                                CatTagsClient.getApiClient().resolvePlayersBatch(List.of(
                                                        new CatTagsApiClient.PlayerQuery(username, null)
                                                ));
                                            } else {
                                                ctx.getSource().sendFeedback(Text.literal("[CatTags] Verification failed: " + result.message())
                                                        .formatted(Formatting.RED));
                                            }
                                        });
                                        return 1;
                                    })))
            );
        } catch (Exception ignored) {
            // In case /team is already registered by server or another mod
        }
    }
}
