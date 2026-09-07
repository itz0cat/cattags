package com.itzcat.cattags.mixin;

import com.itzcat.cattags.client.CatTagsClient;
import com.itzcat.cattags.client.config.CatTagsConfig;
import com.itzcat.cattags.client.model.CompactTeam;
import com.itzcat.cattags.client.render.StyleEngine;
import net.minecraft.client.render.VertexConsumerProvider;
import net.minecraft.client.render.entity.EntityRenderer;
import net.minecraft.client.util.math.MatrixStack;
import net.minecraft.entity.Entity;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.text.MutableText;
import net.minecraft.text.Text;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyVariable;

@Mixin(EntityRenderer.class)
public abstract class EntityRendererMixin<T extends Entity> {

    @ModifyVariable(
            method = "renderLabelIfPresent",
            at = @At("HEAD"),
            argsOnly = true,
            ordinal = 0
    )
    private Text modifyNametagLabel(Text originalText, T entity, Text text, MatrixStack matrices, VertexConsumerProvider vertexConsumers, int light) {
        if (!CatTagsConfig.get().enabled || !CatTagsConfig.get().nametagsEnabled) {
            return originalText;
        }

        if (entity instanceof PlayerEntity player) {
            CompactTeam team = CatTagsClient.getCacheManager().getTeam(player.getGameProfile().name(), player.getUuid());
            if (team != null && team.getPrefix() != null && !team.getPrefix().isEmpty()) {
                MutableText formattedPrefix = StyleEngine.formatPrefix(team.getPrefix(), team.getStyle());
                return formattedPrefix.append(originalText);
            }
        }
        return originalText;
    }
}
