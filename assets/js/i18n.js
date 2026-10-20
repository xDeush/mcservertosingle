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
      'status.noLevel': 'Couldn\'t find level.dat anywhere in that folder. Pick the server folder or a world folder (one with level.dat directly inside).',
      'status.noPrimary': 'Found Nether/End folders but not the main world next to them. Upload the whole server folder, or the main world together with its siblings.',
      'status.pick': 'Found {n} worlds in this folder. Pick one:',
      'status.levelErr': 'Couldn\'t read level.dat: {msg}',
      'status.zipErr': 'Something went wrong while zipping: {msg}',
      'status.someFailed': '{ok} ready, {failed} failed to read.',
      'status.noPlayers': 'No player files found next to this world, so there\'s nobody to restore. You can still download the merged world.',
      'players': '{n} player|{n} players',
      'worlds.ready': '{n} world ready|{n} worlds ready',
      'picker.players': '{n} player|{n} players',
      'root': '(root)',
      'player.loading': 'Looking up…',
      'player.unknown': 'Unknown player',
      'player.recent': 'last active',
      'stat.pos': 'Position', 'stat.dim': 'Dimension', 'stat.items': 'Items', 'stat.xp': 'XP level',
      'stat.processing': 'reading…',
      'stat.failed': 'Couldn\'t read: {msg}',
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
      'warn.large': 'Large world — zipping may be slow or hit your browser\'s memory limit. Chrome or Edge on desktop handle this best.',

      // hub
      'hub.title': 'ServerToSingleplayer',
      'hub.desc': 'Downloaded your Minecraft world from a server? Get your inventory, position and Nether/End back in singleplayer. Free, runs entirely in your browser.',
      'hub.kicker': 'mcservertosingle · world fixer',
      'hub.tag': 'runs 100% in your browser',
      'hub.h1': 'You got your world back,<br>but not <span class="accent">your playerdata.</span>',
      'hub.lede': 'Drop in the folder you got from your server host. The app figures out the rest: finds every player, puts the Nether and End back where singleplayer looks for them, and hands you a world that <strong>just works</strong> — no NBT editors, no file shuffling.',
      'hub.p1': 'Server or world folder',
      'hub.p1.hint': 'The whole server folder is fine — or just the world folder. Unzip it first if your host gave you a <code>.zip</code>.',
      'hub.p2': 'Who\'s playing?',
      'hub.p2.hint': 'Pick the player who will open the world in singleplayer. Everyone else keeps their own stuff automatically if they join over LAN.',
      'hub.p3': 'Get your world',
      'hub.do.merge': 'Merge the Nether and End back into the world folder',
      'hub.do.player': 'Load <b>{name}</b> with their inventory and position',
      'hub.do.player.modern': 'Set <b>{name}</b> as the singleplayer owner',
      'hub.do.nobody': 'Keep the world\'s player data as-is',
      'hub.do.clean': 'Remove the server lock file',
      'hub.dl.world': 'Download world (.zip)',
      'hub.dl.level': 'Just level.dat',
      'hub.after.1': 'Unzip the download — you get one folder, ready to use.',
      'hub.after.2': 'Move it into <code>.minecraft/saves/</code>.',
      'hub.after.3': 'Open Minecraft and play. Your stuff is where you left it.',
      'hub.after.level': 'Only took level.dat? Close Minecraft, then replace the <code>level.dat</code> in your world folder with the downloaded one (keep the name exactly <code>level.dat</code>).',
      'hub.tools': 'Need just one part?',
      'hub.tool.sts': 'Rebuild level.dat so singleplayer loads your inventory and position from the server\'s playerdata.',
      'hub.tool.btv': 'Merge world_nether and world_the_end back into one world, for singleplayer or a Vanilla/Fabric server.',
      'hub.why': 'Why does this happen?',
      'faq.q1': 'Why is my inventory empty when I open a server world in singleplayer?',
      'faq.a1': 'A server saves every player separately in <code>playerdata/</code>, by UUID. Older singleplayer versions read only one player, stored inside <code>level.dat</code> — which still has whatever was there before the world went on the server. So you spawn at the world spawn with nothing. This tool writes the right player into <code>level.dat</code>.',
      'faq.q2': 'Why are my Nether and End gone?',
      'faq.a2': 'Paper, Spigot and Purpur keep each dimension in its own folder (<code>world_nether</code>, <code>world_the_end</code>). Vanilla and Fabric only look inside the main world folder, so the game generates fresh, empty dimensions. This tool moves them back in.',
      'faq.q3': 'Does it work with Minecraft 26.1 and newer?',
      'faq.a3': 'Yes. 26.1 moved player data to <code>players/data/</code> and stores the singleplayer owner as a UUID in <code>level.dat</code>. The tool detects which format your world uses and writes the correct one. If the server ran in online mode and you play on the same account, 26.1+ often finds you on its own — but on offline-mode servers the UUIDs differ and you still need this.',
      'faq.q4': 'Is my world uploaded anywhere?',
      'faq.a4': 'No. Everything happens in your browser tab. The only network requests fetch player heads and nicknames by UUID so the cards look nice — your files never leave your computer.',
      'faq.q5': 'Can my friends get their items too?',
      'faq.a5': 'Yes. Open the world to LAN (or use a tunnel like e4mc) and they get their own inventories back automatically, matched by UUID. Only the person hosting in singleplayer needs the fixed <code>level.dat</code>.',
      'privacy': '<b>Private by design.</b> Your world is read straight from your disk by this page. No server, no uploads, no account — close the tab and it\'s gone.',

      // STS
      'sts.title': 'ServerToSingleplayer',
      'sts.desc': 'Rebuild level.dat so a Minecraft server world loads your inventory and position in singleplayer. Free, runs in your browser.',
      'sts.kicker': 'ServerToSingleplayer · world converter',
      'sts.h1': 'You got your world back,<br>but not <span class="accent">your playerdata.</span>',
      'sts.lede': 'Drop in your world folder and the app will handle the rest: find <code>level.dat</code> and every player in <code>playerdata/</code>, then build a repaired <code>level.dat</code> for each one — with their position and inventory. No NBT editor required.',
      'sts.p1': 'World folder',
      'sts.p1.hint': 'The folder with <code>level.dat</code> directly inside — e.g. the unzipped folder from your hosting provider.',
      'sts.p1.bukkit': 'On Paper or Spigot, your Nether and End live in separate folders. Use the <a class="link-accent" href="./">all-in-one fixer</a> to get those back in the same go.',
      'sts.p2': 'Repaired level.dat',
      'sts.single': 'Found one player in this world.',
      'sts.after': 'Singleplayer tracks only one player, so download the <code>level.dat</code> for whoever opens the world. Everyone else gets their own inventory back when they join over LAN, matched by UUID — they don\'t need a file.',
      'sts.after.1': 'Close Minecraft, so it doesn\'t overwrite the file.',
      'sts.after.2': 'Replace the <code>level.dat</code> in your world folder with the downloaded one — named exactly <code>level.dat</code>.',
      'sts.after.3': 'Open the world in singleplayer and enjoy having your playerdata back.',

      // BTV
      'btv.title': 'ServerToVanilla',
      'btv.desc': 'Convert a Paper/Spigot world to the Vanilla/Fabric layout so your Nether and End load. Free, runs in your browser.',
      'btv.kicker': 'BukkitToVanilla · world converter',
      'btv.h1': 'You lost your dimensions,<br>but you&#39;ll <span class="accent">get them back.</span>',
      'btv.lede': 'Drop in your server folder and the app will handle the rest: find <code>world/</code>, <code>world_nether/</code> and <code>world_the_end/</code>, then move the Nether and End inside a single world folder — no manual file shuffling.',
      'btv.p1': 'Server files',
      'btv.p1.hint': 'Upload the whole server folder, or the one folder that holds the three world folders.',
      'btv.p2': 'Converted worlds',
      'btv.dl': 'Download converted world (.zip)',
      'btv.after': 'Paper, Spigot and Purpur register each dimension as its own world, so the Nether and End get separate top-level folders. Vanilla and Fabric only read dimension data inside the main world folder. This tool copies the Nether and End there and zips one world laid out the way Vanilla and Fabric expect.',
      'btv.after.1': 'Unzip the download — you get one folder, ready to use.',
      'btv.after.2': 'Drop it into <code>saves/</code> for singleplayer. For a server, name it exactly <code>world</code> (or whatever <code>level-name</code> is in <code>server.properties</code>).',
      'btv.after.3': 'Playing it in singleplayer? Also run it through <a class="link-accent" href="server-to-singleplayer.html">ServerToSingleplayer</a> — or just use the <a class="link-accent" href="./">all-in-one fixer</a>.',
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
