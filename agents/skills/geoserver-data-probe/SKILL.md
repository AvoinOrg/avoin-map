---
name: geoserver-data-probe
description: Probe Avoin Map GeoServer, GWC, WMTS, TMS, WFS, TileJSON, and vector tile data. Use when a task needs to verify live layer names, source-layer names, tile URLs, fields, vector PBF properties, HTTP tile errors, or which data column a layerConf should use.
---

# GeoServer Data Probe

Use this skill before changing Avoin Map layer source URLs, source-layer names, filters, paint expressions, or property names that depend on GeoServer data. It is meant for any GeoServer layer, not only Energiakartta.

## Workflow

1. Identify the GeoServer base URL and qualified layer name from code, environment, docs, or the feature spec.
   - Example base URL: `https://sandbox.gis.avoin.org/geoserver`
   - Example qualified layer: `sandbox_energiakartta:energymap_building_polygons`
2. Probe the live metadata and one representative tile:
   ```bash
   node agents/skills/geoserver-data-probe/scripts/probe-geoserver-layer.mjs \
     --geoserver-url https://sandbox.gis.avoin.org/geoserver \
     --layer sandbox_energiakartta:energymap_building_polygons \
     --z 8 --x 145 --y 181 \
     --property energy_certificate_class \
     --property energy_certificate_e_class
   ```
3. Prefer TileJSON `vector_layers[].fields` for published vector-tile field names, then decode a sample PBF tile to verify real feature properties and sample values.
4. Use WFS `DescribeFeatureType` as supporting evidence. WFS may expose fields that are not yet published in cached vector tiles, so do not treat WFS alone as proof that a PBF layerConf can use a property.
5. If a field is missing from TileJSON and decoded PBF samples, report the publication gap clearly. Do not silently keep an old property or invent a fallback without evidence.

## Common Checks

- Tile URL returns `400` or `404`: verify the qualified layer, gridset, format, tile coordinates, and whether TileJSON advertises a different template.
- Tile row/column range errors: the helper retries the same coordinate with a
  flipped Y value by default, which helps distinguish XYZ/TMS coordinate issues
  from broken layer publication.
- MapLibre `source-layer` mismatch: compare the layerConf source-layer against decoded PBF layer names.
- Filter or paint expression does nothing: verify that the property exists in decoded PBF samples and inspect its actual value shape, including nulls, numbers, strings, and code values.
- Documentation says a new column exists: probe live GeoServer before changing code. For recently updated data, the DB/WFS may lead cached PBF publication by some time.

## Output Expectations

When using this skill in an agent task, include the important probe findings in the plan, implementation notes, or review notes:

- GeoServer base URL and qualified layer tested.
- TileJSON URL/status and advertised vector layer fields.
- Sample PBF tile URL/status, decoded source-layer names, feature counts, and relevant property values.
- Whether the requested property is live in vector tiles.
