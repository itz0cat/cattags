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
    }
}
