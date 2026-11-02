#!/usr/bin/env python3
"""Builds data.js (markers, place names), terrain-<map>.js (base map), relief-<map>.webp (terrain shading) and
tiers-<map>.webp (loot tier zones) from public DayZ mission files plus, when present, scan/<map>.txt.gz made by mapscan.sh.
Run: python3 build_data.py"""
import gzip
import json
import pathlib
import struct
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image

MAPS = {
    'nasdara': ('Nasdara', 16384, 'https://raw.githubusercontent.com/BohemiaInteractive/DayZ-Central-Economy/master/dayzOffline.nasdara'),
    'namalsk': ('Namalsk', 12800, 'https://raw.githubusercontent.com/SumrakDZN/Namalsk-Server/master/Mission%20Files/regular.namalsk'),
    'sakhal': ('Sakhal', 15360, 'https://raw.githubusercontent.com/BohemiaInteractive/DayZ-Central-Economy/master/dayzOffline.sakhal'),
    'chernarusplus': ('Chernarus+', 15360, 'https://raw.githubusercontent.com/BohemiaInteractive/DayZ-Central-Economy/master/dayzOffline.chernarusplus'),
    'livonia': ('Livonia', 12800, 'https://raw.githubusercontent.com/BohemiaInteractive/DayZ-Central-Economy/master/dayzOffline.enoch'),
}
BUILDINGS = {  # lowercase class name from mapgrouppos.xml -> marker category (Sakhal _ghost variants duplicate _east)
    'land_hospital_takistan': 'hospital',
    'land_city_hospital': 'hospital',
    'land_city_hospital_east': 'hospital',
    'land_healthcare_takistan': 'clinic',
    'land_village_healthcare': 'clinic',
    'land_village_healthcare_east': 'clinic',
    'land_village_healthcare_enoch': 'clinic',
    'land_medical_tent_big': 'medtent',
    'land_medical_tent_shower': 'medtent',
    'land_mil_containerhabitat_medical': 'medtent',
    'land_policestation_large_takistan': 'police',  # Namalsk has no police stations
    'land_policestation_small_takistan': 'police',
    'land_city_policestation': 'police',
    'land_village_policestation': 'police',
    'land_village_policestation_east': 'police',
    'land_city_policestation_enoch': 'police',
    'land_village_policestation_enoch': 'police',
    'land_bunker_basement_storage': 'bunkerstorage',  # Nasdara: the 23 code-locked bunkers, same spots as cfgbunkerbroadcast.json
    'land_bunker_shelter_storage': 'bunkerstorage',
    'land_bunker_basement_medical': 'bunkermedical',
    'land_bunker_shelter_medical': 'bunkermedical',
    'land_bunker_basement_civilian': 'bunkercivil',
    'land_bunker_shelter_office': 'bunkeroffice',
}
ANIMALS = {  # cfgenvironment.xml territory name -> marker category; zones become circles
    'Deer': 'deer', 'RoeDeer': 'roedeer', 'Reindeer': 'reindeer', 'WildBoar': 'boar', 'Pig': 'pig', 'Cow': 'cow',
    'Sheep': 'sheep', 'Goat': 'goat', 'Mouflon': 'mouflon', 'AmbientHen': 'hen', 'AmbientHare': 'hare',
    'AmbientFox': 'fox', 'AmbientLizard': 'lizard', 'Wolf': 'wolf', 'Bear': 'bear', 'BrownBear': 'bear',
    'PolarBear': 'bear', 'Dog': 'dog',
}
TIERS = ['#dc8a3c', '#c06a1f', '#9c4f12', '#7c3c0c', '#6250d6']  # Tier 1-4, Unique; same as TIERS in script.js
TIER_PX = 1024
EVENTS = {  # cfgeventspawns.xml event -> marker category
    'StaticWaterTruck': 'watertruck',
    'StaticHeliCrash': 'crash', 'StaticHeliCrashBig': 'crash', 'StaticAirplaneCrate': 'crash',
    'StaticMilitaryConvoy': 'convoy', 'StaticBoatMilitary': 'convoy',
    'StaticContaminatedArea': 'gas',  # possible spots of dynamic toxic zones
    'StaticPoliceCar': 'policecar', 'StaticPoliceSituation': 'policecar',
    'StaticContainerLocked': 'locked',  # Nasdara: green armory, Sakhal: blue/yellow shipping containers
    'VehicleCivilianSedan': 'car', 'VehicleHatchback02': 'car', 'VehicleOffroadHatchback': 'car', 'VehicleSedan02': 'car',
    'VehicleOffroad02': 'car', 'VehicleCivilianCars': 'car', 'VehicleMilitary': 'car',  # Namalsk: mixed cars, Offroad_02
    'VehicleTruck01': 'truck', 'VehicleTrucks': 'truck',
    'VehicleMotorbike': 'moto', 'VehicleMotorbikes': 'moto',
    'VehicleBoat': 'boat', 'VehicleMilitaryBoat': 'boat', 'VehicleRubberBoats': 'boat',
}
AREAS = {'GeyserArea': 'geyser', 'HotSpringArea': 'hotspring', 'VolcanicArea': 'volcano'}  # cfgeffectarea.json type -> marker category (Sakhal)
MILITARY = {'military', 'militaryeast', 'militarywest'}  # mapgroupproto.xml usage (Namalsk uses a container tag instead)
CLUSTERS = {  # class name prefix from mapgroupcluster*.xml -> terrain layer
    'figtree': 'orchard', 'appletree': 'orchard', 'peartree': 'orchard', 'plumtree': 'orchard',
    'piceaabies': 'conifer', 'pinussylvestris': 'conifer',
    'fagussylvatica': 'leafy', 'betulapendula': 'leafy', 'quercusrobur': 'leafy', 'stoneloc': 'rock',
}
CYRILLIC = dict(zip('абвгдеёжзийклмнопрстуфхцчшщыэюя', 'a b v g d e yo zh z i y k l m n o p r s t u f kh ts ch sh shch y e yu ya'.split()), ъ='', ь='')
NOT_BUILDINGS = ('wreck', 'datsun', 'hilux', 'supplycrates')  # vehicles and off-map lab crates
WATER = {'land_waterwell_brick': 'well', 'land_misc_through_static': 'trough', 'land_a3_lab_sink': 'sink'}  # other wells: 'pump'
RELIEF = {  # height (m) -> colour stops for the relief image; heights <= 0 are sea (flat, no shading)
    'nasdara': [(90, '#efe5ca'), (300, '#e8dbb9'), (700, '#d9c6a0'), (1100, '#c9b08e'), (1450, '#bca68f')],
    'namalsk': [(-60, '#8db6d4'), (-0.1, '#bdd8ea'), (0, '#dde5d3'), (150, '#d6dccb'), (400, '#d4d7d0'), (700, '#e6e9ec'), (1100, '#f6f8fa')],
    'sakhal': [(-90, '#86afcf'), (-0.1, '#b8d4e8'), (0, '#eef2f4'), (150, '#e6eaee'), (350, '#d9dde2'), (560, '#c9ccd2')],
    'chernarusplus': [(-60, '#86afcf'), (-0.1, '#b8d4e8'), (0, '#e6ecd3'), (150, '#dde6c8'), (350, '#d6dcbf'), (550, '#d4d1bb'), (800, '#d9d4c8')],
    'livonia': [(150, '#e6ecd3'), (250, '#dde6c8'), (400, '#d6dcbf'), (520, '#d4d1bb'), (620, '#d9d4c8')],  # inland, lakes as ponds
}
POND = '#a9cbe3'
RELIEF_PX = 2048
OUT = pathlib.Path(__file__).parent


def relief(heights, ponds, size, stops):
    """Hillshade (light from NW) multiplied over a height colour ramp; rows come south -> north."""
    h, pond = np.array(heights, np.float32)[::-1] / 10, np.array(ponds)[::-1]
    cell = size / (h.shape[0] - 1)
    d_south, d_east = np.gradient(h * 2, cell)  # 2x vertical exaggeration
    light = np.array([-0.5, 0.5, 0.7071])       # east, north, up (azimuth 315, altitude 45)
    normal = np.dstack([-d_east, d_south, np.ones_like(h)])
    shade = (normal @ light) / np.linalg.norm(normal, axis=2) / light[2]  # 1 = flat ground
    shade[h <= 0] = 1
    rgb = np.dstack([np.interp(h, [s[0] for s in stops], [int(s[1][i:i + 2], 16) for s in stops]) for i in (1, 3, 5)])
    rgb *= np.clip(0.55 + 0.45 * shade, 0.4, 1.15)[..., None]
    rgb[pond] = [int(POND[i:i + 2], 16) for i in (1, 3, 5)]
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).resize((RELIEF_PX, RELIEF_PX), Image.BICUBIC)


def read_scan(key, size):
    """Water sources and fuel stations, place names, roads ({surface: [x1, z1, x2, z2, ...]}) and relief from
    mapscan.sh output, or nothing if the map was not scanned."""
    path = OUT / 'scan' / f'{key}.txt.gz'
    if not path.exists():
        return [], [], {}, None
    water, fuel, names, roads, heights, ponds = [], [], [], {}, [], []
    for line in gzip.open(path, 'rt', encoding='utf-8').read().splitlines():
        kind, _, rest = line.partition(' ')
        if kind == 'road':
            surface, *ends = rest.split()
            roads.setdefault(surface, []).extend(int(v) for v in ends)
        elif kind == 'water':
            cls, x, z = rest.split()
            cls = cls.lower()
            if cls.endswith('_water.p3d'):  # water surface of a Sakhal spring, same spot as the spring model
                continue
            water.append(['spring' if 'waterspring' in cls else WATER.get(cls, 'pump'), int(x), int(z)])
        elif kind == 'fuel':
            x, z = map(int, rest.split())
            if not any(abs(x - f[1]) < 80 and abs(z - f[2]) < 80 for f in fuel):  # pumps of one station -> one marker
                fuel.append(['fuel', x, z])
        elif kind == 'name':
            _, typ, x, z, text = (rest + ' ').split(' ', 4)
            if text.strip():  # Chernarus ViewPoint/LocalOffice/RailroadStation entries have no text
                names.append([typ.lower(), int(x), int(z), latin(text.strip())])
        elif kind == 'h':
            heights.append([int(v) for v in rest.split()])
        elif kind == 'p':
            ponds.append([c == '1' for c in rest])
    assert water and names and roads and len(heights) == len(heights[0]) == len(ponds), f'incomplete scan {path}'
    return water + fuel, names, roads, relief(heights, ponds, size, RELIEF[key])


def get(url):
    with urllib.request.urlopen(url, timeout=120) as r:
        return r.read()


def fetch(url):
    return ET.fromstring(get(url))


def loot_groups(base):
    """Building classes whose loot is military (usage flag, or a 'military' container tag on Namalsk) and classes that
    can spawn food: a container taking the food category, in a building with a usage that some spawning food item has
    or with no usage flags at all (all of Namalsk)."""
    food_usage = {u.get('name') for t in fetch(base + '/db/types.xml').iter('type')
                  if t.find('category') is not None and t.find('category').get('name') == 'food'
                  and int(t.findtext('nominal') or 0) > 0 for u in t.iter('usage')}
    military, food = set(), set()
    for g in fetch(base + '/mapgroupproto.xml').iter('group'):
        name = g.get('name').lower()
        flags = {e.get('name', '').lower() for e in g.iter() if e.tag in ('usage', 'tag')}
        if flags & MILITARY:
            military.add(name)
        usages = {u.get('name') for u in g.findall('usage')}
        if (not usages or usages & food_usage) and any(c.get('name') == 'food' for c in g.iter('category')):
            food.add(name)
    return military, food


def animals(base):
    """Animal territory zones as [category, x, z, radius]. A species counts when its event in db/events.xml is active;
    nominal is ignored (ambient hares and foxes have 0 and still spawn, bears use a custom limit). Zones that several
    species share (sheep and goats use one file on most maps) get a joined category such as 'sheep/goat'."""
    active = {e.get('name') for e in fetch(base + '/db/events.xml').iter('event') if e.findtext('active') == '1'}
    zones = {}
    for t in fetch(base + '/cfgenvironment.xml').iter('territory'):
        name = t.get('name')
        if (name if t.get('type') == 'Ambient' else 'Animal' + name) not in active:
            continue  # also skips the zombie territory, which has no event
        for f in t.iter('file'):
            for z in fetch(f'{base}/env/{f.get("usable")}.xml').iter('zone'):
                cats = zones.setdefault((round(float(z.get('x'))), round(float(z.get('z'))), round(float(z.get('r')))), [])
                if ANIMALS[name] not in cats:
                    cats.append(ANIMALS[name])
    return [['/'.join(cats), x, z, r] for (x, z, r), cats in zones.items()]


def tiers(base):
    """Loot tier zones from areaflags.map as an RGBA image (north up): highest tier per cell, Unique over tiers.
    Layout: header of 6 uint32 (cells x, cells z, world size x, z, usage bits per cell, ...), a usage flag layer (none
    on Namalsk), then value flags (bit 0-3 = Tier1-4, bit 4 = Unique) at 8 bits per cell, or 4 bits with the low
    nibble first on Livonia and Namalsk; rows run south -> north."""
    raw = get(base + '/areaflags.map')
    w, h, _, _, usage_bits = struct.unpack_from('<5I', raw)
    flags = np.frombuffer(raw, np.uint8, offset=24 + usage_bits // 8 * w * h)
    if flags.size * 2 == w * h:
        flags = np.stack([flags & 15, flags >> 4], axis=1).ravel()
    assert flags.size == w * h and h % TIER_PX == 0, 'unknown areaflags.map layout'
    flags = flags.reshape(h, w)[::-1]
    level = np.zeros(flags.shape, np.uint8)
    for bit in range(5):  # later bits win: Tier 4 over Tier 1, Unique over all
        level[(flags & (1 << bit)) > 0] = bit + 1
    k = h // TIER_PX
    level = level.reshape(TIER_PX, k, TIER_PX, k).max(axis=(1, 3))  # max keeps tiny zones (Nasdara's Tier 4: ~75x150 m)
    # Higher tiers are also more opaque: Tier 1 often covers half a map and should only tint it.
    rgba = np.array([[0, 0, 0, 0]] + [[int(c[i:i + 2], 16) for i in (1, 3, 5)] + [a] for c, a in zip(TIERS, (90, 130, 170, 210, 210))], np.uint8)
    return Image.fromarray(rgba[level], 'RGBA')


def effect_areas(base):
    """Markers from cfgeffectarea.json: static contaminated zones as ['gas', x, z, radius], geysers, hot springs and
    volcanic vents as plain points; the file name case differs per map."""
    for name in ('cfgeffectarea.json', 'cfgEffectArea.json'):
        try:
            areas = json.loads(get(f'{base}/{name}')).get('Areas', [])
        except urllib.error.HTTPError:
            continue
        points = []
        for a in areas:
            x, _, z = (round(v) for v in a['Data']['Pos'])
            if a.get('Type') == 'ContaminatedArea_Static':
                points.append(['gas', x, z, round(a['Data']['Radius'])])
            elif a.get('Type') in AREAS:
                points.append([AREAS[a['Type']], x, z])
        return points
    return []


def latin(text):
    """Sakhal place names are Cyrillic; transliterate so they are readable (Североморск -> Severomorsk)."""
    out = ''
    for c in text:
        t = CYRILLIC.get(c.lower(), c)
        out += t.capitalize() if c.isupper() else t
    return out


assert latin('Петропавловск-Сахалинский ОКБ-754, Подъезд') == 'Petropavlovsk-Sakhalinskiy OKB-754, Podezd'


def build(size, base):
    points, terrain = [], {'house': [], 'food': []}  # 'food': buildings that can spawn food, drawn as houses
    military, food = loot_groups(base)
    for g in fetch(base + '/mapgrouppos.xml').iter('group'):
        name = g.get('name').lower()
        x, _, z = map(float, g.get('pos').split())
        cat = BUILDINGS.get(name) or ('mil' if name in military else None)
        if cat:
            points.append([cat, round(x), round(z)])
        if not any(w in name for w in NOT_BUILDINGS):
            terrain['food' if name in food else 'house'] += [round(x), round(z), round(float(g.get('a')))]
    for e in fetch(base + '/cfgeventspawns.xml').iter('event'):
        cat = EVENTS.get(e.get('name'))
        for p in e.iter('pos') if cat else ():
            points.append([cat, round(float(p.get('x'))), round(float(p.get('z')))])
    points += effect_areas(base) + animals(base)
    for p in fetch(base + '/cfgplayerspawnpoints.xml').find('fresh').iter('pos'):  # centres of new character spawn areas
        points.append(['spawn', round(float(p.get('x'))), round(float(p.get('z')))])

    for suffix in ('', '01', '02', '03', '04', '05'):
        try:
            groups = fetch(f'{base}/mapgroupcluster{suffix}.xml').iter('group')
        except urllib.error.HTTPError:
            continue
        for g in groups:
            name = g.get('name').lower()
            layer = next((v for k, v in CLUSTERS.items() if name.startswith(k)), None)
            if layer:
                x, _, z = map(float, g.get('pos').split())
                terrain.setdefault(layer, []).extend([round(x), round(z)])

    assert any(p[0] in ('hospital', 'clinic') for p in points), 'no medical building found - upstream format changed?'  # Livonia has no hospital
    assert all(0 <= p[1] <= size and 0 <= p[2] <= size for p in points), 'point outside map'
    assert terrain['house'] and terrain['food'], 'no buildings found'
    return points, terrain


markers = {}
for key, (name, size, base) in MAPS.items():
    points, terrain = build(size, base)
    water, names, roads, image = read_scan(key, size)
    terrain.update(roads)
    if image:
        image.save(OUT / f'relief-{key}.webp', quality=80, method=6)
    tiers(base).save(OUT / f'tiers-{key}.webp', lossless=True)
    markers[key] = {'name': name, 'size': size, 'relief': bool(image), 'points': points + water, 'names': names}
    (OUT / f'terrain-{key}.js').write_text(f'// Generated by build_data.py - do not edit.\nTERRAIN.{key} = ' + json.dumps(terrain, separators=(',', ':')) + ';\n')
    print(key, len(points) + len(water), 'markers,', len(names), 'names,', {k: len(v) for k, v in terrain.items()}, 'terrain values')
(OUT / 'data.js').write_text('// Generated by build_data.py - do not edit.\nconst MAPS = ' + json.dumps(markers, separators=(',', ':')) + ';\n')
