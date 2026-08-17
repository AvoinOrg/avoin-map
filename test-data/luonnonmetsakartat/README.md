# Luonnonmetsakartat Upload Fixtures

These ZIP files are small WGS84 polygon shapefile fixtures for the
Luonnonmetsakartat mock browser smoke.

## Files

- `valid-layer.zip`: valid import fixture with two unique feature IDs.
- `duplicate-id-layer.zip`: valid shapefile structure with duplicate `id`
  values, intended to trigger client-side duplicate-ID validation.
- `create-fixtures.js`: deterministic generator for refreshing the committed
  ZIP files.

Each ZIP contains `.shp`, `.shx`, `.dbf`, `.prj`, and `.cpg` entries. The
geometry CRS is WGS84 (`EPSG:4326`). Coordinates are tiny deterministic polygons
near Uusimaa and are only meant for parsing/import validation.

## Columns

The DBF columns intentionally match the current import auto-detection
candidates:

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | text | Unique feature identifier for the default `id` indexing strategy. |
| `nimi` | text | Forest-area name. |
| `kunta` | text | Municipality. |
| `maakunta` | text | Region. |
| `kuvaus` | text | Description. |
| `pinta_ala` | number | Area value. The name is intentional because current area-column detection accepts partial matches for `ala`, `area`, and `pinta`. |

## Rows

`valid-layer.zip`:

| id | nimi | kunta | maakunta | kuvaus | pinta_ala |
| --- | --- | --- | --- | --- | --- |
| `lm-valid-1` | `Smoke Ridge Forest` | `Espoo` | `Uusimaa` | `Valid smoke fixture area 1` | `1.25` |
| `lm-valid-2` | `Smoke Lakeside Grove` | `Lohja` | `Uusimaa` | `Valid smoke fixture area 2` | `2.50` |

Expected behavior: the import UI should parse the ZIP, auto-detect all listed
columns, allow a layer name to be entered, POST to
`/api/luonnonmetsakartat/layer`, and redirect to the created layer route.

`duplicate-id-layer.zip`:

| id | nimi | kunta | maakunta | kuvaus | pinta_ala |
| --- | --- | --- | --- | --- | --- |
| `lm-duplicate-1` | `Duplicate Ridge Forest` | `Espoo` | `Uusimaa` | `Duplicate smoke fixture area 1` | `1.75` |
| `lm-duplicate-1` | `Duplicate Lakeside Grove` | `Lohja` | `Uusimaa` | `Duplicate smoke fixture area 2` | `2.25` |

Expected behavior: with the default `id` indexing strategy, the import UI should
reject the upload before create, stay on the import route, and report duplicate
IDs. A successful create POST is not expected for this fixture.
