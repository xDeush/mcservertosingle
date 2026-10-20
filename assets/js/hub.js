// All-in-one: detect layout, pick a player, download a ready-to-play world.
(function(){
  const {t} = I18N;
  const {esc} = MCW;
  const $ = id => document.getElementById(id);

  const panel2 = $('panel2'), panel3 = $('panel3');
  const setStatus = UI.status($('scanStatus'));
  const detectEl = $('detect'), picker = $('picker');
  const grid = $('grid'), countEl = $('count'), noPlayers = $('noPlayers');
  const summary = $('summary'), dlWorld = $('dlWorld'), dlLevel = $('dlLevel');
  const bar = UI.progress($('progress'));
  const setDlStatus = UI.status($('dlStatus'));

  let entries = [], world = null, levelRaw = null, selected = null;
  const tags = new Map(); // uuid -> parsed player NBT

  UI.bindSearch($('search'), grid);
  MCW.bindDropzone($('dropzone'), $('folderInput'), onEntries, () => setStatus('status.reading', null, 'busy'));

  function reset(){
    world = null; levelRaw = null; selected = null; tags.clear();
    detectEl.hidden = true; detectEl.innerHTML = '';
    picker.innerHTML = '';
    panel2.classList.add('disabled'); panel3.classList.add('disabled');
    grid.innerHTML = ''; countEl.textContent = ''; noPlayers.hidden = true;
    $('search').value = '';
    dlWorld.disabled = dlLevel.disabled = true;
    setDlStatus(null); bar.hide();
  }

  async function onEntries(list){
    reset();
    entries = list;
    if(!entries.length){ setStatus(null); return; }
    setStatus('status.scanning', null, 'busy');
    const worlds = MCW.analyze(entries);
    if(!worlds.length){
      const anyLevel = entries.some(e => e.path.endsWith('/level.dat') || e.path === 'level.dat');
      setStatus(anyLevel ? 'status.noPrimary' : 'status.noLevel', null, 'err');
      return;
    }
    let w = worlds[0];
    if(worlds.length > 1){
      setStatus('status.pick', {n: worlds.length});
      w = await UI.pickWorld(picker, worlds);
    }
    await choose(w);
  }

  async function choose(w){
    try{
      levelRaw = NBT.inflate(new Uint8Array(await w.levelFile.arrayBuffer()));
      NBT.parse(levelRaw);
    }catch(err){
      setStatus('status.levelErr', {msg: err.message}, 'err');
      return;
    }
    world = w;
    setStatus(null);
    renderDetect();
    renderPlayers();
    panel3.classList.remove('disabled');
    renderSummary();
  }

  function renderDetect(){
    const size = MCW.mergedEntries(entries, world, world.name).reduce((s, e) => s + (e.file.size || 0), 0);
    world.size = size;
    detectEl.innerHTML =
      UI.chip('det.world', esc(world.name)) +
      UI.chip('det.layout', UI.tv(world.split ? 'det.bukkit' : 'det.vanilla'), world.split ? 'warn' : '') +
      UI.dimChip('det.nether', world.dims.nether) +
      UI.dimChip('det.end', world.dims.end) +
      UI.chip('det.format', UI.tv(world.modern ? 'det.modern' : 'det.legacy')) +
      UI.chip('det.size', esc(MCW.formatBytes(size)));
    detectEl.hidden = false;
  }

  function renderCount(){
    if(world) countEl.textContent = t('players', {n: world.players.length});
  }

  async function renderPlayers(){
    panel2.classList.remove('disabled');
    renderCount();
    if(!world.players.length){ noPlayers.hidden = false; return; }

    const cards = world.players.map((p, i) => {
      const card = UI.playerCard(p, {selectable: true, onName: () => { if(selected === p) renderSummary(); }});
      const pick = () => select(p, card);
      card.addEventListener('click', pick);
      card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pick(); } });
      grid.appendChild(card);
      return card;
    });
    // Most recently active player is usually the one who wants the world.
    select(world.players[0], cards[0]);

    let failed = 0;
    for(let i = 0; i < world.players.length; i++){
      const p = world.players[i];
      try{
        const tag = await MCW.readNbt(p.file);
        tags.set(p.uuid, tag);
        UI.fillStats(cards[i], MCW.playerStats(tag));
      }catch(err){
        failed++;
        UI.failStats(cards[i], err.message);
        if(selected === p) select(null, null);
      }
    }
    if(failed) setStatus('status.someFailed', {ok: world.players.length - failed, failed}, 'err');
    renderSummary();
  }

  function select(p, card){
    selected = p;
    grid.querySelectorAll('.card').forEach(c => {
      const on = c === card;
      c.classList.toggle('selected', on);
      c.setAttribute('aria-checked', String(on));
    });
    renderSummary();
  }

  function renderSummary(){
    if(!world) return;
    const ok = '<span class="v good">✓</span>';
    const items = [];
    if(world.dims.nether.status === 'merge' || world.dims.end.status === 'merge') items.push(t('hub.do.merge'));
    if(selected){
      const name = esc(selected.name || MCW.hyphenate(selected.uuid).slice(0, 8));
      items.push(t(world.modern ? 'hub.do.player.modern' : 'hub.do.player', {name}));
    }else{
      items.push(t('hub.do.nobody'));
    }
    items.push(t('hub.do.clean'));
    summary.innerHTML = items.map(s => `<li>${ok}<span>${s}</span></li>`).join('');

    const ready = !selected || tags.has(selected.uuid) || world.modern;
    dlWorld.disabled = !ready;
    dlLevel.disabled = !selected || !ready;
    $('largeWarn').hidden = !(world.size > 1.5e9);
  }

  function patchedLevel(){
    return MCW.patchLevel(levelRaw, selected, tags.get(selected.uuid));
  }

  dlLevel.addEventListener('click', () => {
    try{
      MCW.download(new Blob([patchedLevel()], {type:'application/octet-stream'}), 'level.dat');
    }catch(err){ setDlStatus('status.zipErr', {msg: err.message}, 'err'); }
  });

  dlWorld.addEventListener('click', async () => {
    dlWorld.disabled = dlLevel.disabled = true;
    setDlStatus(null);
    bar.show();
    try{
      const files = MCW.mergedEntries(entries, world, world.name);
      if(selected){
        const levelPath = world.name + '/level.dat';
        const i = files.findIndex(f => f.zipPath === levelPath);
        const item = {zipPath: levelPath, data: patchedLevel()};
        if(i >= 0) files[i] = item; else files.push(item);
        // level.dat_old would be picked up if level.dat ever failed to load;
        // drop it so the game can't silently fall back to the unfixed copy.
        const old = files.findIndex(f => f.zipPath === world.name + '/level.dat_old');
        if(old >= 0) files.splice(old, 1);
      }
      await MCW.zipAndDownload(files, world.name + '-singleplayer.zip', p => {
        bar.set(p);
        dlWorld.textContent = t('dl.zipping', {p: Math.round(p)});
      });
    }catch(err){
      setDlStatus('status.zipErr', {msg: err.message}, 'err');
    }finally{
      bar.hide();
      dlWorld.innerHTML = MCW.ICON_DL + `<span data-i18n="hub.dl.world">${esc(t('hub.dl.world'))}</span>`;
      renderSummary();
    }
  });

  document.addEventListener('langchange', () => { renderCount(); renderSummary(); });
})();
