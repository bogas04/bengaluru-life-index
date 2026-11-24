"""Reclassify coffee chains in the existing snapshot, preserving enrichments.
Usage: python3 scripts/prepare_coffee_chains.py
No new observations are downloaded; original OSM snapshot dates remain intact.
"""
import collections
import json
from pathlib import Path
from coffee_chains import BRANDS, CLASSIFICATION_VERSION, coffee_chain

path = Path(__file__).resolve().parents[1] / 'data/amenities.json'
data = json.loads(path.read_text())
counts = collections.defaultdict(collections.Counter)
brands = collections.Counter()
for point in data['points']:
    chain = coffee_chain(point.get('tags', {}), point.get('name', ''))
    if chain:
        point['category'] = 'coffee_chain'
        point['coffeeChain'] = chain
        brands[chain] += 1
    elif point['category'] in ('starbucks', 'coffee_chain'):
        point['category'] = point.get('tags', {}).get('amenity', 'cafe')
        point.pop('coffeeChain', None)
    if point.get('ward') and point['category'] in ('cafe', 'coffee_chain'):
        counts[point['ward']][point['category']] += 1
for ward in data['wards']:
    for category in ('starbucks', 'coffee_chain', 'cafe'):
        ward['counts'].pop(category, None)
    ward['counts'].update(counts[ward['id']])
data['coffeeChainMetadata'] = {
    'version': CLASSIFICATION_VERSION,
    'brands': BRANDS,
    'countsByBrand': dict(brands),
    'method': 'Named brand/operator/name allowlist for café, restaurant or fast-food objects. Exclusive category; excluded from generic café counts.',
    'limitations': 'User-defined chain preference, not verified price/quality. OSM coverage and point/area duplicates affect counts. No new data download.'
}
path.write_text(json.dumps(data, separators=(',', ':')))
print('Mapped coffee/tea chain objects:', sum(brands.values()), dict(brands))
