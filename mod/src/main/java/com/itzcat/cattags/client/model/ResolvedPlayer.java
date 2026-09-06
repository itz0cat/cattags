package com.itzcat.cattags.client.model;

public class ResolvedPlayer {
    private String identifier;
    private String username;
    private String uuid;
    private CompactTeam team;

    public ResolvedPlayer() {}

    public ResolvedPlayer(String identifier, String username, String uuid, CompactTeam team) {
        this.identifier = identifier;
        this.username = username;
        this.uuid = uuid;
        this.team = team;
    }

    public String getIdentifier() { return identifier; }
    public String getUsername() { return username; }
    public String getUuid() { return uuid; }
    public CompactTeam getTeam() { return team; }
}
