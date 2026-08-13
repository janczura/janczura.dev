/* =========================================================================
   W3Champions Stats — janczura.dev
   Wszystkie dane pochodzą z publicznego API W3Champions i pobierane są
   leniwie: każda sekcja startuje dopiero po kliknięciu użytkownika.
   Teksty interfejsu: i18n.js (PL/EN).
   ========================================================================= */

const API = 'https://website-backend.w3champions.com/api';

/* ---------------------------------------------------------------- stałe -- */

const RACES = {
    0: { name: 'Random',    short: 'RnD', color: 'var(--race-rnd)' },
    1: { name: 'Human',     short: 'HU',  color: 'var(--race-hu)'  },
    2: { name: 'Orc',       short: 'OC',  color: 'var(--race-oc)'  },
    4: { name: 'Night Elf', short: 'NE',  color: 'var(--race-ne)'  },
    8: { name: 'Undead',    short: 'UD',  color: 'var(--race-ud)'  },
    16:{ name: 'All',       short: 'ALL', color: 'var(--text-muted)' }
};
const RACE_ORDER = [1, 2, 4, 8, 0];

// zapasowe nazwy trybów — właściwe API podaje w polu `id` (np. ..._GM_4v4_AT)
const MODE_NAMES = { 1: '1v1', 2: '2v2', 4: '4v4', 5: 'FFA', 6: '2v2 AT', 8: '4v4 AT' };

const PAGE_SIZE = 100;
const GATEWAYS = [20, 10];
const FETCH_LIMIT = 6;   // równoległe zapytania przy skanowaniu wszystkich sezonów

/* --------------------------------------------------------------- pomoce -- */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// tryby drużynowe nie mają podziału na rasy — API zwraca wtedy race === null
const raceOf = (r) => RACES[r] || (r === null || r === undefined
    ? { name: t('race.none'), short: '—', color: 'var(--text-muted)', none: true }
    : { name: `Race ${r}`, short: `R${r}`, color: 'var(--text-muted)' });

const gatewayName = (gw) => t(`gw.${gw}`);
const eqTag = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();

function pct(x, digits = 1) {
    if (x === null || x === undefined || Number.isNaN(x)) return '—';
    return `${(x * 100).toFixed(digits)}%`;
}
function num(n) { return (n === null || n === undefined) ? '—' : n.toLocaleString(locale()); }
function signed(n) { return (n > 0 ? '+' : '') + num(n); }

function duration(seconds) {
    if (!seconds && seconds !== 0) return '—';
    const m = Math.floor(seconds / 60), s = Math.round(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}
function dateShort(d) {
    return new Date(d).toLocaleDateString(locale(), { day: '2-digit', month: '2-digit', year: '2-digit' });
}
function dateTime(d) {
    return new Date(d).toLocaleString(locale(), { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Nazwy map z API bywają w formie "w3c2606152308TurtleRockv2_0". */
function prettyMap(raw) {
    if (!raw) return '—';
    const s = String(raw)
        .replace(/^[0-9]*w3c[0-9]+/i, '')
        .replace(/^[0-9]+c[0-9]+/i, '')
        .replace(/_+/g, '.')
        .replace(/v([0-9])\.([0-9])$/i, ' v$1.$2')
        .replace(/v([0-9])$/i, ' v$1')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
    return s || String(raw);
}

/** Nazwa trybu — najpierw z `id` zwróconego przez API, potem ze słownika. */
function modeName(gameMode, id) {
    const m = id && String(id).match(/(GM_[A-Za-z0-9_]+)$/);
    if (m) {
        const name = m[1]
            .replace(/_(RnD|HU|OC|NE|UD|ALL)$/, '')   // sufiks rasy, jeśli jest
            .replace(/^GM_/, '')
            .replace(/_/g, ' ')
            .trim();
        if (name) return name;
    }
    return MODE_NAMES[gameMode] || `Mode ${gameMode}`;
}

/* ------------------------------------------------------------------ API -- */

const cache = new Map();

async function api(path, params = {}) {
    const url = new URL(API + path);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    const key = url.toString();
    if (cache.has(key)) return cache.get(key);

    const p = fetch(key, { headers: { Accept: 'application/json' } })
        .then(async (res) => {
            if (!res.ok) throw new Error(`API ${res.status} — ${res.statusText}`);
            return res.json();
        })
        .catch((err) => { cache.delete(key); throw err; });

    cache.set(key, p);
    return p;
}

/* ----------------------------------------------------------------- stan -- */

const state = {
    tag: null,
    profile: null,
    season: null,
    gateway: 20,
    loaded: { peak: false, season: false, mmr: false, matchup: false, matches: false },
    peak: { rows: [], seasons: [], refined: false, running: false },
    matches: { offset: 0, count: null, list: [], mode: '', loading: false }
};

/** Przetwarza listę zadań z ograniczoną równoległością, raportując postęp. */
async function mapLimit(items, limit, fn, onProgress) {
    const out = new Array(items.length);
    let next = 0, done = 0;
    const worker = async () => {
        while (next < items.length) {
            const i = next++;
            out[i] = await fn(items[i]);
            onProgress?.(++done, items.length);
        }
    };
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return out;
}

/* ============================================================ język PL/EN */

function applyStatic() {
    document.documentElement.lang = LANG;
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });

    // przyciski sekcji trzymają własny stan (np. „Wczytaj kolejne 100”)
    const mbtn = $('[data-load="matches"]');
    if (!state.loaded.matches) mbtn.textContent = t('btn.loadMatches', { n: PAGE_SIZE });

    // sezony w selektorze mają tłumaczoną etykietę
    $$('#f-season option').forEach(o => { o.textContent = t('season.n', { n: o.value }); });
}

$('#lang-toggle').addEventListener('click', () => {
    LANG = LANG === 'pl' ? 'en' : 'pl';
    try { localStorage.setItem(LANG_KEY, LANG); } catch { /* prywatny tryb — trudno */ }
    applyStatic();
    rerenderLoaded();
});

/** Po zmianie języka odświeża to, co już wczytane (dane siedzą w cache). */
function rerenderLoaded() {
    setStatus(searchStatus, '');
    if (!state.profile) return;
    renderProfile(state.profile);
    if (state.loaded.peak) renderPeak();          // dane siedzą w state.peak — bez ponownych zapytań
    if (state.loaded.season) loadSeason();
    if (state.loaded.mmr) loadMmr();
    if (state.loaded.matchup) loadMatchup();
    if (state.loaded.matches && state.matches.list.length) renderMatches($('[data-status="matches"]'));
}

/* -------------------------------------------------------------- tooltip -- */

const tipEl = $('#tooltip');

function showTip(html, ev) {
    tipEl.innerHTML = html;
    tipEl.hidden = false;
    const pad = 14, r = tipEl.getBoundingClientRect();
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - pad;
    tipEl.style.left = `${Math.max(8, x)}px`;
    tipEl.style.top = `${Math.max(8, y)}px`;
}
function hideTip() { tipEl.hidden = true; }

document.addEventListener('mousemove', (ev) => {
    const host = ev.target.closest?.('[data-tip]');
    if (host) showTip(host.dataset.tip, ev);
    else if (!ev.target.closest?.('svg.chart')) hideTip();
});
document.addEventListener('mouseleave', hideTip);

/* =========================================================================
   WYKRESY
   ========================================================================= */

/** Ładne wartości podziałki osi. */
function niceTicks(min, max, count = 5) {
    if (min === max) { min -= 1; max += 1; }
    const raw = (max - min) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm >= 7.5 ? 10 : norm >= 3.5 ? 5 : norm >= 1.5 ? 2 : 1) * mag;
    const start = Math.ceil(min / step) * step;
    const ticks = [];
    for (let v = start; v <= max + step * 0.001; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return ticks;
}

/**
 * Wykres liniowy — jedna seria, więc bez legendy; tytuł nazywa serię.
 * points: [{ t: Date|string, v: number, meta?: string }]
 */
function lineChart(points, opts = {}) {
    const W = 760, H = opts.height || 250;
    const pad = { t: 16, r: 58, b: 26, l: 48 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;

    if (!points.length) return `<p class="empty">${t('common.noChartData')}</p>`;

    const xs = points.map(p => +new Date(p.t));
    const ys = points.map(p => p.v);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    let y0 = Math.min(...ys), y1 = Math.max(...ys);
    const yPad = Math.max((y1 - y0) * 0.12, 5);
    y0 -= yPad; y1 += yPad;

    const sx = (v) => pad.l + (x1 === x0 ? iw / 2 : ((v - x0) / (x1 - x0)) * iw);
    const sy = (v) => pad.t + ih - ((v - y0) / (y1 - y0)) * ih;

    const grid = niceTicks(y0, y1, 5).map(tick => `
        <line class="grid-line" x1="${pad.l}" x2="${pad.l + iw}" y1="${sy(tick).toFixed(1)}" y2="${sy(tick).toFixed(1)}"/>
        <text x="${pad.l - 8}" y="${(sy(tick) + 3.5).toFixed(1)}" text-anchor="end" font-size="10">${num(Math.round(tick))}</text>`).join('');

    const xIdx = [...new Set([0, Math.floor(points.length / 2), points.length - 1])];
    const xLabels = xIdx.map(i => {
        const x = sx(+new Date(points[i].t));
        const anchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle';
        return `<text x="${x.toFixed(1)}" y="${H - 8}" text-anchor="${anchor}" font-size="10">${dateShort(points[i].t)}</text>`;
    }).join('');

    const d = points.map((p, i) => `${i ? 'L' : 'M'}${sx(+new Date(p.t)).toFixed(1)},${sy(p.v).toFixed(1)}`).join(' ');
    const dots = points.length <= 25
        ? points.map(p => `<circle cx="${sx(+new Date(p.t)).toFixed(1)}" cy="${sy(p.v).toFixed(1)}" r="4"
              fill="var(--series-1)" stroke="var(--surface-1)" stroke-width="2"/>`).join('')
        : '';

    const last = points[points.length - 1];
    const lastX = sx(+new Date(last.t)), lastY = sy(last.v);
    const payload = points.map(p => ({ x: sx(+new Date(p.t)), y: sy(p.v), v: p.v, t: p.t, meta: p.meta || '' }));

    return `
    <svg class="chart" viewBox="0 0 ${W} ${H}"
         data-points='${esc(JSON.stringify(payload))}' data-unit="${esc(opts.unit || '')}">
        ${grid}
        <line class="axis-line" x1="${pad.l}" x2="${pad.l + iw}" y1="${pad.t + ih}" y2="${pad.t + ih}"/>
        ${xLabels}
        <path d="${d}" fill="none" stroke="var(--series-1)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${dots}
        <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4" fill="var(--series-1)" stroke="var(--surface-1)" stroke-width="2"/>
        <text class="label-strong" x="${(lastX + 9).toFixed(1)}" y="${(lastY + 3.5).toFixed(1)}" font-size="11">${num(Math.round(last.v))}</text>
        <g class="hover-layer" hidden>
            <line class="axis-line" y1="${pad.t}" y2="${pad.t + ih}"/>
            <circle r="4" fill="var(--series-1)" stroke="var(--surface-1)" stroke-width="2"/>
        </g>
        <rect x="${pad.l}" y="${pad.t}" width="${iw}" height="${ih}" fill="transparent" class="hover-target"/>
    </svg>`;
}

/* krzyżyk + tooltip na wykresie liniowym */
document.addEventListener('mousemove', (ev) => {
    const svg = ev.target.closest?.('svg.chart');
    if (!svg || !svg.dataset.points) return;

    const pts = svg._pts || (svg._pts = JSON.parse(svg.dataset.points));
    const box = svg.getBoundingClientRect();
    const vx = ((ev.clientX - box.left) / box.width) * svg.viewBox.baseVal.width;

    let best = pts[0], bestD = Infinity;
    for (const p of pts) {
        const dist = Math.abs(p.x - vx);
        if (dist < bestD) { bestD = dist; best = p; }
    }
    const layer = svg.querySelector('.hover-layer');
    layer.removeAttribute('hidden');   // SVG nie honoruje właściwości .hidden
    layer.querySelector('line').setAttribute('x1', best.x);
    layer.querySelector('line').setAttribute('x2', best.x);
    layer.querySelector('circle').setAttribute('cx', best.x);
    layer.querySelector('circle').setAttribute('cy', best.y);

    showTip(`<b>${num(Math.round(best.v))}${esc(svg.dataset.unit || '')}</b>
             <div class="t-row">${dateTime(best.t)}</div>
             ${best.meta ? `<div class="t-row">${esc(best.meta)}</div>` : ''}`, ev);
});
document.addEventListener('mouseout', (ev) => {
    const svg = ev.target.closest?.('svg.chart');
    if (svg && !svg.contains(ev.relatedTarget)) {
        svg.querySelector('.hover-layer')?.setAttribute('hidden', '');
        hideTip();
    }
});

/**
 * Poziome słupki — jedna seria, opcjonalna linia odniesienia (50%).
 * rows: [{ label, value, color, right, tip }]
 */
function barsHtml(rows, opts = {}) {
    if (!rows.length) return `<p class="empty">${t('common.noData')}</p>`;
    const max = opts.max ?? 1;
    return `<div class="bars">` + rows.map(r => {
        const w = Math.max(0, Math.min(1, r.value / max)) * 100;
        return `<div class="bar-row"${r.tip ? ` data-tip="${esc(r.tip)}"` : ''}>
            <div class="bar-label">${r.color ? `<span class="swatch" style="background:${r.color}"></span>` : ''}${esc(r.label)}</div>
            <div class="bar-track">
                <span class="bar-fill" style="width:${w.toFixed(1)}%;background:${r.color || 'var(--series-1)'}"></span>
                ${opts.reference ? `<i class="bar-ref" style="left:${(opts.reference / max * 100).toFixed(1)}%"></i>` : ''}
            </div>
            <div class="bar-value">${r.right ?? pct(r.value)}</div>
        </div>`;
    }).join('') + `</div>`;
}

/** Tabela z sortowaniem po kliknięciu w nagłówek. */
function tableHtml(columns, rows) {
    if (!rows.length) return `<p class="empty">${t('common.noData')}</p>`;
    const head = columns.map((c, i) =>
        `<th class="sortable" data-col="${i}" data-type="${c.type || 'text'}" aria-sort="none">${esc(c.label)}</th>`).join('');
    const body = rows.map(r => `<tr${r._class ? ` class="${r._class}"` : ''}>` +
        columns.map((c, i) => `<td class="${c.type === 'num' ? 'num' : ''}" data-sort="${esc(r.sort?.[i] ?? '')}">${r.cells[i]}</td>`).join('') +
        `</tr>`).join('');
    return `<div class="table-holder"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

document.addEventListener('click', (ev) => {
    const th = ev.target.closest?.('th.sortable');
    if (!th) return;
    const table = th.closest('table'), tbody = table.tBodies[0];
    const col = +th.dataset.col, type = th.dataset.type;
    const asc = th.getAttribute('aria-sort') !== 'ascending';
    $$('th', table).forEach(h => h.setAttribute('aria-sort', 'none'));
    th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');

    Array.from(tbody.rows).sort((a, b) => {
        const va = a.cells[col].dataset.sort, vb = b.cells[col].dataset.sort;
        const cmp = type === 'num' ? (parseFloat(va) || 0) - (parseFloat(vb) || 0)
                                   : String(va).localeCompare(String(vb), locale());
        return asc ? cmp : -cmp;
    }).forEach(r => tbody.appendChild(r));
});

/* =========================================================================
   WYSZUKIWANIE GRACZA
   ========================================================================= */

const searchStatus = $('#search-status');
const searchResults = $('#search-results');

function setStatus(el, text, kind = '') {
    el.textContent = text;
    el.className = `status ${kind}`.trim();
}

/** Z inputa (nick / BattleTag / link) robi kandydata do zapytania. */
function parseInput(raw) {
    let s = String(raw || '').trim();
    if (!s) return '';
    const m = s.match(/w3champions\.com\/player\/([^/?#]+)/i);
    if (m) return decodeURIComponent(m[1]);
    if (/^https?:\/\//i.test(s)) {
        try {
            const seg = new URL(s).pathname.split('/').filter(Boolean);
            s = decodeURIComponent(seg[seg.length - 1] || s);
        } catch { /* niepoprawny URL — traktuj jak zwykły tekst */ }
    }
    if (!s.includes('#') && /%23/i.test(s)) s = decodeURIComponent(s);
    return s;
}

$('#search-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const query = parseInput($('#search-input').value);
    if (!query) return;
    searchResults.hidden = true;
    searchResults.innerHTML = '';

    if (query.includes('#')) { await loadPlayer(query); return; }

    setStatus(searchStatus, t('search.searching', { q: query }), 'busy');
    try {
        const found = await api('/players/global-search', { search: query, pageSize: 12 });
        if (!found.length) { setStatus(searchStatus, t('search.none'), 'error'); return; }
        const exact = found.filter(p => p.name.toLowerCase() === query.toLowerCase());
        if (exact.length === 1) { await loadPlayer(exact[0].battleTag); return; }

        setStatus(searchStatus, t('search.many', { n: found.length }));
        searchResults.innerHTML = found.map(p => `
            <li><button type="button" data-tag="${esc(p.battleTag)}">
                <span>${esc(p.battleTag)}</span>
                <span class="seasons">${esc(t('search.seasons', { list: p.seasons?.length ? p.seasons.map(s => s.id).join(', ') : '—' }))}</span>
            </button></li>`).join('');
        searchResults.hidden = false;
    } catch (err) {
        setStatus(searchStatus, t('search.error', { msg: err.message }), 'error');
    }
});

searchResults.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-tag]');
    if (btn) { searchResults.hidden = true; loadPlayer(btn.dataset.tag); }
});

/* =========================================================================
   PROFIL (jedno zapytanie — ładowany od razu po wyszukaniu)
   ========================================================================= */

async function loadPlayer(battleTag) {
    setStatus(searchStatus, t('search.loadingProfile', { tag: battleTag }), 'busy');
    try {
        const profile = await api(`/players/${encodeURIComponent(battleTag)}`);
        if (!profile || !profile.battleTag) throw new Error(t('search.emptyResponse'));

        state.tag = profile.battleTag;
        state.profile = profile;
        $('#search-input').value = profile.battleTag;
        history.replaceState(null, '', `?player=${encodeURIComponent(profile.battleTag)}`);
        setStatus(searchStatus, '');
        renderProfile(profile);
        setupFilters(profile);
        resetPeak();
        resetSections();
    } catch (err) {
        setStatus(searchStatus, t('search.profileError', { msg: err.message }), 'error');
    }
}

function renderProfile(p) {
    $('#profile').hidden = false;
    $('#p-name').textContent = p.name || p.battleTag;
    $('#p-tag').textContent = p.battleTag;
    $('#p-link').href = `https://w3champions.com/player/${encodeURIComponent(p.battleTag)}`;

    const wl = p.winLosses || [];
    const total = wl.reduce((a, r) => ({ wins: a.wins + r.wins, losses: a.losses + r.losses, games: a.games + r.games }),
        { wins: 0, losses: 0, games: 0 });
    const main = wl.slice().sort((a, b) => b.games - a.games)[0];
    const seasons = p.participatedInSeasons || [];

    $('#p-tiles').innerHTML = [
        tile(num(total.games), t('tile.games'), `${num(total.wins)} W – ${num(total.losses)} L`),
        tile(pct(total.games ? total.wins / total.games : 0), t('tile.winrate'), t('tile.allSeasons')),
        tile(seasons.length, t('tile.seasons'), seasons.length ? `${seasons[seasons.length - 1].id} – ${seasons[0].id}` : ''),
        main ? tile(raceOf(main.race).short, t('tile.mainRace'), t('tile.gamesWr', { n: num(main.games), wr: pct(main.winrate) })) : ''
    ].join('');

    const rows = wl.filter(r => r.games > 0)
        .sort((a, b) => RACE_ORDER.indexOf(a.race) - RACE_ORDER.indexOf(b.race));

    $('#p-race-chart').innerHTML = `
        <div class="chart-title">${t('chart.raceWinrate', { name: esc(p.name || p.battleTag) })}</div>
        ${barsHtml(rows.map(r => ({
            label: raceOf(r.race).name,
            value: r.winrate,
            color: raceOf(r.race).color,
            right: pct(r.winrate),
            tip: `<b>${raceOf(r.race).name}</b><div class="t-row">${t('tip.gamesWl', { n: num(r.games), w: num(r.wins), l: num(r.losses) })}</div>`
        })), { reference: 0.5 })}`;

    $('#p-race-table').innerHTML = tableHtml(
        [{ label: t('th.race') }, { label: t('th.games'), type: 'num' }, { label: t('th.w'), type: 'num' },
         { label: t('th.l'), type: 'num' }, { label: t('th.winrate'), type: 'num' }],
        rows.map(r => ({
            cells: [
                `<span class="race-cell"><span class="swatch" style="background:${raceOf(r.race).color}"></span>${raceOf(r.race).name}</span>`,
                num(r.games), num(r.wins), num(r.losses), pct(r.winrate)
            ],
            sort: [raceOf(r.race).name, r.games, r.wins, r.losses, r.winrate]
        }))
    );
}

function tile(value, label, sub) {
    return `<div class="tile">
        <div class="tile-value">${esc(value)}</div>
        <div class="tile-label">${esc(label)}</div>
        ${sub ? `<div class="tile-sub">${esc(sub)}</div>` : ''}
    </div>`;
}

/* =========================================================================
   FILTRY + reset sekcji
   ========================================================================= */

function setupFilters(profile) {
    $('#filters').hidden = false;
    const seasons = (profile.participatedInSeasons || []).map(s => s.id);
    const sel = $('#f-season');
    sel.innerHTML = seasons.map(id => `<option value="${id}">${t('season.n', { n: id })}</option>`).join('');
    if (!seasons.includes(state.season)) state.season = seasons[0] ?? null;
    sel.value = state.season ?? '';
    $('#f-gateway').value = state.gateway;
}

$('#f-season').addEventListener('change', (e) => { state.season = +e.target.value; resetSections(); });
$('#f-gateway').addEventListener('change', (e) => { state.gateway = +e.target.value; resetSections(); });

function resetSections() {
    ['season', 'mmr', 'matchup', 'matches'].forEach(key => {
        $(`#sec-${key}`).hidden = false;
        $(`[data-body="${key}"]`).innerHTML = '';
        setStatus($(`[data-status="${key}"]`), '');
        const btn = $(`[data-load="${key}"]`);
        delete btn.dataset.exhausted;
        btn.disabled = false;
        btn.textContent = key === 'matches' ? t('btn.loadMatches', { n: PAGE_SIZE }) : t('btn.load');
        state.loaded[key] = false;
    });
    state.matches = { offset: 0, count: null, list: [], mode: '', loading: false };
}

/** Rekordy konta nie zależą od filtrów — czyszczone tylko przy zmianie gracza. */
function resetPeak() {
    $('#sec-peak').hidden = false;
    $('[data-body="peak"]').innerHTML = '';
    setStatus($('[data-status="peak"]'), '');
    const btn = $('[data-load="peak"]');
    btn.disabled = false;
    delete btn.dataset.exhausted;
    state.loaded.peak = false;
    state.peak = { rows: [], seasons: [], refined: false, running: false };
}

/* przyciski „Wczytaj” */
document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-load]');
    if (!btn) return;
    ({ peak: loadPeak, season: loadSeason, mmr: loadMmr, matchup: loadMatchup, matches: loadMatches })[btn.dataset.load]?.();
});

async function withStatus(key, text, fn) {
    const st = $(`[data-status="${key}"]`);
    const btn = $(`[data-load="${key}"]`);
    setStatus(st, text, 'busy');
    btn.disabled = true;
    try {
        await fn(st);
        state.loaded[key] = true;
    } catch (err) {
        setStatus(st, t('common.error', { msg: err.message }), 'error');
    } finally {
        btn.disabled = btn.dataset.exhausted === '1';
    }
}

/** Gdy wybrany serwer nie ma danych, sprawdza drugi i podpowiada zmianę. */
async function fetchSeasonStats() {
    let stats = await api(`/players/${encodeURIComponent(state.tag)}/game-mode-stats`,
        { gateWay: state.gateway, season: state.season });
    let note = '';
    if (!stats.length) {
        const other = state.gateway === 20 ? 10 : 20;
        const alt = await api(`/players/${encodeURIComponent(state.tag)}/game-mode-stats`,
            { gateWay: other, season: state.season });
        if (alt.length) {
            state.gateway = other;
            $('#f-gateway').value = other;
            stats = alt;
            note = t('common.gatewaySwitched', { gw: gatewayName(other) });
        }
    }
    return { stats, note };
}

/* =========================================================================
   SEKCJA 1 — rekordy konta (peak MMR w trybie, niezależnie od sezonu)

   API nie ma endpointu „peak”, więc liczymy go sami w dwóch krokach:
   1. game-mode-stats dla każdego sezonu i obu serwerów — daje MMR z końca
      sezonu w każdej kombinacji tryb/rasa (kilkanaście zapytań),
   2. na życzenie mmr-rp-timeline dla każdej z tych kombinacji — dopiero to
      pokazuje faktyczny szczyt w trakcie sezonu (potrafi być mocno wyższy).
   ========================================================================= */

async function loadPeak() {
    if (state.peak.running) return;
    const seasons = (state.profile?.participatedInSeasons || []).map(s => s.id);

    await withStatus('peak', t('peak.loading', { a: 0, b: seasons.length * GATEWAYS.length }), async (st) => {
        const body = $('[data-body="peak"]');
        if (!seasons.length) { setStatus(st, t('peak.noSeasons')); body.innerHTML = ''; return; }

        state.peak.running = true;
        try {
            const jobs = seasons.flatMap(season => GATEWAYS.map(gw => ({ season, gw })));
            const chunks = await mapLimit(jobs, FETCH_LIMIT, async ({ season, gw }) => {
                try {
                    const stats = await api(`/players/${encodeURIComponent(state.tag)}/game-mode-stats`,
                        { gateWay: gw, season });
                    return (stats || []).filter(s => s.games > 0)
                        .map(s => ({ ...s, season: s.season ?? season, gateWay: s.gateWay ?? gw }));
                } catch {
                    return [];   // pojedynczy sezon bez danych nie może wywrócić całości
                }
            }, (a, b) => setStatus(st, t('peak.loading', { a, b }), 'busy'));

            state.peak.seasons = seasons;
            state.peak.refined = false;
            state.peak.rows = groupPeaks(chunks.flat());
        } finally {
            state.peak.running = false;
        }
        renderPeak();
    });
}

/** Z listy wpisów tryb/rasa/sezon robi jeden wiersz na tryb, z najlepszym wynikiem. */
function groupPeaks(stats) {
    const byMode = new Map();
    for (const s of stats) {
        let row = byMode.get(s.gameMode);
        if (!row) {
            row = { gameMode: s.gameMode, mode: modeName(s.gameMode, s.id), games: 0, combos: [], peak: null };
            byMode.set(s.gameMode, row);
        }
        row.games += s.games;
        // MMR z końca sezonu jest na start przybliżeniem szczytu
        const combo = { ...s, peak: { mmr: s.mmr, date: null, approx: true } };
        row.combos.push(combo);
        if (!row.peak || combo.peak.mmr > row.peak.mmr) row.peak = { ...combo.peak, combo };
    }
    return Array.from(byMode.values()).sort((a, b) => b.games - a.games);
}

/** Krok 2 — przegląda historię MMR każdej kombinacji i podmienia szczyty. */
async function refinePeak() {
    if (state.peak.running) return;
    state.peak.running = true;
    const st = $('[data-status="peak"]');
    const headBtn = $('[data-load="peak"]');
    headBtn.disabled = true;
    const jobs = state.peak.rows.flatMap(row => row.combos.map(combo => ({ row, combo })));

    try {
        await mapLimit(jobs, FETCH_LIMIT, async ({ combo }) => {
            try {
                const data = await api(`/players/${encodeURIComponent(state.tag)}/mmr-rp-timeline`,
                    { race: combo.race, gateWay: combo.gateWay, season: combo.season, gameMode: combo.gameMode });
                const pts = data?.mmrRpAtDates || [];
                if (!pts.length) return;
                const top = pts.reduce((best, p) => (p.mmr > best.mmr ? p : best), pts[0]);
                // historia bywa ucięta przed końcem sezonu — zostawiamy wyższą z wartości
                if (top.mmr >= combo.peak.mmr) combo.peak = { mmr: top.mmr, date: top.date, approx: false };
                else combo.peak = { ...combo.peak, approx: false };
            } catch {
                /* brak historii dla kombinacji — zostaje MMR z końca sezonu */
            }
        }, (a, b) => setStatus(st, t('peak.refining', { a, b }), 'busy'));

        for (const row of state.peak.rows) {
            row.peak = row.combos.reduce((best, combo) =>
                (!best || combo.peak.mmr > best.mmr ? { ...combo.peak, combo } : best), null);
        }
        state.peak.refined = true;
        renderPeak();
    } catch (err) {
        setStatus(st, t('common.error', { msg: err.message }), 'error');
    } finally {
        state.peak.running = false;
        headBtn.disabled = false;
    }
}

function renderPeak() {
    const body = $('[data-body="peak"]');
    const st = $('[data-status="peak"]');
    const rows = state.peak.rows;

    if (!rows.length) {
        body.innerHTML = '';
        setStatus(st, state.peak.seasons.length ? t('peak.empty') : t('peak.noSeasons'));
        return;
    }

    const peakRace = (p) => raceOf(p.combo.race);
    const where = (p) => p.date
        ? t('peak.card.date', { n: p.combo.season, gw: gatewayName(p.combo.gateWay), date: dateShort(p.date) })
        : t('peak.card.where', { n: p.combo.season, gw: gatewayName(p.combo.gateWay) });

    const best = rows.reduce((a, r) => (r.peak.mmr > a.peak.mmr ? r : a), rows[0]);
    const combos = rows.flatMap(r => r.combos).length;

    body.innerHTML = `
        <div class="tiles" style="margin-bottom:18px">
            ${tile(num(best.peak.mmr), t('peak.tile.best'), t('peak.tile.bestSub', {
                mode: best.mode,
                race: peakRace(best.peak).none ? t('season.teamMode') : peakRace(best.peak).name
            }))}
            ${tile(rows.length, t('peak.tile.modes'), t('peak.tile.modesSub'))}
            ${tile(state.peak.seasons.length, t('peak.tile.seasons'), t('peak.tile.seasonsSub'))}
        </div>

        <div class="mode-grid">
            ${rows.map(r => {
                const race = peakRace(r.peak);
                return `<div class="mode-card">
                    <div class="mc-head">
                        <span class="mc-race">${race.none ? esc(r.mode)
                            : `<span class="swatch" style="background:${race.color}"></span>${race.name}`}</span>
                        <span class="mc-mode">${race.none ? t('season.teamMode') : esc(r.mode)}</span>
                    </div>
                    <div class="mc-mmr">${num(r.peak.mmr)} <small>${t('peak.card.mmr')}</small></div>
                    <div class="mc-meta">${esc(where(r.peak))}</div>
                    <div class="mc-meta">${t('peak.card.games', { n: num(r.games) })}</div>
                </div>`;
            }).join('')}
        </div>

        <details style="margin-top:14px">
            <summary class="dim" style="cursor:pointer;font-size:12px">${t('peak.details', { n: combos })}</summary>
            ${tableHtml(
                [{ label: t('th.mode') }, { label: t('th.race') }, { label: t('th.peak'), type: 'num' },
                 { label: t('th.season'), type: 'num' }, { label: t('th.server') },
                 { label: t('th.games'), type: 'num' }, { label: t('th.winrate'), type: 'num' }],
                rows.flatMap(r => r.combos).sort((a, b) => b.peak.mmr - a.peak.mmr).map(c => ({
                    cells: [
                        esc(modeName(c.gameMode, c.id)),
                        `<span class="race-cell"><span class="swatch" style="background:${raceOf(c.race).color}"></span>${raceOf(c.race).name}</span>`,
                        num(c.peak.mmr), t('season.n', { n: c.season }), esc(gatewayName(c.gateWay)),
                        num(c.games), pct(c.winrate)
                    ],
                    sort: [modeName(c.gameMode, c.id), raceOf(c.race).name, c.peak.mmr, c.season,
                           gatewayName(c.gateWay), c.games, c.winrate]
                })))}
        </details>

        <div class="load-more">
            ${state.peak.refined
                ? `<span class="dim" style="font-size:11.5px">${t('peak.refinedNote')}</span>`
                : `<button class="btn small" id="peak-refine">${t('peak.refine', { n: combos })}</button>
                   <span class="dim" style="font-size:11.5px">${t('peak.approx')}</span>`}
        </div>`;

    $('#peak-refine')?.addEventListener('click', refinePeak);
    setStatus(st, t('peak.status', { list: state.peak.seasons.join(', '), k: rows.length }));
}

/* =========================================================================
   SEKCJA 2 — statystyki sezonu
   ========================================================================= */

async function loadSeason() {
    await withStatus('season', t('season.loading', { n: state.season }), async (st) => {
        const { stats, note } = await fetchSeasonStats();
        const body = $('[data-body="season"]');

        if (!stats.length) {
            setStatus(st, t('season.empty', { n: state.season }));
            body.innerHTML = '';
            return;
        }

        const ranked = stats.filter(s => s.games > 0).sort((a, b) => b.games - a.games);
        const totals = ranked.reduce((a, s) => ({ games: a.games + s.games, wins: a.wins + s.wins }), { games: 0, wins: 0 });

        body.innerHTML = `
            <div class="tiles" style="margin-bottom:18px">
                ${tile(num(totals.games), t('season.tile.games'), t('season.tile.gamesSub', { gw: gatewayName(state.gateway), n: state.season }))}
                ${tile(pct(totals.games ? totals.wins / totals.games : 0), t('season.tile.wr'), `${num(totals.wins)} W – ${num(totals.games - totals.wins)} L`)}
                ${tile(num(Math.max(...ranked.map(s => s.mmr))), t('season.tile.topMmr'), t('season.tile.topMmrSub'))}
            </div>
            <div class="mode-grid">
                ${ranked.map(s => {
                    const r = raceOf(s.race);
                    const mode = modeName(s.gameMode, s.id);
                    return `<div class="mode-card">
                        <div class="mc-head">
                            <span class="mc-race">${r.none ? esc(mode)
                                : `<span class="swatch" style="background:${r.color}"></span>${r.name}`}</span>
                            <span class="mc-mode">${r.none ? t('season.teamMode') : esc(mode)}</span>
                        </div>
                        <div class="mc-mmr">${num(s.mmr)} <small>MMR</small></div>
                        <div class="mc-meta">${s.rank ? t('season.rank', { n: num(s.rank) }) : t('season.unranked')} · ${
                            s.rankingPoints ? s.rankingPoints.toFixed(1) : '—'} RP${
                            s.quantile ? ` · ${t('season.top', { p: `${((1 - s.quantile) * 100).toFixed(1)}%` })}` : ''}</div>
                        <div class="mc-meta">${t('season.cardMeta', { n: num(s.games), w: num(s.wins), l: num(s.losses), wr: pct(s.winrate) })}</div>
                        <div class="wr-bar" data-tip="<b>${esc(r.none ? mode : r.name)}</b><div class='t-row'>${
                            esc(t('season.tip', { wr: pct(s.winrate), n: num(s.games) }))}</div>">
                            <span style="width:${(s.winrate * 100).toFixed(1)}%"></span>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
        setStatus(st, note || t('season.status', { n: state.season, gw: gatewayName(state.gateway), k: ranked.length }));
    });
}

/* =========================================================================
   SEKCJA 3 — wykres MMR
   ========================================================================= */

async function loadMmr() {
    await withStatus('mmr', t('mmr.checking'), async (st) => {
        const { stats, note } = await fetchSeasonStats();
        const body = $('[data-body="mmr"]');
        const withGames = stats.filter(s => s.games > 0).sort((a, b) => b.games - a.games);

        if (!withGames.length) {
            setStatus(st, t('mmr.noGames', { n: state.season }));
            body.innerHTML = '';
            return;
        }

        body.innerHTML = `
            <div class="inline-filters">
                <label>${t('mmr.combo')}
                    <select id="mmr-combo">
                        ${withGames.map((s, i) => `<option value="${i}">${esc(t('mmr.comboOption', {
                            mode: modeName(s.gameMode, s.id), race: raceOf(s.race).name, n: num(s.games) }))}</option>`).join('')}
                    </select>
                </label>
                <label>${t('mmr.metric')}
                    <select id="mmr-metric">
                        <option value="mmr">${t('mmr.metric.mmr')}</option>
                        <option value="rp">${t('mmr.metric.rp')}</option>
                    </select>
                </label>
            </div>
            <div id="mmr-chart"></div>`;

        const draw = async () => {
            const s = withGames[+$('#mmr-combo').value];
            const metric = $('#mmr-metric').value;
            const holder = $('#mmr-chart');
            holder.innerHTML = `<p class="empty">${t('mmr.fetching')}</p>`;

            const data = await api(`/players/${encodeURIComponent(state.tag)}/mmr-rp-timeline`,
                { race: s.race, gateWay: state.gateway, season: state.season, gameMode: s.gameMode });
            const pts = (data?.mmrRpAtDates || []).map(d => ({ t: d.date, v: metric === 'mmr' ? d.mmr : d.rp }));

            if (!pts.length) { holder.innerHTML = `<p class="empty">${t('mmr.noHistory')}</p>`; return; }

            const vals = pts.map(p => p.v);
            const last = vals[vals.length - 1], delta = last - vals[0];
            const label = metric === 'mmr' ? t('mmr.metric.mmr') : 'RP';

            holder.innerHTML = `
                <div class="chart-title">${t('mmr.title', {
                    label, mode: esc(modeName(s.gameMode, s.id)), race: raceOf(s.race).name, n: state.season })}</div>
                ${lineChart(pts, { height: 260 })}
                <div class="tiles" style="margin-top:16px">
                    ${tile(num(Math.round(last)), t('mmr.current', { label }),
                        t('mmr.currentSub', { dir: delta >= 0 ? t('mmr.up') : t('mmr.down'), d: signed(Math.round(delta)) }))}
                    ${tile(num(Math.round(Math.max(...vals))), t('mmr.peak', { label }), dateShort(pts[vals.indexOf(Math.max(...vals))].t))}
                    ${tile(num(Math.round(Math.min(...vals))), t('mmr.min', { label }), dateShort(pts[vals.indexOf(Math.min(...vals))].t))}
                </div>
                <details style="margin-top:14px">
                    <summary class="dim" style="cursor:pointer;font-size:12px">${t('mmr.tableToggle', { n: pts.length })}</summary>
                    ${tableHtml([{ label: t('th.date') }, { label, type: 'num' }, { label: t('th.change'), type: 'num' }],
                        pts.map((p, i) => {
                            const d = i ? p.v - pts[i - 1].v : 0;
                            return {
                                cells: [dateTime(p.t), num(Math.round(p.v)),
                                    i ? `<span class="${d > 0 ? 'pos' : d < 0 ? 'neg' : 'dim'}">${signed(Math.round(d))}</span>` : '<span class="dim">—</span>'],
                                sort: [+new Date(p.t), p.v, d]
                            };
                        }))}
                </details>`;
        };

        const redraw = () => draw().catch(e => setStatus(st, t('common.error', { msg: e.message }), 'error'));
        $('#mmr-combo').addEventListener('change', redraw);
        $('#mmr-metric').addEventListener('change', redraw);
        await draw();
        setStatus(st, note || t('mmr.status', { n: state.season, gw: gatewayName(state.gateway) }));
    });
}

/* =========================================================================
   SEKCJA 4 — matchupy i mapy (agregaty po stronie W3Champions)
   ========================================================================= */

async function loadMatchup() {
    await withStatus('matchup', t('mu.loading'), async (st) => {
        const data = await api(`/player-stats/${encodeURIComponent(state.tag)}/race-on-map-versus-race`, { season: state.season });
        const body = $('[data-body="matchup"]');
        const patches = Object.keys(data?.raceWinsOnMapByPatch || {});

        if (!patches.length) { setStatus(st, t('mu.empty', { n: state.season })); body.innerHTML = ''; return; }

        const preferred = patches.includes('All') ? 'All' : patches[0];
        body.innerHTML = `
            <div class="inline-filters">
                <label>${t('mu.yourRace')} <select id="mu-race"></select></label>
                <label>${t('mu.patch')}
                    <select id="mu-patch">
                        ${patches.map(p => `<option value="${esc(p)}"${p === preferred ? ' selected' : ''}>${p === 'All' ? t('mu.allPatches') : esc(p)}</option>`).join('')}
                    </select>
                </label>
            </div>
            <div id="mu-body"></div>`;

        const fillRaces = () => {
            const entries = data.raceWinsOnMapByPatch[$('#mu-patch').value] || [];
            const played = entries.filter(e => {
                const ov = e.winLossesOnMap.find(m => m.map === 'Overall');
                return ov && ov.winLosses.some(w => w.games > 0);
            });
            const prev = $('#mu-race').value;
            $('#mu-race').innerHTML = played.map(e => `<option value="${e.race}">${raceOf(e.race).name}</option>`).join('')
                || `<option value="">${t('mu.noGames')}</option>`;
            if (played.some(e => String(e.race) === prev)) $('#mu-race').value = prev;
        };

        const draw = () => {
            const entries = data.raceWinsOnMapByPatch[$('#mu-patch').value] || [];
            const entry = entries.find(e => String(e.race) === $('#mu-race').value);
            const holder = $('#mu-body');
            if (!entry) { holder.innerHTML = `<p class="empty">${t('mu.noGamesRace')}</p>`; return; }

            const overall = entry.winLossesOnMap.find(m => m.map === 'Overall');
            const vs = (overall?.winLosses || []).filter(w => w.games > 0)
                .sort((a, b) => RACE_ORDER.indexOf(a.race) - RACE_ORDER.indexOf(b.race));

            const maps = entry.winLossesOnMap.filter(m => m.map !== 'Overall').map(m => {
                const tot = m.winLosses.reduce((a, w) => ({ wins: a.wins + w.wins, losses: a.losses + w.losses, games: a.games + w.games }),
                    { wins: 0, losses: 0, games: 0 });
                return { name: m.mapName || prettyMap(m.map), ...tot, winrate: tot.games ? tot.wins / tot.games : 0 };
            }).filter(m => m.games > 0).sort((a, b) => b.games - a.games);

            holder.innerHTML = `
                <div class="split">
                    <div>
                        <div class="chart-title">${t('mu.vsTitle', { race: raceOf(entry.race).name })}</div>
                        ${barsHtml(vs.map(w => ({
                            label: t('mu.vs', { race: raceOf(w.race).name }),
                            value: w.winrate,
                            color: raceOf(w.race).color,
                            right: `${pct(w.winrate)} <small class="dim">(${w.wins}–${w.losses})</small>`,
                            tip: `<b>${t('mu.vs', { race: raceOf(w.race).name })}</b><div class="t-row">${
                                t('tip.gamesWl', { n: num(w.games), w: w.wins, l: w.losses })}</div>`
                        })), { reference: 0.5 })}
                    </div>
                    <div>
                        <div class="chart-title">${t('mu.mapsTitle', { n: maps.length })}</div>
                        ${tableHtml([{ label: t('th.map') }, { label: t('th.games'), type: 'num' }, { label: t('th.w'), type: 'num' },
                                     { label: t('th.l'), type: 'num' }, { label: t('th.winrate'), type: 'num' }],
                            maps.map(m => ({
                                cells: [esc(m.name), num(m.games), num(m.wins), num(m.losses),
                                    `<span class="${m.winrate > 0.5 ? 'pos' : m.winrate < 0.5 ? 'neg' : 'dim'}">${pct(m.winrate)}</span>`],
                                sort: [m.name, m.games, m.wins, m.losses, m.winrate]
                            })))}
                    </div>
                </div>`;
        };

        $('#mu-patch').addEventListener('change', () => { fillRaces(); draw(); });
        $('#mu-race').addEventListener('change', draw);
        fillRaces();
        draw();
        setStatus(st, t('mu.status', { n: state.season }));
    });
}

/* =========================================================================
   SEKCJA 5 — mecze i przeciwnicy (stronicowane, po 100)
   ========================================================================= */

async function loadMatches() {
    if (state.matches.loading) return;
    state.matches.loading = true;
    const m = state.matches;
    await withStatus('matches', t('mt.loading', { a: m.offset + 1, b: m.offset + PAGE_SIZE }), async (st) => {
        const res = await api('/matches/search', {
            playerId: state.tag, gateway: state.gateway, season: state.season,
            gameMode: m.mode || undefined, offset: m.offset, pageSize: PAGE_SIZE
        });
        m.count = res.count ?? 0;
        m.list.push(...(res.matches || []));
        m.offset += (res.matches || []).length;
        renderMatches(st);
    });
    state.matches.loading = false;
}

async function loadAllMatches() {
    if (state.matches.loading) return;
    state.matches.loading = true;
    const st = $('[data-status="matches"]'), m = state.matches;
    try {
        while (m.count === null || m.offset < m.count) {
            setStatus(st, t('mt.loadingOf', {
                a: m.offset + 1, b: Math.min(m.offset + PAGE_SIZE, m.count ?? 0), total: num(m.count ?? 0) }), 'busy');
            const res = await api('/matches/search', {
                playerId: state.tag, gateway: state.gateway, season: state.season,
                gameMode: m.mode || undefined, offset: m.offset, pageSize: PAGE_SIZE
            });
            m.count = res.count ?? 0;
            const batch = res.matches || [];
            if (!batch.length) break;
            m.list.push(...batch);
            m.offset += batch.length;
        }
        renderMatches(st);
    } catch (err) {
        setStatus(st, t('common.error', { msg: err.message }), 'error');
    }
    state.matches.loading = false;
}

/** Wszystkie agregaty liczone z już wczytanych meczów. */
function aggregate(matches, myTag) {
    const agg = {
        games: 0, wins: 0, mmrDelta: 0, durationSum: 0,
        opponents: new Map(), maps: new Map(), oppRaces: new Map(),
        myRaces: new Map(), heroes: new Map(), buckets: new Map(), rows: []
    };
    const bump = (map, key, won, extra = {}) => {
        const e = map.get(key) || { key, games: 0, wins: 0, mmr: 0, last: 0, ...extra };
        e.games++; if (won) e.wins++;
        map.set(key, e);
        return e;
    };

    const ordered = matches.slice().sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));

    for (const m of ordered) {
        let me = null, myTeam = -1;
        (m.teams || []).forEach((team, i) => (team.players || []).forEach(p => {
            if (eqTag(p.battleTag, myTag)) { me = p; myTeam = i; }
        }));
        if (!me) continue;

        const won = !!me.won;
        agg.games++; if (won) agg.wins++;
        agg.mmrDelta += me.mmrGain || 0;
        agg.durationSum += m.durationInSeconds || 0;

        const opponents = (m.teams || []).filter((_, i) => i !== myTeam).flatMap(team => team.players || []);
        for (const o of opponents) {
            const e = bump(agg.opponents, o.battleTag, won, { races: new Set() });
            e.mmr += me.mmrGain || 0;
            e.last = Math.max(e.last, +new Date(m.startTime));
            e.races.add(o.race);
            e.oppMmr = o.currentMmr ?? o.oldMmr ?? e.oppMmr;
        }
        if (opponents.length === 1) bump(agg.oppRaces, opponents[0].race, won);

        bump(agg.maps, m.mapName || prettyMap(m.map), won);
        bump(agg.myRaces, me.race === 0 && me.rndRace != null
            ? t('mt.rnd', { race: raceOf(me.rndRace).short }) : raceOf(me.race).name, won);
        if (me.heroes?.length) bump(agg.heroes, me.heroes[0].name, won);

        const mins = (m.durationInSeconds || 0) / 60;
        bump(agg.buckets, mins < 5 ? '< 5 min' : mins < 10 ? '5–10 min' : mins < 15 ? '10–15 min'
            : mins < 25 ? '15–25 min' : '25+ min', won);

        agg.rows.push({
            date: m.startTime, won, map: m.mapName || prettyMap(m.map),
            myRace: me.race, mmr: me.currentMmr, gain: me.mmrGain || 0,
            duration: m.durationInSeconds,
            opps: opponents.map(o => ({ tag: o.battleTag, race: o.race }))
        });
    }

    let cur = 0, bestW = 0, bestL = 0;
    for (const r of agg.rows) {
        cur = r.won ? (cur > 0 ? cur + 1 : 1) : (cur < 0 ? cur - 1 : -1);
        bestW = Math.max(bestW, cur); bestL = Math.min(bestL, cur);
    }
    agg.streakBestWin = bestW;
    agg.streakBestLoss = Math.abs(bestL);
    agg.streakCurrent = cur;
    return agg;
}

function renderMatches(st) {
    const body = $('[data-body="matches"]');
    const a = aggregate(state.matches.list, state.tag);
    const loaded = state.matches.offset, total = state.matches.count ?? 0;
    const activeTab = $('.tabs button[aria-selected="true"]')?.dataset.tab || 'opponents';

    const wl = (e) => `${e.wins}–${e.games - e.wins}`;
    const listOf = (map, minGames = 1) => Array.from(map.values())
        .filter(e => e.games >= minGames)
        .sort((x, y) => y.games - x.games)
        .map(e => ({ ...e, winrate: e.games ? e.wins / e.games : 0 }));

    const tabs = [
        ['opponents', t('mt.tab.opponents', { n: a.opponents.size })],
        ['maps', t('mt.tab.maps')],
        ['races', t('mt.tab.races')],
        ['heroes', t('mt.tab.heroes')],
        ['length', t('mt.tab.length')],
        ['recent', t('mt.tab.recent')]
    ];

    body.innerHTML = `
        <div class="inline-filters">
            <label>${t('mt.mode')}
                <select id="mt-mode">
                    <option value="">${t('mt.allModes')}</option>
                    ${Object.entries(MODE_NAMES).map(([v, n]) =>
                        `<option value="${v}"${state.matches.mode == v ? ' selected' : ''}>${n}</option>`).join('')}
                </select>
            </label>
            <label>${t('mt.minGames')}
                <input id="mt-min" type="number" min="1" value="2" style="width:90px">
            </label>
        </div>

        <div class="tiles" style="margin-bottom:18px">
            ${tile(num(a.games), t('mt.tile.loaded'), t('mt.tile.loadedSub', { n: num(total) }))}
            ${tile(pct(a.games ? a.wins / a.games : 0), t('tile.winrate'), `${num(a.wins)} W – ${num(a.games - a.wins)} L`)}
            ${tile(signed(a.mmrDelta), t('mt.tile.mmr'), t('mt.tile.mmrSub'))}
            ${tile(duration(a.games ? a.durationSum / a.games : 0), t('mt.tile.avg'), t('mt.tile.avgSub'))}
            ${tile(`${a.streakBestWin}W / ${a.streakBestLoss}L`, t('mt.tile.streak'),
                t('mt.tile.streakSub', { s: a.streakCurrent >= 0 ? `${a.streakCurrent}W` : `${Math.abs(a.streakCurrent)}L` }))}
        </div>

        <div class="tabs" role="tablist">
            ${tabs.map(([id, label]) => `<button role="tab" data-tab="${id}" aria-selected="${id === activeTab}">${esc(label)}</button>`).join('')}
        </div>
        <div id="mt-panel"></div>

        <div class="load-more">
            <button class="btn small" id="mt-more" ${loaded >= total ? 'disabled' : ''}>${t('mt.more', { n: Math.min(PAGE_SIZE, Math.max(0, total - loaded)) })}</button>
            <button class="btn small" id="mt-all" ${loaded >= total ? 'disabled' : ''}>${t('mt.all', { n: num(Math.max(0, total - loaded)) })}</button>
            <div class="progress" title="${loaded} / ${total}"><span style="width:${total ? (loaded / total * 100).toFixed(1) : 0}%"></span></div>
            <span class="dim" style="font-size:11.5px">${num(loaded)} / ${num(total)}</span>
        </div>`;

    const renderTab = () => {
        const tab = $('.tabs button[aria-selected="true"]').dataset.tab;
        const panel = $('#mt-panel');
        const minGames = Math.max(1, +$('#mt-min').value || 1);

        if (tab === 'opponents') {
            const rows = listOf(a.opponents, minGames);
            panel.innerHTML = tableHtml(
                [{ label: t('th.opponent') }, { label: t('th.games'), type: 'num' }, { label: t('th.record') },
                 { label: t('th.winrate'), type: 'num' }, { label: t('th.mmrWith'), type: 'num' },
                 { label: t('th.theirMmr'), type: 'num' }, { label: t('th.races') }, { label: t('th.last'), type: 'num' }],
                rows.map(e => ({
                    cells: [
                        `<a class="ext-link" href="https://w3champions.com/player/${encodeURIComponent(e.key)}" target="_blank" rel="noopener">${esc(e.key)}</a>`,
                        num(e.games), wl(e),
                        `<span class="${e.winrate > 0.5 ? 'pos' : e.winrate < 0.5 ? 'neg' : 'dim'}">${pct(e.winrate)}</span>`,
                        `<span class="${e.mmr > 0 ? 'pos' : e.mmr < 0 ? 'neg' : 'dim'}">${signed(e.mmr)}</span>`,
                        num(e.oppMmr ?? null),
                        Array.from(e.races).map(r => `<span class="swatch" style="background:${raceOf(r).color}" title="${esc(raceOf(r).name)}"></span>`).join(' '),
                        dateShort(e.last)
                    ],
                    sort: [e.key, e.games, e.wins, e.winrate, e.mmr, e.oppMmr ?? 0, '', e.last]
                })));
        } else if (tab === 'maps') {
            const rows = listOf(a.maps);
            panel.innerHTML = `<div class="split">
                <div>${barsHtml(rows.slice(0, 12).map(e => ({
                    label: e.key, value: e.winrate, right: `${pct(e.winrate)} <small class="dim">(${wl(e)})</small>`,
                    tip: `<b>${esc(e.key)}</b><div class="t-row">${t('tip.gamesWl', { n: num(e.games), w: e.wins, l: e.games - e.wins })}</div>`
                })), { reference: 0.5 })}</div>
                <div>${tableHtml([{ label: t('th.map') }, { label: t('th.games'), type: 'num' }, { label: t('th.record') }, { label: t('th.winrate'), type: 'num' }],
                    rows.map(e => ({ cells: [esc(e.key), num(e.games), wl(e), pct(e.winrate)], sort: [e.key, e.games, e.wins, e.winrate] })))}</div>
            </div>`;
        } else if (tab === 'races') {
            const vs = listOf(a.oppRaces).sort((x, y) => RACE_ORDER.indexOf(x.key) - RACE_ORDER.indexOf(y.key));
            const mine = listOf(a.myRaces);
            panel.innerHTML = `<div class="split">
                <div>
                    <div class="chart-title">${t('mt.vsRaces')}</div>
                    ${barsHtml(vs.map(e => ({
                        label: t('mu.vs', { race: raceOf(e.key).name }), value: e.winrate, color: raceOf(e.key).color,
                        right: `${pct(e.winrate)} <small class="dim">(${wl(e)})</small>`,
                        tip: `<b>${t('mu.vs', { race: raceOf(e.key).name })}</b><div class="t-row">${
                            t('tip.gamesWl', { n: num(e.games), w: e.wins, l: e.games - e.wins })}</div>`
                    })), { reference: 0.5 })}
                </div>
                <div>
                    <div class="chart-title">${t('mt.yourRaces')}</div>
                    ${tableHtml([{ label: t('th.race') }, { label: t('th.games'), type: 'num' }, { label: t('th.record') }, { label: t('th.winrate'), type: 'num' }],
                        mine.map(e => ({ cells: [esc(e.key), num(e.games), wl(e), pct(e.winrate)], sort: [e.key, e.games, e.wins, e.winrate] })))}
                </div>
            </div>`;
        } else if (tab === 'heroes') {
            const rows = listOf(a.heroes, minGames);
            panel.innerHTML = `<div class="chart-title">${t('mt.heroesTitle', { n: rows.length })}</div>
                ${barsHtml(rows.slice(0, 12).map(e => ({
                    label: e.key, value: e.winrate, right: `${pct(e.winrate)} <small class="dim">(${wl(e)})</small>`,
                    tip: `<b>${esc(e.key)}</b><div class="t-row">${t('tip.gamesWl', { n: num(e.games), w: e.wins, l: e.games - e.wins })}</div>`
                })), { reference: 0.5 })}`;
        } else if (tab === 'length') {
            const order = ['< 5 min', '5–10 min', '10–15 min', '15–25 min', '25+ min'];
            const rows = listOf(a.buckets).sort((x, y) => order.indexOf(x.key) - order.indexOf(y.key));
            panel.innerHTML = `<div class="split">
                <div>
                    <div class="chart-title">${t('mt.lengthWr')}</div>
                    ${barsHtml(rows.map(e => ({
                        label: e.key, value: e.winrate, right: `${pct(e.winrate)} <small class="dim">(${wl(e)})</small>`,
                        tip: `<b>${esc(e.key)}</b><div class="t-row">${t('tip.gamesWl', { n: num(e.games), w: e.wins, l: e.games - e.wins })}</div>`
                    })), { reference: 0.5 })}
                </div>
                <div>
                    <div class="chart-title">${t('mt.lengthShare')}</div>
                    ${barsHtml(rows.map(e => ({
                        label: e.key, value: e.games, right: t('mt.games', { n: num(e.games) }),
                        tip: `<b>${esc(e.key)}</b><div class="t-row">${t('mt.games', { n: num(e.games) })}</div>`
                    })), { max: Math.max(...rows.map(e => e.games), 1) })}
                </div>
            </div>`;
        } else {
            panel.innerHTML = tableHtml(
                [{ label: t('th.date') }, { label: t('th.result') }, { label: t('th.race') }, { label: t('th.opponent') },
                 { label: t('th.map') }, { label: t('th.time'), type: 'num' }, { label: 'MMR', type: 'num' }, { label: t('th.change'), type: 'num' }],
                a.rows.slice().reverse().slice(0, 60).map(r => ({
                    _class: r.won ? 'match-row-win' : 'match-row-loss',
                    cells: [
                        dateTime(r.date),
                        `<span class="${r.won ? 'pos' : 'neg'}">${r.won ? t('mt.win') : t('mt.loss')}</span>`,
                        `<span class="race-cell"><span class="swatch" style="background:${raceOf(r.myRace).color}"></span>${raceOf(r.myRace).short}</span>`,
                        r.opps.map(o => `<span class="race-cell"><span class="swatch" style="background:${raceOf(o.race).color}"></span>${esc(o.tag)}</span>`).join(', '),
                        esc(r.map), duration(r.duration), num(r.mmr),
                        `<span class="${r.gain > 0 ? 'pos' : r.gain < 0 ? 'neg' : 'dim'}">${signed(r.gain)}</span>`
                    ],
                    sort: [+new Date(r.date), r.won ? 1 : 0, raceOf(r.myRace).short, r.opps[0]?.tag || '', r.map, r.duration, r.mmr, r.gain]
                })));
        }
    };

    $('.tabs').addEventListener('click', (ev) => {
        const b = ev.target.closest('button[data-tab]');
        if (!b) return;
        $$('.tabs button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
        renderTab();
    });
    $('#mt-min').addEventListener('change', renderTab);
    $('#mt-mode').addEventListener('change', (e) => {
        state.matches = { offset: 0, count: null, list: [], mode: e.target.value, loading: false };
        body.innerHTML = '';
        loadMatches();
    });
    $('#mt-more').addEventListener('click', loadMatches);
    $('#mt-all').addEventListener('click', loadAllMatches);

    const headBtn = $('[data-load="matches"]');
    const done = loaded >= total;
    headBtn.textContent = done ? t('mt.done') : t('mt.more', { n: Math.min(PAGE_SIZE, total - loaded) });
    headBtn.dataset.exhausted = done ? '1' : '0';
    headBtn.disabled = done;

    renderTab();
    setStatus(st, t('mt.status', { a: num(loaded), b: num(total), n: state.season, gw: gatewayName(state.gateway) }));
}

/* =========================================================================
   START — tłumaczenia + deep link ?player=
   ========================================================================= */

(function init() {
    applyStatic();

    // stopka: rok i adres e-mail składany dopiero po kliknięciu (mniej dla botów)
    $('#current-year').textContent = new Date().getFullYear();
    $('#reveal-email-btn').addEventListener('click', (ev) => {
        $('#email-display').textContent = ['janczurasergiusz', '@protonmail.com'].join('');
        ev.currentTarget.remove();
    });

    const q = new URLSearchParams(location.search).get('player');
    if (q) {
        $('#search-input').value = q;
        loadPlayer(parseInput(q));
    }
})();
