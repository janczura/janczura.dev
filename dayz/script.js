// Kategorie w kolejności wyświetlania filtrów. Punkty i nazwy pochodzą z data.js (build_data.py).
// Kategorie z `mpp` (nazwy miejsc, obiekty wojskowe) pokazują się, gdy na piksel mapy przypada mniej niż `mpp` metrów.
const CATS = {
    city:       { label: 'Miasta',                      place: true, mpp: 40 },
    village:    { label: 'Wioski',                      place: true, mpp: 12 },
    other:      { label: 'Inne miejsca',                place: true, mpp: 6 },
    spawn:      { label: 'Spawny graczy',               name: 'Spawn gracza',           r: 6, color: '#94d82d', note: 'nowa postać pojawia się w pobliżu tego punktu' },
    hospital:   { label: 'Szpitale',                    name: 'Szpital',                r: 9, color: '#ff4d4d' },
    clinic:     { label: 'Przychodnie',                 name: 'Przychodnia',            r: 6, color: '#ff9f43' },
    medtent:    { label: 'Namioty i kontenery medyczne', name: 'Punkt medyczny',        r: 5, color: '#f78fb3' },
    police:     { label: 'Posterunki policji',          name: 'Posterunek policji',     r: 7, color: '#f8f9fa', note: 'łup policyjny' },
    mil:        { label: 'Obiekty wojskowe',            name: 'Obiekt wojskowy',        r: 4, color: '#5c7a29', mpp: 12, note: 'łup wojskowy' },
    crash:      { label: 'Katastrofy lotnicze',         name: 'Katastrofa helikoptera / samolotu', r: 6, color: '#212529', note: 'event, losowo w części tych miejsc' },
    convoy:     { label: 'Konwoje i łodzie wojskowe',   name: 'Konwój / łódź wojskowa', r: 6, color: '#a61e4d', note: 'event, losowo w części tych miejsc' },
    gas:        { label: 'Strefy skażone',              name: 'Strefa skażona',         r: 5, color: '#fab005', note: 'możliwe miejsce strefy dynamicznej (event)' },
    well:       { label: 'Studnie ceglane',             name: 'Studnia ceglana',        r: 7, color: '#1c3faa', note: 'działa po odbudowie dachu, pije się wiadrem' },
    trough:     { label: 'Koryta z wodą',               name: 'Koryto z wodą',          r: 6, color: '#12b886' },
    pump:       { label: 'Pompy wody',                  name: 'Pompa wody',             r: 6, color: '#7048e8' },
    sink:       { label: 'Umywalki',                    name: 'Umywalka (kran)',        r: 5, color: '#a5d8ff' },
    spring:     { label: 'Źródła wody',                 name: 'Źródło wody',            r: 6, color: '#1098ad' },
    watertruck: { label: 'Cysterny z wodą',             name: 'Cysterna z wodą', r: 6, color: '#74c0fc', note: 'event, nie wszystkie stoją naraz' },
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
const enabled = new Set(Object.keys(CATS));
const $ = id => document.getElementById(id);
let map;

// Własny podkład z plików misji: roślinność, drogi gruntowe, budynki i siatka co 1 km z podpisami "x · y" (km).
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
        ctx.fillStyle = BG[this.options.key];
        ctx.fillRect(0, 0, 256, 256);
        if (img && img.complete && img.naturalWidth) {
            const k = img.naturalWidth / this.options.size;  // piksele obrazu na metr
            ctx.drawImage(img, x0 * k, (this.options.size - zTop) * k, span * k, span * k, 0, 0, 256, 256);
        }

        for (const [layer, [color, r]] of Object.entries(PLANTS)) {
            const a = t[layer] || [], d = Math.max(2 * r * px, 1);
            ctx.fillStyle = color;
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

        const house = t.house || [], s = Math.max(10 * px, 1.5);  // x, z, kąt; budynek jako kwadrat ~10 m
        ctx.fillStyle = '#4b4541';
        for (let i = 0; i < house.length; i += 3) {
            if (!near(house[i], house[i + 1], 10)) continue;
            const a = -house[i + 2] * Math.PI / 180;
            ctx.setTransform(Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), X(house[i]), Y(house[i + 1]));
            ctx.fillRect(-s / 2, -s / 2, s, s);
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,0,0,.13)';
        ctx.fillStyle = 'rgba(0,0,0,.45)';
        ctx.font = '11px ui-monospace, monospace';
        // Linia na prawej/dolnej krawędzi należy do sąsiedniego kafelka, więc każda rysowana jest raz.
        for (let x = Math.ceil(x0 / KM) * KM; x < x0 + span; x += KM) {
            const p = Math.round((x - x0) * px) + 0.5;
            ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 256); ctx.stroke();
        }
        for (let z = Math.floor(zTop / KM) * KM; z > zTop - span; z -= KM) {
            const p = Math.round((zTop - z) * px) + 0.5;
            ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(256, p); ctx.stroke();
        }
        // Podpis przy krawędzi kafelka rysują oba sąsiednie kafelki (60×16 px zapasu), więc połówki się sklejają.
        if (KM * px >= 100) {
            for (let x = Math.ceil((x0 - 60 / px) / KM) * KM; x < x0 + span; x += KM)
                for (let z = Math.floor((zTop + 16 / px) / KM) * KM; z > zTop - span; z -= KM)
                    ctx.fillText(`${x / KM} · ${z / KM - 1}`, (x - x0) * px + 4, (zTop - z) * px + 13);
        }
        return tile;
    },
});

function show(key) {
    const m = MAPS[key];
    const bounds = L.latLngBounds([0, 0], [m.size, m.size]);
    if (map) map.remove();
    // [lat, lng] = [y, x] w metrach gry; zoom 0 = cała mapa w jednym kafelku 256 px.
    map = L.map('map', {
        crs: L.extend({}, L.CRS.Simple, { transformation: new L.Transformation(256 / m.size, 0, -256 / m.size, 256) }),
        maxBounds: bounds.pad(0.2), minZoom: 0, maxZoom: 7, zoomSnap: 0.5, preferCanvas: true,
    });
    map.attributionControl.addAttribution('Dane misji © Bohemia Interactive' + (key === 'namalsk' ? ', Sumrak' : '') + ' · mapa fanowska');
    const terrain = new Terrain({ key, size: m.size, bounds }).addTo(map);
    // Po doczytaniu danych warstwa jest dodawana ponownie zamiast redraw(): redraw() w Leaflet 1.9
    // przy ułamkowym zoomie rysuje kafelki w złej skali (wystają poza mapę).
    const refresh = () => map.hasLayer(terrain) && terrain.remove().addTo(map);
    if (!TERRAIN[key]) document.head.append(Object.assign(document.createElement('script'), { src: `terrain-${key}.js`, onload: refresh }));
    if (m.relief) {
        const img = RELIEF[key] ||= Object.assign(new Image(), { src: `relief-${key}.webp` });
        if (!img.complete) img.addEventListener('load', refresh);
    }
    map.fitBounds(bounds);
    map.on('mousemove', e => $('coords').value = `X ${Math.round(e.latlng.lng)}  Y ${Math.round(e.latlng.lat)}`);

    const layers = {};
    for (const [cat, x, y, radius] of m.points) {
        const c = CATS[cat];
        // Punkt z promieniem (stała strefa skażona) rysujemy jako koło w metrach, resztę jako znacznik.
        const note = radius ? `stała, promień ${radius} m` : c.note;
        (layers[cat] ||= L.layerGroup()).addLayer((radius
            ? L.circle([y, x], { radius, color: '#e67700', weight: 1.5, fillColor: c.color, fillOpacity: 0.35 })
            : L.circleMarker([y, x], { radius: c.r, color: '#000', weight: 1, fillColor: c.color, fillOpacity: 0.9 }))
            .bindTooltip(`<b>${c.name}</b>${note ? '<br>' + note : ''}<br>X ${x}  Y ${y}`));
    }
    for (const [type, x, y, text] of m.names) {
        const span = Object.assign(document.createElement('span'), { textContent: text });
        // Dzielnice stolicy gra oznacza jako miasta; jako "inne miejsca" nie zasłaniają stolicy na widoku całej mapy.
        const cat = text.endsWith(' District') ? 'other' : PLACE[type] || 'other';
        (layers[cat] ||= L.layerGroup()).addLayer(L.marker([y, x], {
            icon: L.divIcon({ className: `place place-${type}`, html: span, iconSize: null }), interactive: false, keyboard: false,
        }));
    }
    // Widoczność warstwy = zaznaczony filtr i (dla nazw) wystarczające przybliżenie.
    // Kolejność z CATS: późniejsze kategorie rysują się na wierzchu (gejzer stoi w gorącym źródle).
    const sync = () => {
        const mpp = m.size / 256 / 2 ** map.getZoom();
        for (const cat in CATS) if (layers[cat]) enabled.has(cat) && !(CATS[cat].mpp < mpp) ? layers[cat].addTo(map) : layers[cat].remove();
    };
    map.on('zoomend', sync);
    sync();

    $('filters').replaceChildren(...Object.keys(CATS).filter(cat => layers[cat]).map(cat => {
        const c = CATS[cat], label = document.createElement('label');
        label.innerHTML = `<input type="checkbox">${c.place ? '<i class="txt">Aa</i>' : `<i style="background:${c.color}"></i>`}${c.label}<small>${layers[cat].getLayers().length}</small>`;
        const box = label.firstChild;
        box.checked = enabled.has(cat);
        box.onchange = () => { box.checked ? enabled.add(cat) : enabled.delete(cat); sync(); };
        return label;
    }));
    $('note').hidden = m.names.length > 0;
    for (const a of $('maps').children) a.hash === '#' + key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
}

$('maps').innerHTML = Object.entries(MAPS).map(([key, m]) => `<a href="#${key}">${m.name}</a>`).join('');
if (innerWidth < 600) $('panel').open = false;
const route = () => show(MAPS[location.hash.slice(1)] ? location.hash.slice(1) : Object.keys(MAPS)[0]);
addEventListener('hashchange', route);
route();
