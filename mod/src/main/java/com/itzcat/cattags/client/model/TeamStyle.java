package com.itzcat.cattags.client.model;

import java.util.List;

public class TeamStyle {
    public enum Type {
        SOLID,
        GRADIENT,
        RAINBOW
    }

    private String type = "SOLID";
    private List<String> colors;
    private String direction = "LEFT_TO_RIGHT";
    private boolean bold = true;
    private boolean italic = false;

    public TeamStyle() {}

    public TeamStyle(String type, List<String> colors, boolean bold, boolean italic) {
        this.type = type;
        this.colors = colors;
        this.bold = bold;
        this.italic = italic;
    }

    public Type getStyleType() {
        if ("GRADIENT".equalsIgnoreCase(type)) return Type.GRADIENT;
        if ("RAINBOW".equalsIgnoreCase(type)) return Type.RAINBOW;
        return Type.SOLID;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public List<String> getColors() { return colors; }
    public void setColors(List<String> colors) { this.colors = colors; }

    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }

    public boolean isBold() { return bold; }
    public void setBold(boolean bold) { this.bold = bold; }

    public boolean isItalic() { return italic; }
    public void setItalic(boolean italic) { this.italic = italic; }
}
