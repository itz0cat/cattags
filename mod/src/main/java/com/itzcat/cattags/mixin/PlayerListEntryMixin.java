package com.itzcat.cattags.mixin;

import com.itzcat.cattags.client.CatTagsClient;
import com.itzcat.cattags.client.config.CatTagsConfig;
import com.itzcat.cattags.client.model.CompactTeam;
import com.itzcat.cattags.client.render.StyleEngine;
import com.mojang.authlib.GameProfile;
import net.minecraft.client.network.PlayerListEntry;
import net.minecraft.text.MutableText;
import net.minecraft.text.Text;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(PlayerListEntry.class)
public abstract class PlayerListEntryMixin {

    @Shadow @Final private GameProfile profile;

    @Inject(method = "getDisplayName", at = @At("RETURN"), cancellable = true)
    private void injectTabListTeamTag(CallbackInfoReturnable<Text> cir) {
        if (!CatTagsConfig.get().enabled || !CatTagsConfig.get().tabListEnabled) {
            return;
        }

        CompactTeam team = CatTagsClient.getCacheManager().getTeam(profile.name(), profile.id());
        if (team != null && team.getPrefix() != null && !team.getPrefix().isEmpty()) {
            Text baseName = cir.getReturnValue();
            if (baseName == null) {
                baseName = Text.literal(profile.name());
            }
            MutableText prefixText = StyleEngine.formatPrefix(team.getPrefix(), team.getStyle());
            cir.setReturnValue(prefixText.append(baseName));
        }
    }
}
