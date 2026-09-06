package com.itzcat.cattags.client.render;

import com.itzcat.cattags.client.model.TeamStyle;
import net.minecraft.text.MutableText;
import net.minecraft.text.Style;
import net.minecraft.text.Text;
import net.minecraft.text.TextColor;
import net.minecraft.util.Formatting;

import java.util.List;

public class StyleEngine {
    private static final int DEFAULT_COLOR = 0x3B82F6; // Electric Blue

    public static MutableText formatPrefix(String prefix, TeamStyle style) {
        if (prefix == null || prefix.isEmpty()) {
            return Text.empty();
        }

        MutableText formattedTag = Text.literal("[");
        formattedTag.setStyle(Style.EMPTY.withColor(Formatting.GRAY));

        MutableText innerText = Text.empty();
        if (style == null || style.getStyleType() == TeamStyle.Type.SOLID) {
            int color = parseColor(style != null && style.getColors() != null && !style.getColors().isEmpty() 
                    ? style.getColors().get(0) 
                    : "#3B82F6");
            Style textStyle = Style.EMPTY.withColor(TextColor.fromRgb(color));
            if (style != null && style.isBold()) textStyle = textStyle.withBold(true);
            if (style != null && style.isItalic()) textStyle = textStyle.withItalic(true);
            innerText.append(Text.literal(prefix).setStyle(textStyle));
        } else if (style.getStyleType() == TeamStyle.Type.RAINBOW) {
            long time = System.currentTimeMillis();
            for (int i = 0; i < prefix.length(); i++) {
                char c = prefix.charAt(i);
                float hue = ((time / 20.0f) + (i * 25.0f)) % 360.0f / 360.0f;
                int rgb = java.awt.Color.HSBtoRGB(hue, 0.85f, 1.0f) & 0xFFFFFF;
                Style charStyle = Style.EMPTY.withColor(TextColor.fromRgb(rgb));
                if (style.isBold()) charStyle = charStyle.withBold(true);
                if (style.isItalic()) charStyle = charStyle.withItalic(true);
                innerText.append(Text.literal(String.valueOf(c)).setStyle(charStyle));
            }
        } else if (style.getStyleType() == TeamStyle.Type.GRADIENT) {
            List<String> colors = style.getColors();
            if (colors == null || colors.isEmpty()) {
                colors = List.of("#3B82F6", "#60A5FA");
            }

            int len = prefix.length();
            for (int i = 0; i < len; i++) {
                char c = prefix.charAt(i);
                float progress = len > 1 ? (float) i / (float) (len - 1) : 0.0f;
                if ("RIGHT_TO_LEFT".equalsIgnoreCase(style.getDirection())) {
                    progress = 1.0f - progress;
                }
                int interpolatedRgb = interpolateMultiColor(colors, progress);
                Style charStyle = Style.EMPTY.withColor(TextColor.fromRgb(interpolatedRgb));
                if (style.isBold()) charStyle = charStyle.withBold(true);
                if (style.isItalic()) charStyle = charStyle.withItalic(true);
                innerText.append(Text.literal(String.valueOf(c)).setStyle(charStyle));
            }
        }

        formattedTag.append(innerText);
        formattedTag.append(Text.literal("] ").setStyle(Style.EMPTY.withColor(Formatting.GRAY)));
        return formattedTag;
    }

    public static int interpolateMultiColor(List<String> hexColors, float factor) {
        if (hexColors.isEmpty()) return DEFAULT_COLOR;
        if (hexColors.size() == 1) return parseColor(hexColors.get(0));

        factor = Math.max(0.0f, Math.min(1.0f, factor));
        float scaled = factor * (hexColors.size() - 1);
        int index = (int) scaled;
        if (index >= hexColors.size() - 1) {
            return parseColor(hexColors.get(hexColors.size() - 1));
        }

        float localFactor = scaled - index;
        int c1 = parseColor(hexColors.get(index));
        int c2 = parseColor(hexColors.get(index + 1));
        return lerpRgb(c1, c2, localFactor);
    }

    public static int lerpRgb(int c1, int c2, float t) {
        int r1 = (c1 >> 16) & 0xFF, g1 = (c1 >> 8) & 0xFF, b1 = c1 & 0xFF;
        int r2 = (c2 >> 16) & 0xFF, g2 = (c2 >> 8) & 0xFF, b2 = c2 & 0xFF;

        int r = (int) (r1 + (r2 - r1) * t);
        int g = (int) (g1 + (g2 - g1) * t);
        int b = (int) (b1 + (b2 - b1) * t);

        return (r << 16) | (g << 8) | b;
    }

    public static int parseColor(String hex) {
        if (hex == null || hex.isEmpty()) return DEFAULT_COLOR;
        String clean = hex.startsWith("#") ? hex.substring(1) : hex;
        try {
            return Integer.parseInt(clean, 16);
        } catch (NumberFormatException e) {
            return DEFAULT_COLOR;
        }
    }
}
