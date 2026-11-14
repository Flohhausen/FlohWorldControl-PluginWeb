package de.flohhausen.worldcontrol;

import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.BlockCommandSender;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;
import java.io.File;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class FlohWorldControlPlugin extends JavaPlugin {
    private final Map<String, BukkitTask> tasks = new ConcurrentHashMap<>();
    private File dataFile;
    private YamlConfiguration data;

    @Override public void onEnable() {
        saveDefaultConfig();
        dataFile = new File(getDataFolder(), "farms.yml");
        data = YamlConfiguration.loadConfiguration(dataFile);
        ConfigurationSection root = data.getConfigurationSection("farms");
        if (root != null) for (String name : root.getKeys(false))
            if (data.getBoolean("farms." + name + ".enabled")) schedule(name);
        getLogger().info("FlohWorldControl ist gestartet.");
    }

    @Override public void onDisable() {
        tasks.values().forEach(BukkitTask::cancel);
        tasks.clear();
        saveData();
    }

    @Override public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
        if (cmd.getName().equalsIgnoreCase("floh")) return handleFloh(sender, args);

        if (!sender.hasPermission("flohworldcontrol.admin")) {
            sender.sendMessage("§cKeine Berechtigung."); return true;
        }
        if (args.length < 2 || !args[0].equalsIgnoreCase("farm")) {
            sender.sendMessage("§e/base farm <create|trigger|output|interval|pulse|enable|disable|list>"); return true;
        }
        String action = args[1].toLowerCase(Locale.ROOT);
        if (action.equals("list")) {
            ConfigurationSection root = data.getConfigurationSection("farms");
            if (root == null || root.getKeys(false).isEmpty()) sender.sendMessage("§7Keine Farmen angelegt.");
            else for (String n : root.getKeys(false))
                sender.sendMessage("§e" + n + " §7" + (data.getBoolean("farms." + n + ".enabled") ? "aktiv" : "pausiert"));
            return true;
        }
        if (args.length < 3) { sender.sendMessage("§cFarmname fehlt."); return true; }
        String name = args[2].replaceAll("[^A-Za-z0-9_-]", "");
        if (name.isBlank()) { sender.sendMessage("§cUngültiger Name."); return true; }
        String p = "farms." + name;
        switch (action) {
            case "create" -> {
                if (!(sender instanceof Player player)) { sender.sendMessage("§cNur im Spiel."); return true; }
                if (data.contains(p)) { sender.sendMessage("§cFarm existiert bereits."); return true; }
                data.set(p + ".enabled", false);
                data.set(p + ".interval-minutes", getConfig().getLong("default-interval-minutes", 10));
                data.set(p + ".pulse-ticks", getConfig().getLong("default-pulse-ticks", 4));
                data.set(p + ".created-by", player.getUniqueId().toString());
                saveData(); sender.sendMessage("§aFarm " + name + " erstellt. Setze Trigger und Output.");
            }
            case "trigger", "output" -> {
                if (!(sender instanceof Player player)) { sender.sendMessage("§cNur im Spiel."); return true; }
                if (!data.contains(p)) { sender.sendMessage("§cFarm nicht gefunden."); return true; }
                Location l = player.getLocation().getBlock().getLocation();
                String key = action;
                data.set(p + "." + key + ".world", l.getWorld().getName());
                data.set(p + "." + key + ".x", l.getBlockX());
                data.set(p + "." + key + ".y", l.getBlockY());
                data.set(p + "." + key + ".z", l.getBlockZ());
                saveData(); sender.sendMessage("§a" + key + "-Position für " + name + " gespeichert.");
            }
            case "interval", "pulse" -> {
                if (args.length < 4 || !data.contains(p)) { sender.sendMessage("§cFarm oder Wert fehlt."); return true; }
                try {
                    long value = Long.parseLong(args[3]);
                    long max = action.equals("interval") ? 10080 : 40;
                    if (value < 1 || value > max) throw new NumberFormatException();
                    data.set(p + (action.equals("interval") ? ".interval-minutes" : ".pulse-ticks"), value);
                    saveData();
                    if (data.getBoolean(p + ".enabled")) schedule(name);
                    sender.sendMessage("§aWert gespeichert.");
                } catch (NumberFormatException ex) { sender.sendMessage("§cUngültiger Wert."); }
            }
            case "enable" -> {
                if (!data.contains(p)) { sender.sendMessage("§cFarm nicht gefunden."); return true; }
                data.set(p + ".enabled", true); saveData(); schedule(name); sender.sendMessage("§aFarm aktiviert.");
            }
            case "disable" -> {
                data.set(p + ".enabled", false); saveData(); cancel(name); sender.sendMessage("§cFarm pausiert.");
            }
            default -> sender.sendMessage("§cUnbekannte Aktion.");
        }
        return true;
    }


    private boolean handleFloh(CommandSender sender, String[] args) {
        if (!sender.hasPermission("flohworldcontrol.admin") && !(sender instanceof BlockCommandSender)) {
            sender.sendMessage("§cKeine Berechtigung."); return true;
        }
        if (args.length >= 3 && args[0].equalsIgnoreCase("tp")) {
            String action = args[1].toLowerCase(Locale.ROOT);
            if (action.equals("next")) {
                if (!(sender instanceof BlockCommandSender blockSender)) {
                    sender.sendMessage("§cDieser Befehl ist nur für den vorbereiteten Commandblock."); return true;
                }
                String name = cleanName(args[2]);
                String path = "teleports." + name;
                if (!data.contains(path + ".world")) return true;
                World world = Bukkit.getWorld(data.getString(path + ".world"));
                if (world == null) return true;
                Location target = new Location(world, data.getDouble(path + ".x"), data.getDouble(path + ".y"),
                    data.getDouble(path + ".z"), (float)data.getDouble(path + ".yaw"), (float)data.getDouble(path + ".pitch"));
                Location source = blockSender.getBlock().getLocation();
                Player nearest = Bukkit.getOnlinePlayers().stream()
                    .filter(player -> player.getWorld().equals(source.getWorld()))
                    .min((a, b) -> Double.compare(a.getLocation().distanceSquared(source), b.getLocation().distanceSquared(source)))
                    .orElse(null);
                if (nearest != null) nearest.teleport(target);
                return true;
            }
            if (action.equals("punkt") && args.length == 3 && args[2].equalsIgnoreCase("list")) {
                ConfigurationSection points = data.getConfigurationSection("teleports");
                if (points == null || points.getKeys(false).isEmpty()) sender.sendMessage("§7Keine Teleportpunkte gespeichert.");
                else sender.sendMessage("§eTeleportpunkte: §f" + String.join("§7, §f", points.getKeys(false)));
                return true;
            }
            if (action.equals("punkt") && args.length == 3) {
                if (!(sender instanceof Player player)) { sender.sendMessage("§cNur im Spiel."); return true; }
                String name = cleanName(args[2]);
                if (name.isBlank()) { sender.sendMessage("§cUngültiger Name."); return true; }
                Location loc = player.getLocation();
                String path = "teleports." + name;
                data.set(path + ".world", loc.getWorld().getName());
                data.set(path + ".x", loc.getX()); data.set(path + ".y", loc.getY()); data.set(path + ".z", loc.getZ());
                data.set(path + ".yaw", loc.getYaw()); data.set(path + ".pitch", loc.getPitch());
                saveData(); sender.sendMessage("§aTeleportpunkt §e" + name + " §agespeichert.");
                return true;
            }
            if (action.equals("block") && args.length == 3) {
                if (!(sender instanceof Player player)) { sender.sendMessage("§cNur im Spiel."); return true; }
                String name = cleanName(args[2]);
                if (!data.contains("teleports." + name + ".world")) { sender.sendMessage("§cTeleportpunkt nicht gefunden."); return true; }
                org.bukkit.inventory.ItemStack item = new org.bukkit.inventory.ItemStack(Material.COMMAND_BLOCK);
                org.bukkit.inventory.meta.ItemMeta rawMeta = item.getItemMeta();
                if (!(rawMeta instanceof org.bukkit.inventory.meta.BlockStateMeta meta)) {
                    sender.sendMessage("§cDieser Server unterstützt keine vorbereiteten Commandblock-Items."); return true;
                }
                org.bukkit.block.BlockState state = meta.getBlockState();
                if (!(state instanceof org.bukkit.block.CommandBlock commandBlock)) {
                    sender.sendMessage("§cCommandblock-Blockzustand nicht verfügbar."); return true;
                }
                commandBlock.setCommand("floh tp next " + name);
                meta.setBlockState(commandBlock);
                meta.setDisplayName("§6Teleport-Commandblock: §e" + name);
                meta.setLore(java.util.List.of("§7Teleportiert den nächstgelegenen", "§7Spieler zum gespeicherten Punkt."));
                item.setItemMeta(meta);
                player.getInventory().addItem(item).values().forEach(drop -> player.getWorld().dropItemNaturally(player.getLocation(), drop));
                sender.sendMessage("§aVorbereiteter Commandblock für §e" + name + " §aerhalten.");
                return true;
            }
        }
        sender.sendMessage("§e/Floh tp punkt <name|list> §7| §e/Floh tp block <name>");
        return true;
    }

    private String cleanName(String value) {
        return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_-]", "");
    }

    private void schedule(String name) {
        cancel(name);
        String p = "farms." + name;
        long ticks = Math.max(1, data.getLong(p + ".interval-minutes", 10)) * 1200L;
        tasks.put(name, Bukkit.getScheduler().runTaskTimer(this, () -> pulse(name), ticks, ticks));
    }
    private void cancel(String name) {
        BukkitTask old = tasks.remove(name);
        if (old != null) old.cancel();
    }
    private void pulse(String name) {
        String p = "farms." + name;
        String wn = data.getString(p + ".output.world");
        World w = wn == null ? null : Bukkit.getWorld(wn);
        if (w == null || !data.contains(p + ".output.x")) return;
        int x = data.getInt(p + ".output.x"), y = data.getInt(p + ".output.y"), z = data.getInt(p + ".output.z");
        if (!w.isChunkLoaded(x >> 4, z >> 4)) return;
        Block b = w.getBlockAt(x, y, z);
        if (b.getType() != Material.REDSTONE_BLOCK) return;
        b.setType(Material.AIR, false);
        long pulse = Math.max(1, Math.min(40, data.getLong(p + ".pulse-ticks", 4)));
        Bukkit.getScheduler().runTaskLater(this, () -> {
            if (w.isChunkLoaded(x >> 4, z >> 4)) {
                Block current = w.getBlockAt(x, y, z);
                if (current.getType() == Material.AIR) current.setType(Material.REDSTONE_BLOCK, false);
            }
        }, pulse);
        data.set(p + ".last-run", System.currentTimeMillis());
        saveData();
    }
    private void saveData() {
        try { data.save(dataFile); }
        catch (IOException ex) { getLogger().severe("Farmdaten konnten nicht gespeichert werden: " + ex.getMessage()); }
    }
}
