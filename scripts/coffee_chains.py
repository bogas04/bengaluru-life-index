"""Named coffee/tea chains for the bespoke high-end coffee-store layer.
This allowlist is a user preference category, not a price or quality assessment.
"""
import re
import unicodedata

BRANDS = ['Starbucks', 'Third Wave Coffee', 'Blue Tokai', 'Café Coffee Day', 'Chaayos']
CLASSIFICATION_VERSION = 'coffee-chains-v1'

def normalize(value):
    text = unicodedata.normalize('NFKD', value or '')
    text = ''.join(c for c in text if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', text.lower()).strip()

def coffee_chain(tags, name=''):
    # Do not count bus stops/landmarks named after a nearby coffee shop.
    if tags.get('amenity') not in ('cafe', 'restaurant', 'fast_food'):
        return None
    names = [normalize(tags.get(k, '')) for k in ('brand', 'operator', 'name', 'name:en')]
    names.append(normalize(name))
    for text in names:
        if re.search(r'\bstarbucks\b', text): return BRANDS[0]
        if re.search(r'\bthird wave(?: coffee)?\b', text): return BRANDS[1]
        if re.search(r'\bblue tokai\b', text): return BRANDS[2]
        if re.search(r'\bcafe coffee day\b', text) or text == 'ccd': return BRANDS[3]
        if re.search(r'\bchaayos\b', text): return BRANDS[4]
    return None
