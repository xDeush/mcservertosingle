// Tiny i18n: [data-i18n] -> textContent, [data-i18n-html] -> innerHTML
// (only our own strings, never world data), [data-i18n-attr="attr:key;..."].
(function(){
  const D = {
    en: {
      'nav.fix': 'Fix a world',
      'nav.sts': 'ServerToSingleplayer',
      'nav.btv': 'BukkitToVanilla',
      'footer.by': 'made by xDeush',
      'footer.local': 'nothing leaves your browser',
      'drop.main.world': 'Click to choose your world folder',
      'drop.main.server': 'Click to choose your server or world folder',
      'drop.sub': 'or drag it here',
      'status.reading': 'Reading files…',
      'status.scanning': 'Looking for worlds…',
      'status.noLevel': 'There’s no level.dat in that folder. Pick your server folder, or the world folder itself.',
      'status.noPrimary': 'I can see Nether/End folders, but not the main world next to them. Try the whole server folder.',
      'status.pick': 'Found {n} worlds in this folder. Pick one:',
      'status.levelErr': 'Couldn’t read level.dat: {msg}',
      'status.zipErr': 'Zipping failed: {msg}',
      'status.someFailed': '{ok} ready, {failed} failed to read.',
      'status.noPlayers': 'This world has no player files, so there’s no one to restore. You can still download it with the Nether and End merged.',
      'players': '{n} player|{n} players',
      'worlds.ready': '{n} world ready|{n} worlds ready',
      'picker.players': '{n} player|{n} players',
      'root': '(root)',
      'player.loading': 'Looking up…',
      'player.unknown': 'Unknown player',
      'player.recent': 'last active',
      'stat.pos': 'Position', 'stat.dim': 'Dimension', 'stat.items': 'Items', 'stat.xp': 'XP level',
      'stat.processing': 'reading…',
      'stat.failed': 'Couldn’t read: {msg}',
      'search': 'Search nickname or UUID…',
      'dl.forPlayer': 'level.dat for this player',
      'dl.all': 'All as ZIP',
      'dl.zipping': 'Zipping… {p}%',
      'det.world': 'World', 'det.layout': 'Server type', 'det.nether': 'Nether', 'det.end': 'End',
      'det.format': 'Format', 'det.players': 'Players', 'det.size': 'Size',
      'det.bukkit': 'Paper / Spigot (split)', 'det.vanilla': 'Vanilla / Fabric',
      'det.inside': 'in place', 'det.merge': 'will be merged', 'det.missing': 'not found',
      'det.modern': '26.1+', 'det.legacy': '1.21 or older',
      'det.included': 'included',
      'warn.large': 'This is a big world. Zipping can take a while, and some browsers run out of memory. Desktop Chrome or Edge works best.',

      // hub
      'hub.title': 'ServerToSingleplayer',
      'hub.desc': 'Downloaded your Minecraft world from a server? Get your inventory, position and Nether/End back in singleplayer. Free, runs entirely in your browser.',
      'hub.kicker': 'mcservertosingle · world fixer',
      'hub.tag': 'runs 100% in your browser',
      'hub.h1': 'You got your world back,<br>but not <span class="accent">your playerdata.</span>',
      'hub.lede': 'Drop in the folder from your server host. The page finds every player, moves the Nether and End back to where singleplayer looks for them, and gives you a world you can open straight away. No NBT editor, no moving files by hand.',
      'hub.p1': 'Server or world folder',
      'hub.p1.hint': 'The whole server folder works, or just the world folder. If your host gave you a <code>.zip</code>, unzip it first.',
      'hub.p2': 'Who’s playing?',
      'hub.p2.hint': 'Pick whoever is going to open the world in singleplayer. Friends who join over LAN get their own stuff back on their own.',
      'hub.p3': 'Get your world',
      'hub.do.merge': 'Merge the Nether and End back into the world folder',
      'hub.do.player': 'Load <b>{name}</b> with their inventory and position',
      'hub.do.player.modern': 'Set <b>{name}</b> as the singleplayer owner',
      'hub.do.nobody': 'Keep the world’s player data as-is',
      'hub.do.clean': 'Remove the server lock file',
      'hub.dl.world': 'Download world (.zip)',
      'hub.dl.level': 'Just level.dat',
      'hub.after.1': 'Unzip it. You get one folder.',
      'hub.after.2': 'Put that folder in <code>.minecraft/saves/</code>.',
      'hub.after.3': 'Open Minecraft. You’re back where you logged out, with your inventory.',
      'hub.after.level': 'Took just the level.dat? Close Minecraft and swap it with the <code>level.dat</code> in your world folder. Keep the name exactly <code>level.dat</code>.',
      'hub.tools': 'Only need one half?',
      'hub.tool.sts': 'Rebuild level.dat so singleplayer loads your inventory and position from the server’s playerdata.',
      'hub.tool.btv': 'Merge world_nether and world_the_end back into one world, for singleplayer or a Vanilla/Fabric server.',
      'hub.tools.line': 'There are separate pages for each fix: <a class="link-accent" href="server-to-singleplayer.html">ServerToSingleplayer</a> rebuilds level.dat from playerdata, and <a class="link-accent" href="BukkitToVanilla.html">BukkitToVanilla</a> merges world_nether and world_the_end back into one world (handy for moving to a Vanilla or Fabric server).',
      'hub.why': 'Why this happens',
      'faq.q1': 'Why is my inventory empty when I open a server world in singleplayer?',
      'faq.a1': 'A server keeps each player in its own file in <code>playerdata/</code>. Older singleplayer versions only read the one player stored inside <code>level.dat</code>, and that copy is from before the world went on the server. So you spawn at world spawn with nothing. This writes your player into <code>level.dat</code>.',
      'faq.q2': 'Why are my Nether and End gone?',
      'faq.a2': 'Paper, Spigot and Purpur put each dimension in its own folder (<code>world_nether</code>, <code>world_the_end</code>). Vanilla and Fabric only look inside the main world folder, don’t find them, and generate new empty ones. This moves them back inside.',
      'faq.q3': 'Does it work with Minecraft 26.1 and newer?',
      'faq.a3': 'Yes. 26.1 moved player files to <code>players/data/</code> and saves the singleplayer owner as a UUID in <code>level.dat</code>. The page checks which format your world is in and writes the right one. On an online-mode server with the same account, 26.1 may find you by itself. On offline-mode servers your UUID is different, so you still need this.',
      'faq.q4': 'Is my world uploaded anywhere?',
      'faq.a4': 'No. Your files are read by this tab and never sent anywhere. The only requests go out for player heads and names, looked up by UUID.',
      'faq.q5': 'Can my friends get their items too?',
      'faq.a5': 'Yes. Open the world to LAN (or use a tunnel like e4mc) and each friend gets their own inventory back, matched by UUID. Only the host needs the fixed <code>level.dat</code>.',

      // STS
      'sts.title': 'ServerToSingleplayer',
      'sts.desc': 'Rebuild level.dat so a Minecraft server world loads your inventory and position in singleplayer. Free, runs in your browser.',
      'sts.kicker': 'ServerToSingleplayer · world converter',
      'sts.h1': 'You got your world back,<br>but not <span class="accent">your playerdata.</span>',
      'sts.lede': 'Drop in your world folder. The page reads <code>level.dat</code> and every player in <code>playerdata/</code>, then builds a fixed <code>level.dat</code> for each of them with their position and inventory. No NBT editor needed.',
      'sts.p1': 'World folder',
      'sts.p1.hint': 'The folder with <code>level.dat</code> directly inside, like the unzipped folder from your host.',
      'sts.p1.bukkit': 'On Paper or Spigot your Nether and End are in separate folders. The <a class="link-accent" href="./">main page</a> fixes both at once.',
      'sts.p2': 'Repaired level.dat',
      'sts.single': 'Found one player in this world.',
      'sts.after': 'Singleplayer only tracks one player, so grab the <code>level.dat</code> for whoever opens the world. Friends joining over LAN get their own inventories back by UUID and don’t need a file.',
      'sts.after.1': 'Close Minecraft so it doesn’t overwrite the file.',
      'sts.after.2': 'Swap the downloaded file with the <code>level.dat</code> in your world folder. The name has to be exactly <code>level.dat</code>.',
      'sts.after.3': 'Open the world. Your playerdata is back.',

      // BTV
      'btv.title': 'ServerToVanilla',
      'btv.desc': 'Convert a Paper/Spigot world to the Vanilla/Fabric layout so your Nether and End load. Free, runs in your browser.',
      'btv.kicker': 'BukkitToVanilla · world converter',
      'btv.h1': 'You lost your dimensions,<br>but you&#39;ll <span class="accent">get them back.</span>',
      'btv.lede': 'Drop in your server folder. The page finds <code>world/</code>, <code>world_nether/</code> and <code>world_the_end/</code> and moves the Nether and End inside the main world folder, so you don’t have to do it by hand.',
      'btv.p1': 'Server files',
      'btv.p1.hint': 'Upload the whole server folder, or the one folder that holds the three world folders.',
      'btv.p2': 'Converted worlds',
      'btv.dl': 'Download converted world (.zip)',
      'btv.after': 'Paper, Spigot and Purpur treat each dimension as a separate world, so the Nether and End get their own folders. Vanilla and Fabric only read them from inside the main world folder. This copies them there and zips one world in the layout Vanilla and Fabric expect.',
      'btv.after.1': 'Unzip it. You get one folder.',
      'btv.after.2': 'For singleplayer, put it in <code>saves/</code>. For a server, name it <code>world</code> (or whatever <code>level-name</code> says in <code>server.properties</code>).',
      'btv.after.3': 'Playing in singleplayer? Run it through <a class="link-accent" href="server-to-singleplayer.html">ServerToSingleplayer</a> too, or use the <a class="link-accent" href="./">main page</a>, which does both.',
    },

  };

  const lang = 'en';

  // Plural forms: en "one|many", pl "one|many|few".
  function plural(forms, n){
    if(forms.length === 1) return forms[0];
    if(n === 1) return forms[0];
    if(lang === 'pl' && forms[2]){
      const m10 = n % 10, m100 = n % 100;
      if(m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[2];
    }
    return forms[1];
  }

  function t(key, vars){
    let s = (D[lang] && D[lang][key]) ?? D.en[key] ?? key;
    if(s.includes('|')) s = plural(s.split('|'), vars ? vars.n : 1);
    if(vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] !== undefined ? vars[k] : m);
    return s;
  }

  function apply(root){
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':');
        el.setAttribute(attr, t(key));
      });
    });
    const page = document.body.dataset.page;
    if(page){
      document.title = t(page + '.title');
      const md = document.querySelector('meta[name=description]');
      if(md) md.setAttribute('content', t(page + '.desc'));
    }
    document.documentElement.lang = lang;
  }

  document.addEventListener('DOMContentLoaded', () => apply());

  window.I18N = {t, apply};
})();
