package com.itzcat.cattags.mixin;

import com.itzcat.cattags.client.config.CatTagsConfig;
import net.minecraft.client.gui.hud.ChatHud;
import net.minecraft.text.Text;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyVariable;

@Mixin(ChatHud.class)
public abstract class ChatHudMixin {

    @ModifyVariable(
            method = "addMessage(Lnet/minecraft/text/Text;)V",
            at = @At("HEAD"),
            argsOnly = true
    )
    private Text modifyChatMessage(Text message) {
        if (!CatTagsConfig.get().enabled || !CatTagsConfig.get().chatEnabled) {
            return message;
        }
        return message;
    }
}
