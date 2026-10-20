// Shared world logic: reading folders, detecting layout, patching level.dat,
// zipping. Everything stays in the browser.
//
// Entries are {path, file} where path is the folder-relative path using "/".
// Paths and NBT strings come from user-supplied worlds, so anything that ends
// up in innerHTML must go through esc().
(function(){
  const {T} = NBT;

  function esc(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ---------- reading folders ----------
  function fromFileList(list){
    return Array.from(list).map(f => ({path: f.webkitRelativePath || f.name, file: f}));
  }

  function readAllEntries(reader){
    return new Promise((resolve, reject) => {
      const out = [];
      (function next(){
        reader.readEntries(batch => {
          if(!batch.length) return resolve(out);
          out.push(...batch); next();
        }, reject);
      })();
    });
  }

  async function walk(entry, out){
    if(entry.isFile){
      const file = await new Promise((res, rej) => entry.file(res, rej));
      out.push({path: entry.fullPath.replace(/^\//, ''), file});
    }else if(entry.isDirectory){
      for(const child of await readAllEntries(entry.createReader())) await walk(child, out);
    }
  }

  async function fromDataTransfer(dt){
    const roots = Array.from(dt.items || [])
      .filter(i => i.kind === 'file')
      .map(i => i.webkitGetAsEntry && i.webkitGetAsEntry())
      .filter(Boolean);
    if(!roots.length) return fromFileList(dt.files || []);
    const out = [];
    for(const r of roots) await walk(r, out);
    return out;
  }

  // Wires a <label class="dropzone"> + hidden folder input. onEntries gets
  // the normalized entry list from either path.
  function bindDropzone(zone, input, onEntries, onReading){
    let depth = 0;
    zone.addEventListener('dragenter', e => { e.preventDefault(); depth++; zone.classList.add('drag'); });
    zone.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    zone.addEventListener('dragleave', () => { if(--depth <= 0){ depth = 0; zone.classList.remove('drag'); } });
    zone.addEventListener('drop', async e => {
      e.preventDefault(); depth = 0; zone.classList.remove('drag');
      if(onReading) onReading();
      onEntries(await fromDataTransfer(e.dataTransfer));
    });
    input.addEventListener('change', () => {
      onEntries(fromFileList(input.files));
      input.value = '';
    });
  }

  // ---------- layout detection ----------
  const DIMS = {
    nether: {suffix:'_nether', legacy:'DIM-1', modern:'dimensions/minecraft/the_nether'},
    end:    {suffix:'_the_end', legacy:'DIM1', modern:'dimensions/minecraft/the_end'},
  };

  function hasPrefix(entries, prefix){
    return entries.some(e => e.path.startsWith(prefix));
  }

  // Every level.dat marks a world folder. Bukkit-based servers (Paper, Spigot,
  // Purpur) give world / world_nether / world_the_end each their own level.dat,
  // so group siblings by parent + base name.
  function analyze(entries){
    const groups = new Map();
    for(const e of entries){
      const parts = e.path.split('/');
      if(parts[parts.length - 1] !== 'level.dat') continue;
      const segs = parts.slice(0, -1);
      const folder = segs[segs.length - 1] || '';
      const parentPath = segs.slice(0, -1).join('/');
      let baseName = folder, kind = 'primary';
      if(folder.endsWith(DIMS.end.suffix)){ baseName = folder.slice(0, -DIMS.end.suffix.length); kind = 'end'; }
      else if(folder.endsWith(DIMS.nether.suffix)){ baseName = folder.slice(0, -DIMS.nether.suffix.length); kind = 'nether'; }
      const key = parentPath + '::' + baseName;
      if(!groups.has(key)) groups.set(key, {baseName: baseName || 'world', parentPath, primary:null, nether:null, end:null});
      const g = groups.get(key);
      g[kind] = {path: segs.join('/'), levelFile: e.file};
    }

    const worlds = [];
    for(const g of groups.values()){
      if(!g.primary) continue;
      const root = g.primary.path ? g.primary.path + '/' : '';
      const players = [];
      for(const e of entries){
        if(!e.path.startsWith(root)) continue;
        const rest = e.path.slice(root.length);
        const m = /^(playerdata|players\/data)\/([0-9a-fA-F-]{32,36})\.dat$/.exec(rest);
        if(m) players.push({uuid: m[2].toLowerCase(), file: e.file, modern: m[1] !== 'playerdata'});
      }
      players.sort((a, b) => (b.file.lastModified || 0) - (a.file.lastModified || 0));
      const modern = players.some(p => p.modern) || hasPrefix(entries, root + 'dimensions/');
      const dims = {};
      for(const k of ['nether', 'end']) dims[k] = resolveDim(entries, g, k, modern);
      worlds.push({
        name: g.baseName,
        parentPath: g.parentPath,
        root: g.primary.path,
        levelFile: g.primary.levelFile,
        players,
        modern,
        split: !!(g.nether || g.end),
        dims,
      });
    }
    // Worlds with players first, then by player count.
    worlds.sort((a, b) => b.players.length - a.players.length);
    return worlds;
  }

  // Where a dimension's data lives and where it should go in the merged world.
  // status: 'inside' (already in the primary folder), 'merge' (from a Bukkit
  // sibling folder), or 'missing'.
  function resolveDim(entries, g, kind, modern){
    const d = DIMS[kind];
    const root = g.primary.path ? g.primary.path + '/' : '';
    const sib = g[kind];
    if(sib){
      const base = sib.path + '/';
      for(const layout of [d.legacy, d.modern]){
        if(hasPrefix(entries, base + layout + '/')) return {status:'merge', from: base + layout + '/', to: layout + '/', legacy:false};
      }
      return {status:'merge', from: base, to: (modern ? d.modern : d.legacy) + '/', legacy:true};
    }
    for(const layout of [d.legacy, d.modern]){
      if(hasPrefix(entries, root + layout + '/region/')) return {status:'inside'};
    }
    return {status:'missing'};
  }

  const LEGACY_SKIP = new Set(['level.dat', 'level.dat_old', 'session.lock', 'uid.dat']);

  // Files for a single, standard world folder: the primary world plus any
  // Bukkit-split dimensions moved to where Vanilla/Fabric read them.
  function mergedEntries(entries, world, folderName){
    const out = [];
    const root = world.root ? world.root + '/' : '';
    const top = folderName + '/';
    for(const e of entries){
      if(e.path.startsWith(root) && e.path.slice(root.length) !== 'session.lock') out.push({zipPath: top + e.path.slice(root.length), file: e.file});
    }
    for(const k of ['nether', 'end']){
      const d = world.dims[k];
      if(d.status !== 'merge') continue;
      for(const e of entries){
        if(!e.path.startsWith(d.from)) continue;
        const rest = e.path.slice(d.from.length);
        if(d.legacy && LEGACY_SKIP.has(rest)) continue;
        out.push({zipPath: top + d.to + rest, file: e.file});
      }
    }
    return out;
  }

  // ---------- players ----------
  function hyphenate(u){
    u = u.replace(/-/g, '');
    return u.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
  }

  function uuidToInts(u){
    const h = u.replace(/-/g, '');
    const out = new Int32Array(4);
    for(let i = 0; i < 4; i++) out[i] = parseInt(h.slice(i * 8, i * 8 + 8), 16) | 0;
    return out;
  }

  async function readNbt(file){
    return NBT.parse(NBT.inflate(new Uint8Array(await file.arrayBuffer())));
  }

  function playerStats(tag){
    const v = tag.value;
    const pos = v.get('Pos');
    const dim = v.get('Dimension');
    const inv = v.get('Inventory');
    const xp = v.get('XpLevel');
    const health = v.get('Health');
    const gm = v.get('playerGameType');
    return {
      pos: pos ? pos.value.items.map(n => Math.round(n)).join(', ') : '—',
      dim: dim ? String(dim.value).replace('minecraft:', '').replace(/^the_/, '') : '—',
      items: inv ? inv.value.items.length : 0,
      xp: xp ? xp.value : 0,
      health: health ? Math.round(health.value) : null,
      gamemode: gm ? gm.value : null,
    };
  }

  // Returns gzipped level.dat bytes that make singleplayer load `player`.
  // Pre-26.1 (DataVersion < 4772) embeds the player under Data.Player.
  // 26.1+ keeps players in players/data/ and points at them via
  // Data.singleplayer_uuid, so only the UUID is set.
  function patchLevel(levelRaw, player, playerTag){
    const level = NBT.parse(levelRaw);
    const data = level.value.get('Data').value;
    const dv = data.get('DataVersion');
    const modern = player.modern || (dv && dv.value >= 4772);
    if(modern){
      data.delete('Player');
      data.set('singleplayer_uuid', {type: T.INT_ARRAY, value: uuidToInts(player.uuid)});
    }else{
      data.set('Player', {type: T.COMPOUND, value: playerTag.value});
    }
    return pako.gzip(NBT.write(level));
  }

  // ---------- profiles (best effort, never required) ----------
  const nameCache = new Map();
  function avatarUrl(uuid){ return `https://render.crafty.gg/2d/head/${encodeURIComponent(hyphenate(uuid))}?size=80`; }
  const FALLBACK_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="#171b23"/><rect x="4" y="3" width="8" height="7" fill="#3a4150"/><rect x="5" y="11" width="6" height="3" fill="#3a4150"/></svg>');
  function lookupName(uuid){
    const id = hyphenate(uuid);
    if(!nameCache.has(id)){
      nameCache.set(id, fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(id)}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => (d && d.data && d.data.player && d.data.player.username) || null)
        .catch(() => null));
    }
    return nameCache.get(id);
  }

  // ---------- downloads ----------
  function download(blob, name){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  // files: [{zipPath, file|data}]. Stored (no compression) for region files —
  // they're already compressed and deflating them again only burns time.
  async function zipAndDownload(files, name, onProgress){
    const zip = new JSZip();
    for(const f of files){
      const store = /\.(mca|mcc|png|gz|zip)$/i.test(f.zipPath);
      zip.file(f.zipPath, f.data || f.file, store ? {compression:'STORE'} : {compression:'DEFLATE', compressionOptions:{level:5}});
    }
    const blob = await zip.generateAsync({type:'blob', streamFiles:true}, m => onProgress && onProgress(m.percent));
    download(blob, name);
  }

  function formatBytes(n){
    if(n < 1024) return n + ' B';
    const u = ['KB', 'MB', 'GB', 'TB'];
    let i = -1;
    do{ n /= 1024; i++; }while(n >= 1024 && i < u.length - 1);
    return n.toFixed(n < 10 ? 2 : 1) + ' ' + u[i];
  }

  const ICON_DL = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v8m0 0L5 7m3 3l3-3M2.5 12.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  window.MCW = {esc, bindDropzone, analyze, mergedEntries, hyphenate, readNbt, playerStats, patchLevel,
                avatarUrl, FALLBACK_AVATAR, lookupName, download, zipAndDownload, formatBytes, ICON_DL};
})();
