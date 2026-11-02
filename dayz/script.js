// Kategorie w kolejności wyświetlania filtrów. Punkty i nazwy pochodzą z data.js (build_data.py).
// Kategorie z `mpp` (nazwy miejsc, obiekty wojskowe, spawny pojazdów) pokazują się, gdy na piksel mapy przypada mniej niż `mpp` metrów.
// Kategoria z `filter` nie ma własnego filtra, jej punkty włącza filtr wskazanej kategorii.
// Kategoria z `off` jest wyłączona przy pierwszej wizycie; potem filtry pamięta przeglądarka.
// Punkt z promieniem to strefa (koło w metrach) opisana przez `zone` w miejsce `note`.
const VEHICLE = { filter: 'vehicle', r: 5, color: '#e599f7', note: 'event, pojazd stoi tylko w części tych miejsc' };
const BUNKER = { filter: 'bunker', r: 7, color: '#ffd43b', note: 'zamek na 4-cyfrowy kod; aktywne są 3 naraz, ich współrzędne i kody radio nadaje Morse\'em 17:45–06:00 czasu gry (wpisz komunikat w wyszukiwarkę)' };
const GAME = { filter: 'game', color: '#1864ab', fill: 0.15, zone: 'teren występowania' };  // tereny często na siebie zachodzą
const DANGER = { filter: 'danger', color: '#e03131', fill: 0.15, zone: 'atakuje · teren występowania' };
const TIERS = ['#dc8a3c', '#c06a1f', '#9c4f12', '#7c3c0c', '#6250d6'];  // tier 1–4 i Unique, te same co TIERS w build_data.py
const FOOD = '#d6336c';  // podświetlenie budynków z jedzeniem i drzew owocowych w warstwie terenu
const CATS = {
    city:       { label: 'Miasta',                      place: true, mpp: 40 },
    village:    { label: 'Wioski',                      place: true, mpp: 12 },
    other:      { label: 'Inne miejsca',                place: true, mpp: 6 },
    spawn:      { label: 'Spawny graczy',               name: 'Spawn gracza',           r: 6, color: '#94d82d', note: 'nowa postać pojawia się w pobliżu tego punktu' },
    tier:       { label: 'Strefy łupu (tier)',          color: TIERS[2], legend: TIERS, off: true, title: 'Najwyższy tier łupu w danym miejscu. U (Unique): tylko tu pojawiają się niektóre rzadkie przedmioty' },
    hospital:   { label: 'Szpitale',                    name: 'Szpital',                r: 9, color: '#ff4d4d' },
    clinic:     { label: 'Przychodnie',                 name: 'Przychodnia',            r: 6, color: '#ff9f43' },
    medtent:    { label: 'Namioty i kontenery medyczne', name: 'Punkt medyczny',        r: 5, color: '#f78fb3' },
    police:     { label: 'Policja: posterunki, radiowozy', name: 'Posterunek policji',  r: 7, color: '#f8f9fa', note: 'łup policyjny' },
    policecar:  { filter: 'police',                     name: 'Radiowóz / interwencja policji', r: 4, color: '#f8f9fa', note: 'event, losowo w części tych miejsc' },
    fuel:       { label: 'Stacje benzynowe',            name: 'Stacja benzynowa',       r: 6, color: '#7f5539', note: 'dystrybutory paliwa, tankowanie do kanistra' },
    vehicle:    { label: 'Spawny pojazdów',             color: VEHICLE.color, mpp: 12 },
    car:        { ...VEHICLE, name: 'Spawn samochodu' },
    truck:      { ...VEHICLE, name: 'Spawn ciężarówki' },
    moto:       { ...VEHICLE, name: 'Spawn motocykla' },
    boat:       { ...VEHICLE, name: 'Spawn łodzi' },
    mil:        { label: 'Obiekty wojskowe',            name: 'Obiekt wojskowy',        r: 4, color: '#5c7a29', mpp: 12, note: 'łup wojskowy' },
    crash:      { label: 'Katastrofy lotnicze',         name: 'Katastrofa helikoptera / samolotu', r: 6, color: '#212529', note: 'event, losowo w części tych miejsc' },
    convoy:     { label: 'Konwoje i łodzie wojskowe',   name: 'Konwój / łódź wojskowa', r: 6, color: '#a61e4d', note: 'event, losowo w części tych miejsc' },
    locked:     { label: 'Zamknięte kontenery',         name: 'Zamknięty kontener z łupem', r: 6, color: '#868e96', note: 'event, stoi tylko w części tych miejsc; otwiera klucz w kolorze kontenera, zły klucz się niszczy' },
    bunker:     { label: 'Bunkry z zamkiem na kod',     color: BUNKER.color, off: true },
    bunkerstorage: { ...BUNKER, name: 'Bunkier magazynowy' },
    bunkermedical: { ...BUNKER, name: 'Bunkier medyczny' },
    bunkercivil:   { ...BUNKER, name: 'Bunkier cywilny' },
    bunkeroffice:  { ...BUNKER, name: 'Bunkier biurowy' },
    gas:        { label: 'Strefy skażone',              name: 'Strefa skażona',         r: 5, color: '#fab005', stroke: '#e67700', zone: 'stała', note: 'możliwe miejsce strefy dynamicznej (event)' },
    food:       { label: 'Jedzenie: budynki, drzewa owocowe', color: FOOD, mpp: 5, off: true,  // rysuje warstwa terenu
                  title: 'Widać po przybliżeniu: budynki, w których może pojawić się jedzenie, i drzewa owocowe. Grzyby rosną pod drzewami w lasach' },
    well:       { label: 'Studnie ceglane',             name: 'Studnia ceglana',        r: 7, color: '#1c3faa', note: 'działa po odbudowie dachu, pije się wiadrem' },
    trough:     { label: 'Koryta z wodą',               name: 'Koryto z wodą',          r: 6, color: '#12b886' },
    pump:       { label: 'Pompy wody',                  name: 'Pompa wody',             r: 6, color: '#7048e8' },
    sink:       { label: 'Umywalki',                    name: 'Umywalka (kran)',        r: 5, color: '#a5d8ff' },
    spring:     { label: 'Źródła wody',                 name: 'Źródło wody',            r: 6, color: '#1098ad' },
    watertruck: { label: 'Cysterny z wodą',             name: 'Cysterna z wodą', r: 6, color: '#74c0fc', note: 'event, nie wszystkie stoją naraz' },
    game:       { label: 'Zwierzęta łowne',             color: GAME.color, off: true },
    deer:       { ...GAME, name: 'Jeleń' },
    roedeer:    { ...GAME, name: 'Sarna' },
    reindeer:   { ...GAME, name: 'Renifer' },
    boar:       { ...GAME, name: 'Dzik' },
    pig:        { ...GAME, name: 'Świnia' },
    cow:        { ...GAME, name: 'Krowa' },
    sheep:      { ...GAME, name: 'Owca' },
    goat:       { ...GAME, name: 'Koza' },
    mouflon:    { ...GAME, name: 'Muflon' },
    hen:        { ...GAME, name: 'Kura' },
    hare:       { ...GAME, name: 'Zając' },
    fox:        { ...GAME, name: 'Lis' },
    lizard:     { ...GAME, name: 'Waran' },
    danger:     { label: 'Groźne zwierzęta',            color: DANGER.color, off: true },
    wolf:       { ...DANGER, name: 'Wilk' },
    bear:       { ...DANGER, name: 'Niedźwiedź' },
    dog:        { ...DANGER, name: 'Pies' },
    hotspring:  { label: 'Gorące źródła',               name: 'Gorące źródło',          r: 5, color: '#e8590c', note: 'parzy, gdy woda sięga powyżej 0,5 m; picie: zatrucie i metale ciężkie' },
    volcano:    { label: 'Strefy wulkaniczne',          name: 'Strefa wulkaniczna',     r: 6, color: '#e03131', note: 'parzy cały czas, gdy w niej stoisz' },
    geyser:     { label: 'Gejzery',                     name: 'Gejzer',                 r: 7, color: '#862e9c', note: 'wybucha co 50–120 min, erupcja zabija na miejscu' },
};
const PLACE = { capital: 'city', city: 'city', village: 'village' };  // typ z gry -> filtr, reszta: 'other'
const KM = 1000;
const BG = { nasdara: '#e9dfc6', namalsk: '#e4eaee', sakhal: '#e6ebef', chernarusplus: '#e4ead6', livonia: '#e4ead6' };
const PLANTS = { orchard: ['#a9b96e', 3], leafy: ['#7fa35a', 4], conifer: ['#577f4c', 4], rock: ['#a3a3a3', 3] };  // kolor, promień w m
const ROADS = { dirt: ['#a5804f', 4, 0.8], grav: ['#b39468', 5, 1], asf: ['#5f5a55', 7, 1.6] };  // kolor, szerokość w m, min. px
const TERRAIN = {};  // wypełniane przez terrain-<mapa>.js
const RELIEF = {};   // obraz rzeźby terenu relief-<mapa>.webp
const $ = id => document.getElementById(id);
let map, sync, measure, ruler, tool = null, pins = [], pinsKey;

// Filtry z poprzedniej wizyty; kategoria bez zapisu (np. nowa) dostaje ustawienie domyślne.
let saved = {};
try { saved = JSON.parse(localStorage.getItem('dayz-filters')) || {}; } catch { /* brak zapisu lub tryb prywatny */ }
const enabled = new Set(Object.keys(CATS).filter(cat => saved[cat] ?? !CATS[cat].off));
const saveFilters = () => {
    try { localStorage.setItem('dayz-filters', JSON.stringify(Object.fromEntries(Object.keys(CATS).map(cat => [cat, enabled.has(cat)])))); } catch { /* jw. */ }
};

// Komunikat z radia: cyfry albo Morse. Cyfra w Morse'ie ma zawsze 5 znaków, więc odstępy między nimi są zbędne.
const MORSE = ['-----', '.----', '..---', '...--', '....-', '.....', '-....', '--...', '---..', '----.'];
function digits(text) {
    let out = '';
    for (const run of text.replace(/[–—_−]/g, '-').replace(/[·•]/g, '.').replace(/[^\d.-]/g, '').match(/\d+|[.-]+/g) || []) {
        if (/\d/.test(run)) { out += run; continue; }
        for (let i = 0; i < run.length; i += 5) {
            const d = MORSE.indexOf(run.slice(i, i + 5));
            if (d < 0) return null;
            out += d;
        }
    }
    return out;
}
console.assert(digits('.---- ..---/...-- 45') === '12345' && digits('---- .') === '9' && digits('..-') === null, 'digits()');

// Narzędzia: własne znaczniki (zapisywane w przeglądarce, osobno dla każdej mapy) i linijka.
// Czas przebycia odcinka: prędkości zmierzone przez graczy, bieg ok. 4,1 m/s (14,7 km/h), sprint ok. 6,5 m/s (23–24 km/h).
// Pełna stamina starcza na ok. 25 s sprintu (gra zużywa 4 z 100 pkt na sekundę), więc dłuższy sprint to wartość teoretyczna.
const JOG = 4.1, SPRINT = 6.5;
const dist = m => m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toLocaleString('pl', { maximumFractionDigits: 2 })} km`;
const time = sec => {
    const s = Math.round(sec), min = Math.round(sec / 60);
    return s < 60 ? `${s} s` : s < 3600 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${Math.floor(min / 60)} h ${min % 60} min`;
};
const pace = m => `bieg ${time(m / JOG)}, sprint ${time(m / SPRINT)}`;
const length = pts => pts.reduce((sum, p, i) => i ? sum + map.distance(pts[i - 1], p) : 0, 0);
const tools = document.createElement('div');
tools.className = 'leaflet-bar tools';
tools.innerHTML = '<button type="button" data-tool="pin" title="Dodaj znacznik: kliknij na mapie" aria-label="Dodaj znacznik">📍</button>'
    + '<button type="button" data-tool="ruler" title="Zmierz odległość: klikaj kolejne punkty, Esc kończy" aria-label="Zmierz odległość">📏</button>';
L.DomEvent.disableClickPropagation(tools);
tools.onclick = e => { const t = e.target.closest('button')?.dataset.tool; if (t) setTool(tool === t ? null : t); };
addEventListener('keydown', e => e.key === 'Escape' && setTool(null));

// Wyłączenie linijki czyści pomiar.
function setTool(t) {
    tool = t;
    for (const b of tools.children) b.setAttribute('aria-pressed', b.dataset.tool === t);
    map.getContainer().classList.toggle('tool', !!t);
    t ? map.doubleClickZoom.disable() : map.doubleClickZoom.enable();
    if (t !== 'ruler') {
        measure.clearLayers();
        ruler = L.polyline([], { color: '#c92a2a', weight: 2, dashArray: '6 4', interactive: false }).addTo(measure);
    }
}

function onMapClick(e) {
    if (tool === 'pin') {
        const name = prompt('Nazwa znacznika:', '');
        setTool(null);
        if (name === null) return;
        const p = [Math.round(e.latlng.lng), Math.round(e.latlng.lat), name.trim() || 'Znacznik'];
        pins.push(p);
        savePins();
        addPin(p);
    } else if (tool === 'ruler') {
        ruler.addLatLng(e.latlng);
        measure.addLayer(L.circleMarker(e.latlng, { radius: 3, color: '#c92a2a', fillOpacity: 1, interactive: false }));
        const pts = ruler.getLatLngs(), len = length(pts);
        if (pts.length > 1) measure.addLayer(L.tooltip({ permanent: true, direction: 'right', offset: [6, 0] }).setLatLng(e.latlng).setContent(`${dist(len)}<br>${pace(len)}`));
    }
}

function loadPins() {
    try {
        const a = JSON.parse(localStorage.getItem(pinsKey));
        return Array.isArray(a) ? a : [];
    } catch {
        return [];
    }
}

function savePins() {
    try { localStorage.setItem(pinsKey, JSON.stringify(pins)); } catch { /* np. tryb prywatny: znaczniki tylko do odświeżenia */ }
}

function addPin(p) {  // p = [x, y, nazwa]
    const el = document.createElement('div');
    el.className = 'pin';
    el.append(document.createElement('b'), Object.assign(document.createElement('span'), { textContent: p[2] }));
    L.marker([p[1], p[0]], { icon: L.divIcon({ className: '', html: el, iconSize: null }), title: `${p[2]} (kliknij, aby usunąć)` })
        .on('click', e => {
            if (!confirm(`Usunąć znacznik „${p[2]}”?`)) return;
            pins.splice(pins.indexOf(p), 1);
            savePins();
            e.target.remove();
        })
        .addTo(map);
}

// Własny podkład z plików misji: roślinność, drogi gruntowe, budynki i siatka co 1 km jak w grze (podpis "07 10" = GPS 07x 10x).
// Filtr jedzenia podświetla tu budynki z łupem jedzenia i drzewa owocowe, gdy na piksel przypada najwyżej CATS.food.mpp metrów.
const Terrain = L.GridLayer.extend({
    createTile(c) {
        const tile = document.createElement('canvas');
        tile.width = tile.height = 256;
        const ctx = tile.getContext('2d');
        const span = this.options.size / 2 ** c.z;   // metry na kafelek
        const px = 256 / span;                        // piksele na metr
        const x0 = c.x * span, zTop = this.options.size - c.y * span;
        const X = x => (x - x0) * px, Y = z => (zTop - z) * px;
        const near = (x, z, pad) => x > x0 - pad && x < x0 + span + pad && z > zTop - span - pad && z < zTop + pad;
        const t = TERRAIN[this.options.key] || {};
        const img = RELIEF[this.options.key];
        const food = enabled.has('food') && 1 / px <= CATS.food.mpp;
        ctx.fillStyle = BG[this.options.key];
        ctx.fillRect(0, 0, 256, 256);
        if (img && img.complete && img.naturalWidth) {
            const k = img.naturalWidth / this.options.size;  // piksele obrazu na metr
            ctx.drawImage(img, x0 * k, (this.options.size - zTop) * k, span * k, span * k, 0, 0, 256, 256);
        }

        for (const [layer, [color, r]] of Object.entries(PLANTS)) {
            const fruit = food && layer === 'orchard', a = t[layer] || [], d = Math.max(2 * r * px, fruit ? 2 : 1);
            ctx.fillStyle = fruit ? FOOD : color;
            ctx.beginPath();
            for (let i = 0; i < a.length; i += 2) {
                if (!near(a[i], a[i + 1], r)) continue;
                if (d < 3) ctx.rect(X(a[i]) - d / 2, Y(a[i + 1]) - d / 2, d, d);
                else { ctx.moveTo(X(a[i]) + d / 2, Y(a[i + 1])); ctx.arc(X(a[i]), Y(a[i + 1]), d / 2, 0, 2 * Math.PI); }
            }
            ctx.fill();
        }

        ctx.lineCap = 'round';
        for (const [surface, [color, width, minPx]] of Object.entries(ROADS)) {
            const r = t[surface] || [];  // odcinki x1, z1, x2, z2
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(width * px, minPx);
            ctx.beginPath();
            for (let i = 0; i < r.length; i += 4) {
                if (!near(r[i], r[i + 1], 50)) continue;
                ctx.moveTo(X(r[i]), Y(r[i + 1]));
                ctx.lineTo(X(r[i + 2]), Y(r[i + 3]));
            }
            ctx.stroke();
        }

        const s = Math.max(10 * px, 1.5);  // x, z, kąt; budynek jako kwadrat ~10 m
        for (const [layer, color] of [['house', '#4b4541'], ['food', food ? FOOD : '#4b4541']]) {
            const house = t[layer] || [];
            ctx.fillStyle = color;
            for (let i = 0; i < house.length; i += 3) {
                if (!near(house[i], house[i + 1], 10)) continue;
                const a = -house[i + 2] * Math.PI / 180;
                ctx.setTransform(Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), X(house[i]), Y(house[i + 1]));
                ctx.fillRect(-s / 2, -s / 2, s, s);
            }
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,0,0,.13)';
        ctx.fillStyle = 'rgba(0,0,0,.45)';
        ctx.font = '11px ui-monospace, monospace';
        // Gra liczy Y od północnej krawędzi (Livonia od południowej), więc poziome linie leżą co 1 km od tej krawędzi.
        const north = this.options.north, size = this.options.size, off = north ? size % KM : 0;
        const row = z => north ? (size - z) / KM : z / KM - 1;  // numer kilometra pod linią z
        const two = n => String(n).padStart(2, '0');
        // Linia na prawej/dolnej krawędzi należy do sąsiedniego kafelka, więc każda rysowana jest raz.
        for (let x = Math.ceil(x0 / KM) * KM; x < x0 + span; x += KM) {
            const p = Math.round((x - x0) * px) + 0.5;
            ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 256); ctx.stroke();
        }
        for (let z = Math.floor((zTop - off) / KM) * KM + off; z > zTop - span; z -= KM) {
            const p = Math.round((zTop - z) * px) + 0.5;
            ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(256, p); ctx.stroke();
        }
        // Podpis przy krawędzi kafelka rysują oba sąsiednie kafelki (60×16 px zapasu), więc połówki się sklejają.
        if (KM * px >= 100) {
            for (let x = Math.ceil((x0 - 60 / px) / KM) * KM; x < x0 + span; x += KM)
                for (let z = Math.floor((zTop + 16 / px - off) / KM) * KM + off; z > zTop - span; z -= KM)
                    ctx.fillText(`${two(x / KM)} ${two(row(z))}`, (x - x0) * px + 4, (zTop - z) * px + 13);
        }
        return tile;
    },
});

function show(key) {
    const m = MAPS[key];
    const bounds = L.latLngBounds([0, 0], [m.size, m.size]);
    // Współrzędne jak w grze (GPS, mapa, komunikaty bunkrów): kwadraty 100 m, Y liczony od północy, na Livonii od południa.
    // Sprawdzone na serwerze funkcją gry MapNavigationBehaviour.OrderedPositionNumbersFromGridCoords.
    const north = key !== 'livonia';
    const gps = (x, y) => x < 0 || y < 0 || x > m.size || y > m.size ? ''
        : [x, north ? m.size - y : y].map(v => String(Math.floor(v / 100)).padStart(3, '0')).join(' ');
    const square = g => {  // 6 cyfr z gry -> kwadrat 100 m
        const x = +g.slice(0, 3) * 100, y = north ? m.size - 100 - g.slice(3) * 100 : g.slice(3) * 100;
        return L.latLngBounds([y, x], [y + 100, x + 100]);
    };
    if (map) map.remove();
    // [lat, lng] = [y, x] w metrach gry; zoom 0 = cała mapa w jednym kafelku 256 px.
    map = L.map('map', {
        crs: L.extend({}, L.CRS.Simple, { transformation: new L.Transformation(256 / m.size, 0, -256 / m.size, 256) }),
        maxBounds: bounds.pad(0.2), minZoom: 0, maxZoom: 7, zoomSnap: 0.5, preferCanvas: true,
    });
    map.createPane('tiers').style.zIndex = 250;  // strefy łupu: nad terenem (200), pod znacznikami (400)
    map.attributionControl.addAttribution('Dane misji © Bohemia Interactive' + (key === 'namalsk' ? ', Sumrak' : '') + ' · mapa fanowska');
    const terrain = new Terrain({ key, size: m.size, bounds, north }).addTo(map);
    // Po doczytaniu danych warstwa jest dodawana ponownie zamiast redraw(): redraw() w Leaflet 1.9
    // przy ułamkowym zoomie rysuje kafelki w złej skali (wystają poza mapę).
    const refresh = () => map.hasLayer(terrain) && terrain.remove().addTo(map);
    if (!TERRAIN[key]) document.head.append(Object.assign(document.createElement('script'), { src: `terrain-${key}.js`, onload: refresh }));
    if (m.relief) {
        const img = RELIEF[key] ||= Object.assign(new Image(), { src: `relief-${key}.webp` });
        if (!img.complete) img.addEventListener('load', refresh);
    }
    map.fitBounds(bounds);
    map.on('mousemove', e => {
        const pts = ruler.getLatLngs(), g = gps(e.latlng.lng, e.latlng.lat), len = length([...pts, e.latlng]);
        $('coords').value = `X ${Math.round(e.latlng.lng)}  Y ${Math.round(e.latlng.lat)}` + (g && `  ·  GPS ${g}`)
            + (tool === 'ruler' && pts.length ? `  ·  ${dist(len)}: ${pace(len)}` : '');
    });
    map.on('click', onMapClick);
    Object.assign(L.control({ position: 'topleft' }), { onAdd: () => tools }).addTo(map);
    measure = L.layerGroup().addTo(map);
    setTool(null);
    pinsKey = 'dayz-pins-' + key;
    pins = loadPins();
    pins.forEach(addPin);

    // Wyszukiwarka: nazwa miejsca (Enter lub wybór z listy), współrzędne z gry (6 cyfr) albo komunikat bunkrów z radia:
    // cyfry lub Morse, na każdy bunkier 6 cyfr kwadratu i 4 cyfry kodu. Wynik zostaje na mapie do następnego szukania.
    const found = L.layerGroup().addTo(map), search = $('search');
    const bunkers = m.points.filter(p => CATS[p[0]]?.filter === 'bunker');
    const fail = msg => { search.setCustomValidity(msg); search.reportValidity(); };
    $('places').replaceChildren(...[...new Set(m.names.map(n => n[3]))].sort((a, b) => a.localeCompare(b, 'pl')).map(t => new Option(t)));
    search.value = '';
    search.oninput = () => search.setCustomValidity('');
    search.onchange = () => {
        const q = search.value.trim();
        found.clearLayers();
        if (/^[\d\s.,;:/|·•_–—−-]+$/.test(q)) {
            const d = digits(q);
            if (d === null) return fail('Nie rozpoznano Morse\'a: każda cyfra to 5 kropek lub kresek.');
            if (d.length === 6) {
                const sq = square(d);
                found.addLayer(L.rectangle(sq, { color: '#c92a2a', weight: 2, fill: false, interactive: false }));
                map.setView(sq.getCenter(), Math.max(map.getZoom(), 5));
                return L.popup({ closeButton: false }).setLatLng(sq.getCenter()).setContent(`GPS ${d.slice(0, 3)} ${d.slice(3)}`).openOn(map);
            }
            if (!bunkers.length || !d.length || d.length % 10) return fail(bunkers.length
                ? 'Wpisz 6 cyfr współrzędnych z gry albo cały komunikat: po 10 cyfr na bunkier (6 współrzędnych i 4 kodu).'
                : 'Wpisz 6 cyfr współrzędnych z gry, np. 072 106.');
            const hits = [];
            for (let i = 0; i < d.length; i += 10) {
                const sq = square(d.slice(i, i + 6)), c = sq.getCenter();
                const b = bunkers.reduce((a, p) => map.distance(c, [p[2], p[1]]) < map.distance(c, [a[2], a[1]]) ? p : a);
                const at = L.latLng(b[2], b[1]);
                found.addLayer(L.tooltip({ permanent: true, direction: 'top', offset: [0, -8] }).setLatLng(at).setContent(`<b>kod ${d.slice(i + 6, i + 10)}</b><br>${CATS[b[0]].name}`
                    + (sq.contains(at) ? '' : `<br>najbliższy podanym współrzędnym (${dist(map.distance(c, at))} od nich)`)));
                hits.push(at);
            }
            return map.fitBounds(L.latLngBounds(hits), { padding: [60, 60], maxZoom: 5 });
        }
        const s = q.toLowerCase();
        const hit = s && (m.names.find(n => n[3].toLowerCase() === s) || m.names.find(n => n[3].toLowerCase().includes(s)));
        if (!hit) return;
        map.setView([hit[2], hit[1]], Math.max(map.getZoom(), 4));
        L.popup({ closeButton: false }).setLatLng([hit[2], hit[1]])
            .setContent(Object.assign(document.createElement('b'), { textContent: hit[3] })).openOn(map);
    };

    const layers = {};
    for (const [cat, x, y, radius] of m.points) {
        // Wspólny teren kilku gatunków ('goat/sheep') należy do filtra pierwszego z nich i nosi nazwy wszystkich.
        const c = CATS[cat] || { ...CATS[cat.split('/')[0]], name: cat.split('/').map(k => CATS[k].name).join(', ') };
        // Punkt z promieniem (stała strefa skażona, teren zwierząt) rysujemy jako koło w metrach, resztę jako znacznik.
        const note = radius ? `${c.zone}, promień ${radius} m` : c.note;
        (layers[c.filter || cat] ||= L.layerGroup()).addLayer((radius
            ? L.circle([y, x], { radius, color: c.stroke || c.color, weight: 1.5, fillColor: c.color, fillOpacity: c.fill ?? 0.35 })
            : L.circleMarker([y, x], { radius: c.r, color: '#000', weight: 1, fillColor: c.color, fillOpacity: 0.9 }))
            .bindTooltip(`<b>${c.name}</b>${note ? '<br>' + note : ''}<br>X ${x}  Y ${y} · GPS ${gps(x, y)}`));
    }
    layers.tier = L.imageOverlay(`tiers-${key}.webp`, bounds, { pane: 'tiers' });  // przezroczystość jest w obrazie
    layers.food = L.layerGroup();  // jedzenie rysuje warstwa terenu, pusta grupa daje tylko wiersz filtra
    for (const [type, x, y, text] of m.names) {
        const span = Object.assign(document.createElement('span'), { textContent: text });
        // Dzielnice stolicy gra oznacza jako miasta; jako "inne miejsca" nie zasłaniają stolicy na widoku całej mapy.
        const cat = text.endsWith(' District') ? 'other' : PLACE[type] || 'other';
        (layers[cat] ||= L.layerGroup()).addLayer(L.marker([y, x], {
            icon: L.divIcon({ className: `place place-${type}`, html: span, iconSize: null }), interactive: false, keyboard: false,
        }));
    }
    // Widoczność warstwy = zaznaczony filtr i (dla nazw) wystarczające przybliżenie.
    // Kolejność z CATS: późniejsze kategorie rysują się na wierzchu (gejzer stoi w gorącym źródle);
    // koła stref idą pod spód, żeby dało się najechać znaczniki leżące w strefie.
    let food = enabled.has('food');
    sync = () => {
        const mpp = m.size / 256 / 2 ** map.getZoom();
        for (const cat in CATS) {
            const l = layers[cat];
            if (!l) continue;
            if (!enabled.has(cat) || CATS[cat].mpp < mpp) l.remove();
            else if (!map.hasLayer(l)) l.addTo(map).eachLayer?.(x => x instanceof L.Circle && x.bringToBack());
        }
        if (food !== enabled.has('food')) { food = !food; refresh(); }
    };
    map.on('zoomend', sync);
    sync();

    $('filters').replaceChildren(...Object.keys(CATS).filter(cat => layers[cat]).map(cat => {
        const c = CATS[cat], label = document.createElement('label'), n = layers[cat].getLayers?.().length;
        const end = c.legend ? `<span class="legend">${c.legend.map((col, i) => `<i style="background:${col}"></i>${i < 4 ? i + 1 : 'U'}`).join('')}</span>`
            : n ? `<small>${n}</small>` : '';
        label.innerHTML = `<input type="checkbox">${c.place ? '<i class="txt">Aa</i>' : `<i style="background:${c.color}"></i>`}${c.label}${end}`;
        label.title = c.title || '';
        const box = label.firstChild;
        box.checked = enabled.has(cat);
        box.onchange = () => { box.checked ? enabled.add(cat) : enabled.delete(cat); saveFilters(); sync(); };
        return label;
    }));
    for (const a of $('maps').children) a.hash === '#' + key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
}

// Włącz/wyłącz wszystkie: dotyczy też kategorii, których nie ma na bieżącej mapie.
const setAll = on => {
    for (const cat in CATS) on ? enabled.add(cat) : enabled.delete(cat);
    for (const box of $('filters').querySelectorAll('input')) box.checked = on;
    saveFilters();
    sync();
};
$('all').onclick = () => setAll(true);
$('none').onclick = () => setAll(false);

$('maps').innerHTML = Object.entries(MAPS).map(([key, m]) => `<a href="#${key}">${m.name}</a>`).join('');
if (innerWidth < 600) $('panel').open = false;
const route = () => show(MAPS[location.hash.slice(1)] ? location.hash.slice(1) : Object.keys(MAPS)[0]);
addEventListener('hashchange', route);
route();
