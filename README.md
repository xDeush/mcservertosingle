# Minecraft World Tools

Two small, single-file browser tools for moving Minecraft worlds between servers and singleplayer. No install, no build step, no backend — open the HTML file (or the GitHub Pages link) and drop in a folder. Everything runs locally in your browser; nothing is ever uploaded anywhere.

## Tools

### ServerToSingleplayer
Repairs a world's `level.dat` after downloading it from a server. On a server, each player's position and inventory lives in `playerdata/`, keyed by UUID. Singleplayer doesn't read that — it only looks at the single `Player` tag baked into `level.dat`, which still has whatever it had before the world went on a server. This tool finds every player in `playerdata/` and builds a correct, ready-to-use `level.dat` for each one.

**Use this when:** you played on a server and want to load that world in singleplayer with your position and inventory intact.

### BukkitToVanilla
Merges a Bukkit-based world (Paper, Spigot, Purpur, ...) back into the single-folder layout Vanilla and Fabric expect. Bukkit-based servers store each dimension in its own top-level folder (`world/`, `world_nether/`, `world_the_end/`); Vanilla and Fabric only look for the Nether and End nested inside the main world folder as `DIM-1` and `DIM1`. This tool copies things into the right place and zips up one standard world folder.

**Use this when:** you're moving a Bukkit-based world to a Vanilla/Fabric server, or want your Nether and End to actually show up in singleplayer instead of regenerating empty.

## Using both together (for singleplayer)

Bukkit-based worlds need **both** tools before they'll play correctly offline — the two don't overlap, so the order doesn't matter:

1. **BukkitToVanilla** — merges the three folders into one.
2. **ServerToSingleplayer** — repairs `level.dat` with a player's position and inventory.

If you're only setting the world up for a Vanilla/Fabric **server** (not singleplayer), you only need BukkitToVanilla — servers already read `playerdata/` correctly on their own.

## Privacy

Both tools run entirely in your browser (vanilla JS, no framework). World files are read locally and never leave your machine — there's no server-side component at all. The only network calls are to publicly load a couple of small third-party libraries (JSZip, and — in ServerToSingleplayer — an avatar/nickname lookup by UUID) from public CDNs; your world data itself is never sent anywhere.

## Credits

Built by xDeush with the help from Claude Sonnet 5 :)
