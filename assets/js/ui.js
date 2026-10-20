// Small UI helpers shared by the three pages.
(function(){
  const {t} = I18N;
  const {esc} = MCW;

  // Status line that re-translates itself when the language changes.
  function status(el){
    let cur = null;
    function render(){
      if(!cur){ el.textContent = ''; el.className = 'status-line'; return; }
      el.textContent = t(cur.key, cur.vars);
      el.className = 'status-line' + (cur.kind ? ' ' + cur.kind : '');
    }
    document.addEventListener('langchange', render);
    return function(key, vars, kind){ cur = key ? {key, vars, kind} : null; render(); };
  }

  function chip(labelKey, value, cls){
    return `<div><div class="k" data-i18n="${labelKey}">${esc(t(labelKey))}</div><div class="v ${cls || ''}">${value}</div></div>`;
  }
  // Translated value that updates on language change.
  function tv(key, vars){
    return vars ? esc(t(key, vars)) : `<span data-i18n="${key}">${esc(t(key))}</span>`;
  }

  function dimChip(labelKey, d){
    const map = {inside:['det.inside','good'], merge:['det.merge','warn'], missing:['det.missing','bad']};
    const [k, cls] = map[d.status];
    return chip(labelKey, tv(k), cls);
  }

  // Ask the user to pick one of several worlds; resolves with the chosen one.
  function pickWorld(container, worlds){
    return new Promise(resolve => {
      container.innerHTML = '';
      worlds.forEach(w => {
        const b = document.createElement('button');
        b.type = 'button';
        const label = [w.parentPath, w.root.split('/').pop()].filter(Boolean).join('/') || t('root');
        b.innerHTML = `<span>${esc(label)}</span><span class="count">${esc(t('picker.players', {n: w.players.length}))}</span>`;
        b.addEventListener('click', () => { container.innerHTML = ''; resolve(w); });
        container.appendChild(b);
      });
    });
  }

  // Player card skeleton; fills in nickname asynchronously.
  function playerCard(p, opts){
    const uuidH = MCW.hyphenate(p.uuid);
    const card = document.createElement('div');
    card.className = 'card pending' + (opts && opts.selectable ? ' selectable' : '');
    card.dataset.uuid = uuidH;
    if(opts && opts.selectable){
      card.tabIndex = 0;
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', 'false');
    }
    card.innerHTML = `
      ${opts && opts.selectable ? '<span class="check" aria-hidden="true"></span>' : ''}
      <div class="card-top">
        <img class="avatar" width="40" height="40" alt="" loading="lazy" src="${MCW.avatarUrl(p.uuid)}">
        <div class="card-id">
          <div class="nickname loading" data-i18n="player.loading">${esc(t('player.loading'))}</div>
          <div class="uuid-small">${esc(uuidH)}</div>
        </div>
      </div>
      <div class="stats"><div class="skeleton" style="width:70%"></div><div class="skeleton" style="width:45%"></div></div>`;
    const img = card.querySelector('img');
    img.addEventListener('error', () => { img.src = MCW.FALLBACK_AVATAR; }, {once:true});
    MCW.lookupName(p.uuid).then(name => {
      const el = card.querySelector('.nickname');
      el.classList.remove('loading');
      p.name = name;
      if(name){ el.removeAttribute('data-i18n'); el.textContent = name; }
      else{ el.dataset.i18n = 'player.unknown'; el.textContent = t('player.unknown'); }
      if(opts && opts.onName) opts.onName(p);
    });
    return card;
  }

  function fillStats(card, s){
    card.classList.remove('pending');
    const row = (k, v) => `<div class="r"><span data-i18n="${k}">${esc(t(k))}</span><span title="${esc(v)}">${esc(v)}</span></div>`;
    card.querySelector('.stats').innerHTML =
      row('stat.pos', s.pos) + row('stat.dim', s.dim) + row('stat.items', String(s.items)) + row('stat.xp', String(s.xp));
  }
  function failStats(card, msg){
    card.classList.remove('pending');
    card.querySelector('.stats').innerHTML = `<span class="err-txt">${esc(t('stat.failed', {msg}))}</span>`;
  }

  function bindSearch(input, grid){
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      grid.querySelectorAll('.card').forEach(c => {
        const nick = (c.querySelector('.nickname')?.textContent || '').toLowerCase();
        c.classList.toggle('hidden', !!q && !nick.includes(q) && !c.dataset.uuid.includes(q) && !c.dataset.uuid.replace(/-/g, '').includes(q));
      });
    });
  }

  function progress(el){
    const bar = el.querySelector('i');
    return {
      show(){ el.hidden = false; bar.style.width = '0'; },
      set(p){ bar.style.width = p.toFixed(1) + '%'; },
      hide(){ el.hidden = true; },
    };
  }

  window.UI = {status, chip, tv, dimChip, pickWorld, playerCard, fillStats, failStats, bindSearch, progress};
})();
