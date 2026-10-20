// ServerToSingleplayer: one repaired level.dat per player.
(function(){
  const {t} = I18N;
  const {esc} = MCW;
  const $ = id => document.getElementById(id);

  const panel2 = $('panel2'), grid = $('grid'), countEl = $('count'), picker = $('picker'), dlAll = $('dlAll');
  const setStatus = UI.status($('scanStatus'));
  const setDlStatus = UI.status($('dlStatus'));
  let world = null, results = [];

  UI.bindSearch($('search'), grid);
  MCW.bindDropzone($('dropzone'), $('folderInput'), onEntries, () => setStatus('status.reading', null, 'busy'));

  function reset(){
    world = null; results = [];
    panel2.classList.add('disabled');
    grid.innerHTML = ''; countEl.textContent = ''; picker.innerHTML = '';
    $('search').value = ''; dlAll.disabled = true; setDlStatus(null);
  }

  async function onEntries(entries){
    reset();
    if(!entries.length){ setStatus(null); return; }
    setStatus('status.scanning', null, 'busy');
    const all = MCW.analyze(entries);
    const worlds = all.filter(w => w.players.length);
    if(!worlds.length){
      setStatus(all.length ? 'status.noPlayers' : 'status.noLevel', null, 'err');
      return;
    }
    let w = worlds[0];
    if(worlds.length > 1){
      setStatus('status.pick', {n: worlds.length});
      w = await UI.pickWorld(picker, worlds);
    }
    let levelRaw;
    try{
      levelRaw = NBT.inflate(new Uint8Array(await w.levelFile.arrayBuffer()));
      NBT.parse(levelRaw);
    }catch(err){
      setStatus('status.levelErr', {msg: err.message}, 'err');
      return;
    }
    world = w;
    setStatus(w.players.length === 1 ? 'sts.single' : null, null, 'ok');
    await processPlayers(levelRaw);
  }

  function renderCount(){ if(world) countEl.textContent = t('players', {n: world.players.length}); }

  async function processPlayers(levelRaw){
    panel2.classList.remove('disabled');
    renderCount();
    const cards = world.players.map(p => { const c = UI.playerCard(p); grid.appendChild(c); return c; });

    let failed = 0;
    for(let i = 0; i < world.players.length; i++){
      const p = world.players[i], card = cards[i];
      try{
        const tag = await MCW.readNbt(p.file);
        const gz = MCW.patchLevel(levelRaw, p, tag);
        results.push({uuid: p.uuid, gz});
        UI.fillStats(card, MCW.playerStats(tag));
        const btn = document.createElement('button');
        btn.className = 'btn block';
        btn.type = 'button';
        btn.innerHTML = MCW.ICON_DL + `<span data-i18n="dl.forPlayer">${esc(t('dl.forPlayer'))}</span>`;
        btn.addEventListener('click', () => MCW.download(new Blob([gz], {type:'application/octet-stream'}), `level-${p.uuid.slice(0, 8)}.dat`));
        card.appendChild(btn);
      }catch(err){
        failed++;
        UI.failStats(card, err.message);
      }
    }
    if(failed) setStatus('status.someFailed', {ok: results.length, failed}, 'err');
    dlAll.disabled = !results.length;
  }

  dlAll.addEventListener('click', async () => {
    dlAll.disabled = true;
    try{
      await MCW.zipAndDownload(results.map(r => ({zipPath: `${r.uuid}/level.dat`, data: r.gz})), 'converted-level-dat.zip',
        p => { dlAll.textContent = t('dl.zipping', {p: Math.round(p)}); });
    }catch(err){
      setDlStatus('status.zipErr', {msg: err.message}, 'err');
    }finally{
      dlAll.disabled = false;
      dlAll.textContent = t('dl.all');
    }
  });

  document.addEventListener('langchange', renderCount);
})();
