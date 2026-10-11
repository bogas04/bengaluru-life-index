#!/usr/bin/env python3
"""Fetch the GBA ward export and normalize its latitude/longitude axis order."""

import json
from pathlib import Path
from urllib.request import urlopen

SOURCE_URL = (
    "https://pub-0429b8e3b5a946e69ea007df844a6f1c.r2.dev/"
    "admin/wards-bengaluru-gba/wards_bengaluru_gba.geojson"
)
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "wards-bengaluru-gba.geojson"


def positions(value):
    if isinstance(value, list) and value and isinstance(value[0], (int, float)):
        yield value
    elif isinstance(value, list):
        for child in value:
            yield from positions(child)


def visit_geometry(geometry):
    if geometry is None:
        return
    if geometry["type"] == "GeometryCollection":
        for child in geometry.get("geometries", []):
            visit_geometry(child)
        return
    coords = geometry.get("coordinates")
    points = list(positions(coords))
    # This export stores Bengaluru positions as [latitude, longitude]. GeoJSON
    # requires [longitude, latitude], so swap the first two ordinates.
    if points and all(8 <= p[0] <= 16 and 70 <= p[1] <= 85 for p in points):
        for point in points:
            point[0], point[1] = point[1], point[0]


def main():
    with urlopen(SOURCE_URL, timeout=30) as response:
        data = json.load(response)
    if len(data.get("features", [])) != 369:
        raise ValueError("Expected the 369-ward GBA boundary edition.")
    for feature in data["features"]:
        visit_geometry(feature.get("geometry"))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    print(f"Wrote {len(data['features'])} wards to {OUTPUT}")


if __name__ == "__main__":
    main()
