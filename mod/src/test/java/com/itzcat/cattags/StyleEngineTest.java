package com.itzcat.cattags;

import com.itzcat.cattags.client.model.TeamStyle;
import com.itzcat.cattags.client.render.StyleEngine;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class StyleEngineTest {

    @Test
    public void testParseColor() {
        assertEquals(0x3B82F6, StyleEngine.parseColor("#3B82F6"));
        assertEquals(0x1D4ED8, StyleEngine.parseColor("1D4ED8"));
        assertEquals(0x3B82F6, StyleEngine.parseColor("invalid-color"));
    }

    @Test
    public void testLerpRgb() {
        int black = 0x000000;
        int white = 0xFFFFFF;

        assertEquals(black, StyleEngine.lerpRgb(black, white, 0.0f));
        assertEquals(white, StyleEngine.lerpRgb(black, white, 1.0f));

        int mid = StyleEngine.lerpRgb(black, white, 0.5f);
        int r = (mid >> 16) & 0xFF;
        int g = (mid >> 8) & 0xFF;
        int b = mid & 0xFF;
        assertEquals(127, r);
        assertEquals(127, g);
        assertEquals(127, b);
    }

    @Test
    public void testInterpolateMultiColor() {
        List<String> colors = List.of("#FF0000", "#00FF00", "#0000FF");

        int first = StyleEngine.interpolateMultiColor(colors, 0.0f);
        assertEquals(0xFF0000, first);

        int last = StyleEngine.interpolateMultiColor(colors, 1.0f);
        assertEquals(0x0000FF, last);
    }
}
