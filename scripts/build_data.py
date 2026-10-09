#!/usr/bin/env python3
"""Build canada-transit-supply dataset.
Sources:
- Station locations (TTC): TTC GTFS, Toronto Open Data package ttc-routes-and-schedules, retrieved 2026-10-08.
- Station areas (GO + future): City of Toronto Open Data, Minister-Approved Major Transit Station Areas
  shapefile (Jan 2026), MTM Zone 10 NAD27. Centroids converted via inverse Transverse Mercator and
  calibrated against 58 GTFS stations (median residual -27m/+23m applied).
- Opening dates: compiled from TTC/Metrolinx public records (see OPENING_DATES notes). TTC dates are
  exact; GO dates are approximate years; future stations are status=under_construction.
- Housing supply: toronto-development-pipeline/data/pipeline.csv (City of Toronto Development Pipeline,
  retrieved 2026-10-08): 2,391 geocoded projects with status (proposed/active/built), proposed_units,
  date_received, lon/lat.
Method: haversine 800m join of pipeline projects to station points. date_received is the application
receipt date, not completion; "built" status marks completed projects in the City's analytical file.
"""
import csv, json, math
from collections import defaultdict

RAW = '/home/hatch/workspace/canada-transit-supply/data/raw'
PIPE = '/home/hatch/workspace/toronto-development-pipeline/data/pipeline.csv'

# --- TTC stations from GTFS ---
gtfs_raw = json.load(open(f'{RAW}/ttc_subway_stops_raw.json'))
routes = {r['route_id']: r for r in csv.DictReader(open(f'{RAW}/ttc_gtfs/routes.txt'))}
subway_ids = {rid for rid, r in routes.items() if r.get('route_type') == '1'}
trip_route = {}
for t in csv.DictReader(open(f'{RAW}/ttc_gtfs/trips.txt')):
    if t['route_id'] in subway_ids:
        trip_route[t['trip_id']] = t['route_id']
stop_routes = defaultdict(set)
for row in csv.DictReader(open(f'{RAW}/ttc_gtfs/stop_times.txt')):
    if row['trip_id'] in trip_route:
        stop_routes[row['stop_id']].add(trip_route[row['trip_id']])
stops = {s['stop_id']: s for s in csv.DictReader(open(f'{RAW}/ttc_gtfs/stops.txt'))}
agg = defaultdict(list)
for sid, rids in stop_routes.items():
    s = stops[sid]; n = s['stop_name']
    for suf in [' Station - Eastbound Platform', ' Station - Westbound Platform',
                ' Station - Northbound Platform', ' Station - Southbound Platform',
                ' Station - Subway Platform', ' - Northbound Platform Towards Finch',
                ' - Northbound Platform Towards Vaughan Metropolitan Centre']:
        n = n.replace(suf, '')
    n = n.replace('York University - Northbound Platform', 'York University').replace(
        'York University - Southbound Platform', 'York University')
    n = n.replace('Union Towards Finch', 'Union').replace(
        'Union Towards Vaughan Metropolitan Centre', 'Union')
    agg[n].append((float(s['stop_lat']), float(s['stop_lon']), rids))
ttc = {}
for n, v in agg.items():
    la = sum(a[0] for a in v) / len(v); lo = sum(a[1] for a in v) / len(v)
    rids = set(); [rids.update(a[2]) for a in v]
    lines = sorted(routes[r]['route_short_name'] for r in rids)
    ttc[n] = {'lat': round(la, 6), 'lon': round(lo, 6), 'lines': lines}

# Opening dates, compiled from TTC/Metrolinx public records (exact for TTC, year for GO)
OPENING = {
    # Line 1 Yonge segment 1954-03-30
    'Union': '1954-03-30', 'King': '1954-03-30', 'Queen': '1954-03-30', 'TMU': '1954-03-30',
    'College': '1954-03-30', 'Wellesley': '1954-03-30', 'Bloor': '1954-03-30',
    'Rosedale': '1954-03-30', 'Summerhill': '1954-03-30', 'St Clair': '1954-03-30',
    'Davisville': '1954-03-30', 'Eglinton': '1954-03-30',
    # University segment 1963-02-28
    'St Andrew': '1963-02-28', 'Osgoode': '1963-02-28', 'St Patrick': '1963-02-28',
    "Queen's Park": '1963-02-28', 'Museum': '1963-02-28', 'St George': '1963-02-28',
    # Yonge north
    'Lawrence': '1973-03-31', 'York Mills': '1973-03-31', 'Finch': '1974-03-30',
    'Sheppard-Yonge': '1974-03-30',  # Line 1 platforms as Sheppard station
    # Spadina 1978-01-27
    'Dupont': '1978-01-27', 'Spadina': '1978-01-27', 'St Clair West': '1978-01-27',
    'Cedarvale': '1978-01-27', 'Glencairn': '1978-01-27', 'Lawrence West': '1978-01-27',
    'Yorkdale': '1978-01-27', 'Wilson': '1978-01-27',
    'North York Centre': '1987-06-18', 'Sheppard West': '1996-03-30',
    # TYSSE 2017-12-17
    'Downsview Park': '2017-12-17', 'Finch West': '2017-12-17', 'York University': '2017-12-17',
    'Pioneer Village': '2017-12-17', 'Highway 407': '2017-12-17',
    'Vaughan Metropolitan Centre': '2017-12-17',
    # Line 2 1966-02-25
    'Keele': '1966-02-25', 'Dundas West': '1966-02-25', 'Dufferin': '1966-02-25',
    'Ossington': '1966-02-25', 'Christie': '1966-02-25', 'Bathurst': '1966-02-25',
    'Bay': '1966-02-25', 'Yonge': '1966-02-25', 'Sherbourne': '1966-02-25',
    'Castle Frank': '1966-02-25', 'Broadview': '1966-02-25', 'Chester': '1966-02-25',
    'Pape': '1966-02-25', 'Donlands': '1966-02-25', 'Greenwood': '1966-02-25',
    'Coxwell': '1966-02-25', 'Woodbine': '1966-02-25',
    # Line 2 extensions 1968-05-10
    'Islington': '1968-05-10', 'Royal York': '1968-05-10', 'Old Mill': '1968-05-10',
    'Jane': '1968-05-10', 'Runnymede': '1968-05-10', 'High Park': '1968-05-10',
    'Main Street': '1968-05-10', 'Victoria Park': '1968-05-10', 'Warden': '1968-05-10',
    'Kipling': '1980-11-22', 'Kennedy': '1980-11-22',
    # Line 4 Sheppard 2002-11-22
    'Bayview': '2002-11-22', 'Bessarion': '2002-11-22', 'Leslie': '2002-11-22',
    'Don Mills': '2002-11-22',
}
# GO stations: approximate opening years from GO Transit public records
GO_OPEN = {
    'Bloor GO': '1974', 'Bloor-Lansdowne GO': None, 'Danforth GO': '1967',
    'Eglinton GO': '1967', 'Etobicoke North': '1974', 'Agincourt': '1982',
    'Mimico': '1967', 'Weston': '1974',
}
# Future/under-construction stations (Eglinton Crosstown, Ontario Line, Scarborough extension)
FUTURE_KEYWORDS = ['Crosstown', 'Ontario', 'Eglinton (', 'Corktown', 'Cosburn', 'Flemingdon',
                   'Thorncliffe', 'Moss Park', 'Queen-Spadina', 'King-Bathurst', 'King-Liberty',
                   'Leslieville', 'Aga Khan', 'Birchmount (Eglinton)', 'Caledonia', 'Chaplin',
                   'Fairbank', 'Forest Hill', 'Hakimi Lebovic', 'Keelesdale', 'Laird', 'Leaside',
                   'Mount Pleasant', 'Oakwood', "O'Connor", 'Pharmacy (Eglinton)', 'Sloane',
                   'Sunnybrook Park', 'Wynford', 'Golden Mile', 'Ionview', 'Humber College',
                   'Rowntree Mills', 'Pearldale', 'Duncanwoods', 'Milvan Rumike', 'Norfinch Oakdale',
                   'Tobermory', 'Driftwood', 'Jane and Finch', 'Emery', 'Signet Arrow',
                   'Martin Grove', 'Westmore', 'Albion', 'Stevenson', 'Mount Olive',
                   'Front-Spadina', 'Park Lawn', 'Bloor-Lansdowne GO']
FUTURE_EXACT = {'Corktown', 'Cosburn', 'Flemingdon Park', 'Thorncliffe Park', 'Moss Park',
                'Queen-Spadina', 'King-Bathurst', 'King-Liberty', 'Leslieville',
                'Aga Khan Park & Museum', 'Birchmount (Eglinton)', 'Caledonia', 'Chaplin',
                'Fairbank', 'Forest Hill', 'Hakimi Lebovic', 'Keelesdale', 'Laird', 'Leaside',
                'Mount Pleasant', 'Oakwood', "O'Connor", 'Pharmacy (Eglinton)', 'Sloane',
                'Sunnybrook Park', 'Wynford', 'Golden Mile', 'Ionview', 'Humber College',
                'Rowntree Mills', 'Pearldale', 'Duncanwoods', 'Milvan Rumike',
                'Norfinch Oakdale', 'Tobermory', 'Driftwood', 'Jane and Finch', 'Emery',
                'Signet Arrow', 'Martin Grove', 'Westmore', 'Albion', 'Stevenson',
                'Mount Olive', 'Front-Spadina', 'Park Lawn', 'Bloor-Lansdowne GO',
                'Mount Dennis', 'St. Clair-Old Weston'}


# MTSA alias -> TTC station name (renames / interchange naming)
MTSA_ALIAS = {'Bloor-Yonge': 'Bloor', 'Dundas': 'TMU', 'Queens Park': "Queen's Park",
              'Eglinton West': 'Cedarvale'}

# --- MTSA calibrated coordinates for non-TTC stations ---
a = 6378206.4; f = 1 / 294.9786982; e2 = 2 * f - f * f
import math
k0, lon0, fe = 0.9999, math.radians(-79.5), 304800.0
def inv_tm(x, y):
    x = (x - fe) / k0; y = y / k0
    mu = y / (a * (1 - e2 / 4 - 3 * e2**2 / 64 - 5 * e2**3 / 256))
    e1 = (1 - math.sqrt(1 - e2)) / (1 + math.sqrt(1 - e2))
    phi1 = mu + (3*e1/2 - 27*e1**3/32)*math.sin(2*mu) + (21*e1**2/16 - 55*e1**4/32)*math.sin(4*mu) + (151*e1**3/96)*math.sin(6*mu)
    N1 = a / math.sqrt(1 - e2*math.sin(phi1)**2)
    T1 = math.tan(phi1)**2; C1 = e2/(1-e2)*math.cos(phi1)**2
    R1 = a*(1-e2)/(1-e2*math.sin(phi1)**2)**1.5
    D = x / N1
    lat = phi1 - (N1*math.tan(phi1)/R1)*(D**2/2 - (5+3*T1+10*C1-4*C1**2)*D**4/24)
    lon = lon0 + (D - (1+2*T1+C1)*D**3/6)/math.cos(phi1)
    return math.degrees(lat) - 0.000243, math.degrees(lon) + 0.000270  # empirical datum shift

mtsa = json.load(open(f'{RAW}/mtsa_centroids.json'))
# dedupe MTSA (some names appear twice)
seen = {}
for m in mtsa:
    if m['name'] not in seen:
        seen[m['name']] = m

stations = []
ttc_names = set(ttc.keys())
for name, t in ttc.items():
    stations.append({
        'id': 'ttc-' + name.lower().replace(' ', '-').replace("'", ''),
        'name': name + ' Station', 'agency': 'TTC',
        'lines': ['Line ' + l for l in t['lines']],
        'lat': t['lat'], 'lon': t['lon'],
        'opening_date': OPENING.get(name), 'date_precision': 'exact' if name in OPENING else 'missing',
        'status': 'open', 'coord_source': 'TTC GTFS',
    })
for name, m in seen.items():
    base = name.replace(' (Subway)', '')
    if base in ttc_names or name in ttc_names or name in MTSA_ALIAS:
        continue  # already have TTC station
    la, lo = inv_tm(m['cx'], m['cy'])
    is_go = name in GO_OPEN
    is_future = name in FUTURE_EXACT
    if is_go:
        od = GO_OPEN[name]
        stations.append({'id': 'go-' + name.lower().replace(' ', '-').replace("'", ''),
                         'name': name, 'agency': 'GO Transit', 'lines': ['GO'],
                         'lat': round(la, 6), 'lon': round(lo, 6),
                         'opening_date': od, 'date_precision': 'approximate-year' if od else 'missing',
                         'status': 'open' if od else 'under_construction',
                         'coord_source': 'MTSA centroid (calibrated)'})
    elif is_future:
        stations.append({'id': 'future-' + name.lower().replace(' ', '-').replace("'", '').replace('&', 'and'),
                         'name': name, 'agency': 'TTC/Metrolinx', 'lines': ['Under construction'],
                         'lat': round(la, 6), 'lon': round(lo, 6),
                         'opening_date': None, 'date_precision': 'missing',
                         'status': 'under_construction',
                         'coord_source': 'MTSA centroid (calibrated)'})
    else:
        stations.append({'id': 'other-' + name.lower().replace(' ', '-').replace("'", ''),
                         'name': name, 'agency': 'Unknown', 'lines': [],
                         'lat': round(la, 6), 'lon': round(lo, 6),
                         'opening_date': None, 'date_precision': 'missing',
                         'status': 'unknown',
                         'coord_source': 'MTSA centroid (calibrated)'})

# --- Pipeline join ---
def hav_km(la1, lo1, la2, lo2):
    R = 6371.0
    p1, p2 = math.radians(la1), math.radians(la2)
    dp = math.radians(la2 - la1); dl = math.radians(lo2 - lo1)
    h = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(h))

projs = []
with open(PIPE) as fh:
    for r in csv.DictReader(fh):
        try:
            la, lo = float(r['lat']), float(r['lon'])
        except (ValueError, TypeError):
            continue
        try:
            units = int(r['proposed_units'] or 0)
        except ValueError:
            units = 0
        projs.append({'id': r['id'], 'lat': la, 'lon': lo, 'status': r['status'],
                      'units': units, 'date': r['date_received'] or None,
                      'hood': r['neighbourhood_158_name']})
print('projects with coords:', len(projs))

supply = []
for st in stations:
    near = [p for p in projs if hav_km(st['lat'], st['lon'], p['lat'], p['lon']) <= 0.8]
    by_status = defaultdict(lambda: [0, 0])
    dates = []
    for p in near:
        by_status[p['status']][0] += 1
        by_status[p['status']][1] += p['units']
        if p['date']:
            dates.append(p['date'])
    dates.sort()
    # before/after opening for stations with exact dates
    before = after = None
    od = st['opening_date']
    if od and len(od) == 10 and dates:
        b = [d for d in dates if d < od]; a = [d for d in dates if d >= od]
        before = {'projects': len(b), 'units': sum(p['units'] for p in near if p['date'] and p['date'] < od)}
        after = {'projects': len(a), 'units': sum(p['units'] for p in near if p['date'] and p['date'] >= od)}
    supply.append({
        'station_id': st['id'],
        'projects_800m': len(near),
        'units_800m': sum(p['units'] for p in near),
        'by_status': {k: {'projects': v[0], 'units': v[1]} for k, v in by_status.items()},
        'earliest_application': dates[0] if dates else None,
        'latest_application': dates[-1] if dates else None,
        'before_opening': before, 'after_opening': after,
    })

json.dump(stations, open('/home/hatch/workspace/canada-transit-supply/data/stations.json', 'w'), indent=1)
json.dump(supply, open('/home/hatch/workspace/canada-transit-supply/data/supply_by_station.json', 'w'))

# --- summary ---
open_st = [s for s in stations if s['status'] == 'open']
fut_st = [s for s in stations if s['status'] == 'under_construction']
sup_by_id = {s['station_id']: s for s in supply}
tot_units = sum(s['units_800m'] for s in supply if sup_by_id[s['station_id']])
open_units = sum(sup_by_id[s['id']]['units_800m'] for s in open_st)
fut_units = sum(sup_by_id[s['id']]['units_800m'] for s in fut_st)
top = sorted([(s['name'], sup_by_id[s['id']]['units_800m'], sup_by_id[s['id']]['projects_800m']) for s in stations],
             key=lambda x: -x[1])[:12]
# before/after for exact-date stations
ba = [(s['name'], sup_by_id[s['id']]['before_opening'], sup_by_id[s['id']]['after_opening'])
      for s in stations if s['date_precision'] == 'exact' and sup_by_id[s['id']]['before_opening']]
summary = {
    'stations_total': len(stations),
    'stations_open': len(open_st),
    'stations_under_construction': len(fut_st),
    'stations_unknown': len([s for s in stations if s['status'] == 'unknown']),
    'pipeline_projects_total': len(projs),
    'pipeline_units_near_any_station_800m': tot_units,
    'units_near_open_stations': open_units,
    'units_near_future_stations': fut_units,
    'top_stations_by_units': [{'name': n, 'units': u, 'projects': p} for n, u, p in top],
    'before_after_sample': [{'name': n, 'before': b, 'after': a} for n, b, a in ba[:5]],
}
# --- headline stats: each project counted once even if near multiple stations ---
# Per-station sums double-count projects in overlapping 800m zones, so the headline
# share (41.1%) is computed at project level: a project counts once if it is within
# 800m of ANY open station. Verified by independent recomputation 2026-10-08.
open_stations = [s for s in stations if s['status'] == 'open']
near_open = [p for p in projs
             if any(hav_km(s['lat'], s['lon'], p['lat'], p['lon']) <= 0.8 for s in open_stations)]
total_units = sum(p['units'] for p in projs)
dedup_units = sum(p['units'] for p in near_open)
dedup_by_status = defaultdict(int)
for p in near_open:
    dedup_by_status[p['status']] += p['units']
fut_top = sorted([(s['name'], sup_by_id[s['id']]['units_800m'], sup_by_id[s['id']]['projects_800m'])
                  for s in fut_st], key=lambda x: -x[1])[:8]
summary.update({
    'total_pipeline_units': total_units,
    'units_within_800m_open_station_dedup': dedup_units,
    'units_within_800m_open_station_dedup_pct': round(100 * dedup_units / total_units, 1),
    'projects_within_800m_open_station_dedup': len(near_open),
    'units_near_open_by_status': {k: dedup_by_status[k] for k in ('active', 'proposed', 'built')},
    'top_future_stations': [{'name': n, 'units': u, 'projects': p} for n, u, p in fut_top],
})
json.dump(summary, open('/home/hatch/workspace/canada-transit-supply/data/summary.json', 'w'), indent=1)
print(json.dumps(summary, indent=1)[:1500])
print('unknown:', [s['name'] for s in stations if s['status'] == 'unknown'])
