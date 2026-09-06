package com.itzcat.cattags.client.model;

public class CompactTeam {
    private String id;
    private String slug;
    private String name;
    private String prefix;
    private TeamStyle style;
    private String logo;
    private int version;

    public CompactTeam() {}

    public CompactTeam(String id, String slug, String name, String prefix, TeamStyle style, String logo, int version) {
        this.id = id;
        this.slug = slug;
        this.name = name;
        this.prefix = prefix;
        this.style = style;
        this.logo = logo;
        this.version = version;
    }

    public String getId() { return id; }
    public String getSlug() { return slug; }
    public String getName() { return name; }
    public String getPrefix() { return prefix; }
    public TeamStyle getStyle() { return style; }
    public String getLogo() { return logo; }
    public int getVersion() { return version; }

    public void setPrefix(String prefix) { this.prefix = prefix; }
    public void setStyle(TeamStyle style) { this.style = style; }
}
