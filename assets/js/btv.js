// BukkitToVanilla: merge world_nether / world_the_end back into one world.
(function(){
  const {t} = I18N;
  const {esc} = MCW;
  const $ = id => document.getElementById(id);

  const panel2 = $('panel2'), list = $('worlds'), countEl = $('count'), dlAll = $('dlAll');
  const setStatus = UI.status($('scanStatus'));
  const setDlStatus = UI.status($('dlStatus'));
  let entries = [], worlds = [];

  MCW.bindDropzone($('dropzone'), $('folderInput'), onEntries, () => setStatus('status.reading', null, 'busy'));

  function onEntries(e){
    entries = e; worlds = [];
    panel2.classList.add('disabled'); list.innerHTML = ''; countEl.textContent = ''; dlAll.disabled = true; setDlStatus(null);
    if(!entries.length){ setStatus(null); return; }
    worlds = MCW.analyze(entries);
    if(!worlds.length){
      const anyLevel = entries.some(x => /(^|\/)level\.dat$/.test(x.path));
      setStatus(anyLevel ? 'status.noPrimary' : 'status.noLevel', null, 'err');
      return;
    }
    setStatus(null);
    // Split worlds first: those are the ones this page is for.
    worlds.sort((a, b) => Number(b.split) - Number(a.split));
    render();
  }

  function renderCount(){ if(worlds.length) countEl.textContent = t('worlds.ready', {n: worlds.length}); }

  function render(){
    panel2.classList.remove('disabled');
    renderCount();
    for(const w of worlds){
      const files = MCW.mergedEntries(entries, w, 'world');
      const size = files.reduce((s, f) => s + (f.file.size || 0), 0);
      const el = document.createElement('div');
      el.className = 'world';
      el.innerHTML = `
        <div class="world-head">
          <div class="world-name">${esc(w.name)}</div>
          <div class="world-path">${esc(w.parentPath || t('root'))}</div>
        </div>
        <div class="detect">
          ${UI.dimChip('det.nether', w.dims.nether)}
          ${UI.dimChip('det.end', w.dims.end)}
          ${UI.chip('det.format', UI.tv(w.modern ? 'det.modern' : 'det.legacy'))}
          ${UI.chip('det.size', esc(MCW.formatBytes(size)))}
        </div>
        ${size > 1.5e9 ? `<div class="warn-txt" data-i18n="warn.large">${esc(t('warn.large'))}</div>` : ''}`;
      const btn = document.createElement('button');
      btn.className = 'btn block';
      btn.type = 'button';
      const label = () => { btn.innerHTML = MCW.ICON_DL + `<span data-i18n="btv.dl">${esc(t('btv.dl'))}</span>`; };
      label();
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try{ await zipWorld(w, p => { btn.textContent = t('dl.zipping', {p: Math.round(p)}); }); }
        catch(err){ setDlStatus('status.zipErr', {msg: err.message}, 'err'); }
        finally{ btn.disabled = false; label(); }
      });
      el.appendChild(btn);
      list.appendChild(el);
    }
    dlAll.disabled = false;
  }

  function zipWorld(w, onProgress){
    return MCW.zipAndDownload(MCW.mergedEntries(entries, w, 'world'), `${w.name}-vanilla.zip`, onProgress);
  }

  dlAll.addEventListener('click', async () => {
    dlAll.disabled = true;
    try{
      for(let i = 0; i < worlds.length; i++){
        await zipWorld(worlds[i], p => { dlAll.textContent = `${i + 1}/${worlds.length} · ${t('dl.zipping', {p: Math.round(p)})}`; });
      }
    }catch(err){
      setDlStatus('status.zipErr', {msg: err.message}, 'err');
    }finally{
      dlAll.disabled = false;
      dlAll.textContent = t('dl.all');
    }
  });

  document.addEventListener('langchange', renderCount);
})();
