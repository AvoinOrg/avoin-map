#!/usr/bin/env node

import { createRequire } from "node:module";
import { gunzipSync } from "node:zlib";

const require = createRequire(import.meta.url);

const DEFAULT_TILE = { z: 8, x: 145, y: 181 };

function usage() {
  return `Probe a GeoServer/GWC vector layer.

Usage:
  node agents/skills/geoserver-data-probe/scripts/probe-geoserver-layer.mjs \\
    --geoserver-url https://sandbox.gis.avoin.org/geoserver \\
    --layer sandbox_energiakartta:energymap_building_polygons \\
    --z 8 --x 145 --y 181 \\
    --property energy_certificate_class

Options:
  --geoserver-url URL       GeoServer base URL, ending in /geoserver
  --workspace NAME         Workspace for an unqualified --layer value
  --layer NAME             Layer name, either workspace:layer or layer
  --tilejson-url URL       Explicit TileJSON URL to probe
  --tile-url URL           Explicit tile URL or template with {z}/{x}/{y}
  --style NAME             WMTS REST TileJSON style to try. Repeatable. Defaults to polygon, default
  --z N --x N --y N        Tile coordinate. Defaults to ${DEFAULT_TILE.z}/${DEFAULT_TILE.x}/${DEFAULT_TILE.y}
  --property NAME          Property to check. Repeatable or comma-separated
  --source-layer NAME      Expected vector tile source-layer name
  --sample-limit N         Number of sample features/values to print per layer. Default 5
  --timeout-ms N           HTTP timeout per request. Default 20000
  --skip-tilejson          Skip TileJSON probing
  --skip-wfs               Skip WFS DescribeFeatureType probing
  --skip-tile              Skip PBF tile probing
  --no-flip-retry          Do not retry the tile request with flipped Y
  --json                   Print raw JSON result
  --help                   Show this help
`;
}

function parseArgs(argv) {
  const options = {
    properties: [],
    styles: [],
    sampleLimit: 5,
    timeoutMs: 20000,
    tile: { ...DEFAULT_TILE },
    json: false,
    skipTilejson: false,
    skipWfs: false,
    skipTile: false,
    flipRetry: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${raw}`);
    }

    const [flag, inlineValue] = raw.includes("=") ? raw.split(/=(.*)/s, 2) : [raw, undefined];
    const readValue = () => {
      if (inlineValue !== undefined) return inlineValue;
      i += 1;
      if (i >= argv.length) throw new Error(`Missing value for ${flag}`);
      return argv[i];
    };

    switch (flag) {
      case "--help":
        options.help = true;
        break;
      case "--json":
        options.json = true;
        break;
      case "--skip-tilejson":
        options.skipTilejson = true;
        break;
      case "--skip-wfs":
        options.skipWfs = true;
        break;
      case "--skip-tile":
        options.skipTile = true;
        break;
      case "--no-flip-retry":
        options.flipRetry = false;
        break;
      case "--geoserver-url":
        options.geoserverUrl = trimTrailingSlash(readValue());
        break;
      case "--workspace":
        options.workspace = readValue();
        break;
      case "--layer":
        options.layer = readValue();
        break;
      case "--tilejson-url":
        options.tilejsonUrl = readValue();
        break;
      case "--tile-url":
        options.tileUrl = readValue();
        break;
      case "--style":
        options.styles.push(readValue());
        break;
      case "--z":
      case "--x":
      case "--y": {
        const coordinate = Number.parseInt(readValue(), 10);
        if (!Number.isFinite(coordinate)) throw new Error(`Invalid coordinate for ${flag}`);
        options.tile[flag.slice(2)] = coordinate;
        break;
      }
      case "--property":
        options.properties.push(...splitCsv(readValue()));
        break;
      case "--source-layer":
        options.sourceLayer = readValue();
        break;
      case "--sample-limit": {
        const sampleLimit = Number.parseInt(readValue(), 10);
        if (!Number.isFinite(sampleLimit) || sampleLimit < 0) {
          throw new Error("--sample-limit must be a non-negative integer");
        }
        options.sampleLimit = sampleLimit;
        break;
      }
      case "--timeout-ms": {
        const timeoutMs = Number.parseInt(readValue(), 10);
        if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
          throw new Error("--timeout-ms must be a positive integer");
        }
        options.timeoutMs = timeoutMs;
        break;
      }
      default:
        throw new Error(`Unknown option: ${flag}`);
    }
  }

  if (!options.help && !options.layer && !options.tilejsonUrl && !options.tileUrl) {
    throw new Error("Provide --layer, --tilejson-url, or --tile-url");
  }

  if (!options.help && options.layer && !options.layer.includes(":") && !options.workspace) {
    throw new Error("Provide --workspace when --layer is not qualified as workspace:layer");
  }

  options.properties = [...new Set(options.properties.filter(Boolean))];
  options.styles = options.styles.length > 0 ? [...new Set(options.styles)] : ["polygon", "default"];
  options.qualifiedLayer = qualifyLayer(options.layer, options.workspace);

  return options;
}

function splitCsv(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/g, "");
}

function qualifyLayer(layer, workspace) {
  if (!layer) return undefined;
  return layer.includes(":") ? layer : `${workspace}:${layer}`;
}

function replaceTileTokens(url, tile) {
  return url
    .replaceAll("{z}", String(tile.z))
    .replaceAll("{x}", String(tile.x))
    .replaceAll("{y}", String(tile.y));
}

function buildTilejsonCandidates(options) {
  if (options.tilejsonUrl) return [options.tilejsonUrl];
  if (!options.geoserverUrl || !options.qualifiedLayer) return [];

  return options.styles.map(
    (style) =>
      `${options.geoserverUrl}/gwc/service/wmts/rest/${options.qualifiedLayer}/${style}/tilejson/pbf?format=application/json`,
  );
}

function buildWfsDescribeUrl(options) {
  if (!options.geoserverUrl || !options.qualifiedLayer) return undefined;
  const params = new URLSearchParams({
    service: "WFS",
    version: "1.1.0",
    request: "DescribeFeatureType",
    typeName: options.qualifiedLayer,
  });
  return `${options.geoserverUrl}/ows?${params.toString()}`;
}

function buildTileUrl(options, tilejson, tile = options.tile) {
  if (options.tileUrl) return replaceTileTokens(options.tileUrl, tile);

  const firstTileJsonTemplate = tilejson?.json?.tiles?.find((tileUrl) => typeof tileUrl === "string");
  if (firstTileJsonTemplate) return replaceTileTokens(firstTileJsonTemplate, tile);

  if (!options.geoserverUrl || !options.qualifiedLayer) return undefined;
  return `${options.geoserverUrl}/gwc/service/tms/1.0.0/${options.qualifiedLayer}@EPSG:900913@pbf/${tile.z}/${tile.x}/${tile.y}.pbf`;
}

async function fetchBytes(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: "*/*",
        "user-agent": "avoin-map-geoserver-data-probe/1.0",
      },
    });
    const body = Buffer.from(await response.arrayBuffer());
    return {
      url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type") ?? "",
      contentEncoding: response.headers.get("content-encoding") ?? "",
      bytes: body.length,
      body,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function probeTilejson(options) {
  const attempts = [];

  for (const url of buildTilejsonCandidates(options)) {
    const attempt = await fetchBytes(url, options.timeoutMs);
    const text = attempt.body.toString("utf8");
    const parsed = safeJsonParse(text);
    attempts.push({
      url,
      ok: attempt.ok,
      status: attempt.status,
      statusText: attempt.statusText,
      contentType: attempt.contentType,
      bytes: attempt.bytes,
      json: parsed,
      errorPreview: attempt.ok ? undefined : text.slice(0, 400),
    });

    if (attempt.ok && parsed) return { selected: attempts.at(-1), attempts };
  }

  return { selected: undefined, attempts };
}

async function probeWfs(options) {
  const url = buildWfsDescribeUrl(options);
  if (!url) return undefined;

  const response = await fetchBytes(url, options.timeoutMs);
  const text = response.body.toString("utf8");

  return {
    url,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    contentType: response.contentType,
    bytes: response.bytes,
    fields: parseDescribeFeatureType(text),
    errorPreview: response.ok ? undefined : text.slice(0, 400),
  };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function parseDescribeFeatureType(text) {
  const fields = [];
  const seen = new Set();
  const elementRegex = /<(?:\w+:)?element\b[^>]*\bname=["']([^"']+)["'][^>]*(?:\btype=["']([^"']+)["'])?[^>]*>/gi;
  let match;

  while ((match = elementRegex.exec(text)) !== null) {
    const name = decodeXml(match[1]);
    const type = decodeXml(match[2] ?? "");
    if (seen.has(name)) continue;
    seen.add(name);
    fields.push({ name, type });
  }

  return fields;
}

function decodeXml(value) {
  return value
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

async function decodeVectorTile(buffer, options) {
  const { VectorTile } = await loadVectorTile();
  const Pbf = await loadPbf();
  const tileBuffer = maybeGunzip(buffer);
  const tile = new VectorTile(new Pbf(tileBuffer));
  const layers = [];

  for (const [name, layer] of Object.entries(tile.layers)) {
    const propertyNames = new Set();
    const propertyTypes = new Map();
    const requested = new Map(options.properties.map((property) => [property, propertyStats()]));
    const samples = [];

    for (let i = 0; i < layer.length; i += 1) {
      const feature = layer.feature(i);
      const properties = feature.properties ?? {};

      if (samples.length < options.sampleLimit) {
        samples.push(properties);
      }

      for (const [key, value] of Object.entries(properties)) {
        propertyNames.add(key);
        addType(propertyTypes, key, value);
      }

      for (const property of options.properties) {
        const stats = requested.get(property);
        if (Object.hasOwn(properties, property)) {
          stats.present += 1;
          if (stats.sampleValues.length < options.sampleLimit) {
            const value = properties[property];
            if (!stats.sampleValues.some((sample) => Object.is(sample, value))) {
              stats.sampleValues.push(value);
            }
          }
        } else {
          stats.missing += 1;
        }
      }
    }

    layers.push({
      name,
      featureCount: layer.length,
      propertyNames: [...propertyNames].sort(),
      propertyTypes: Object.fromEntries([...propertyTypes.entries()].sort(([a], [b]) => a.localeCompare(b))),
      requestedProperties: Object.fromEntries(requested),
      samples,
    });
  }

  return layers;
}

async function loadVectorTile() {
  try {
    return require("@mapbox/vector-tile");
  } catch (error) {
    try {
      return await import("@mapbox/vector-tile");
    } catch {
      throw new Error(
        `Cannot load @mapbox/vector-tile. Run npm install first, or probe only TileJSON/WFS. Original error: ${error.message}`,
      );
    }
  }
}

async function loadPbf() {
  try {
    const pbf = require("pbf");
    return pbf.default ?? pbf;
  } catch (error) {
    try {
      const pbf = await import("pbf");
      return pbf.default ?? pbf.Pbf ?? pbf;
    } catch {
      throw new Error(`Cannot load pbf. Run npm install first, or probe only TileJSON/WFS. Original error: ${error.message}`);
    }
  }
}

function maybeGunzip(buffer) {
  if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
    return gunzipSync(buffer);
  }
  return buffer;
}

function propertyStats() {
  return {
    present: 0,
    missing: 0,
    sampleValues: [],
  };
}

function addType(map, key, value) {
  const type = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  const current = map.get(key);
  map.set(key, current ? `${current}|${type}` : type);
}

async function probeTile(options, tilejson) {
  const url = buildTileUrl(options, tilejson);
  if (!url) return undefined;

  const attempts = [];
  const response = await fetchBytes(url, options.timeoutMs);
  attempts.push(summarizeTileAttempt(response, options.tile));

  let selectedResponse = response;
  let selectedTile = options.tile;
  const flippedTile = flipY(options.tile);

  if (!response.ok && options.flipRetry && flippedTile.y !== options.tile.y) {
    const flippedUrl = buildTileUrl(options, tilejson, flippedTile);
    if (flippedUrl && flippedUrl !== url) {
      const flippedResponse = await fetchBytes(flippedUrl, options.timeoutMs);
      attempts.push(summarizeTileAttempt(flippedResponse, flippedTile));
      if (flippedResponse.ok) {
        selectedResponse = flippedResponse;
        selectedTile = flippedTile;
      }
    }
  }

  const result = {
    url: selectedResponse.url,
    requestedTile: selectedTile,
    ok: selectedResponse.ok,
    status: selectedResponse.status,
    statusText: selectedResponse.statusText,
    contentType: selectedResponse.contentType,
    contentEncoding: selectedResponse.contentEncoding,
    bytes: selectedResponse.bytes,
    attempts,
  };

  if (!selectedResponse.ok) {
    result.errorPreview = selectedResponse.body.toString("utf8").slice(0, 400);
    return result;
  }

  try {
    result.vectorLayers = await decodeVectorTile(selectedResponse.body, options);
  } catch (error) {
    result.decodeError = error.message;
  }

  return result;
}

function summarizeTileAttempt(response, tile) {
  return {
    url: response.url,
    tile,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    contentType: response.contentType,
    bytes: response.bytes,
    errorPreview: response.ok ? undefined : response.body.toString("utf8").slice(0, 180).replace(/\s+/g, " ").trim(),
  };
}

function flipY(tile) {
  return {
    ...tile,
    y: 2 ** tile.z - tile.y - 1,
  };
}

function summarizeTilejson(tilejson) {
  if (!tilejson?.json) return undefined;
  const vectorLayers = Array.isArray(tilejson.json.vector_layers) ? tilejson.json.vector_layers : [];
  return {
    url: tilejson.url,
    ok: tilejson.ok,
    status: tilejson.status,
    contentType: tilejson.contentType,
    tiles: Array.isArray(tilejson.json.tiles) ? tilejson.json.tiles : [],
    vectorLayers: vectorLayers.map((layer) => ({
      id: layer.id,
      description: layer.description,
      fields: layer.fields ?? {},
    })),
  };
}

function collectWarnings(options, result) {
  const warnings = [];

  if (options.sourceLayer && result.tile?.vectorLayers) {
    const sourceLayerNames = result.tile.vectorLayers.map((layer) => layer.name);
    if (!sourceLayerNames.includes(options.sourceLayer)) {
      warnings.push(`Expected source-layer "${options.sourceLayer}" was not found in decoded PBF layers: ${sourceLayerNames.join(", ") || "(none)"}`);
    }
  }

  for (const property of options.properties) {
    const inTilejson = result.tilejson?.vectorLayers?.some((layer) => Object.hasOwn(layer.fields ?? {}, property));
    const pbfStats = result.tile?.vectorLayers?.map((layer) => layer.requestedProperties?.[property]).filter(Boolean) ?? [];
    const inPbf = pbfStats.some((stats) => stats.present > 0);

    if (!inTilejson) warnings.push(`Property "${property}" was not advertised in TileJSON vector_layers fields.`);
    if (result.tile?.ok && !inPbf) warnings.push(`Property "${property}" was not present in decoded sample PBF features.`);
  }

  return warnings;
}

function printHuman(result) {
  console.log(`GeoServer Data Probe`);
  console.log(`Layer: ${result.input.qualifiedLayer ?? "(not provided)"}`);
  console.log(`Tile: z${result.input.tile.z}/${result.input.tile.x}/${result.input.tile.y}`);
  console.log("");

  if (result.tilejsonAttempts?.length) {
    console.log("TileJSON:");
    for (const attempt of result.tilejsonAttempts) {
      console.log(`- ${attempt.status} ${attempt.url}`);
    }
    if (result.tilejson?.vectorLayers?.length) {
      for (const layer of result.tilejson.vectorLayers) {
        const fields = Object.keys(layer.fields ?? {}).sort();
        console.log(`  layer ${layer.id}: ${fields.length} fields`);
        if (fields.length) console.log(`    ${fields.join(", ")}`);
      }
    }
    console.log("");
  }

  if (result.wfs) {
    console.log("WFS DescribeFeatureType:");
    console.log(`- ${result.wfs.status} ${result.wfs.url}`);
    if (result.wfs.fields?.length) {
      console.log(`  ${result.wfs.fields.length} fields`);
      console.log(`  ${result.wfs.fields.map((field) => `${field.name}${field.type ? ` (${field.type})` : ""}`).join(", ")}`);
    }
    console.log("");
  }

  if (result.tile) {
    console.log("PBF Tile:");
    if (result.tile.attempts?.length > 1) {
      for (const attempt of result.tile.attempts) {
        console.log(`- attempt ${attempt.status} z${attempt.tile.z}/${attempt.tile.x}/${attempt.tile.y} ${attempt.url}`);
      }
    }
    console.log(`- ${result.tile.status} ${result.tile.url}`);
    if (result.tile.requestedTile) {
      console.log(`  selected tile: z${result.tile.requestedTile.z}/${result.tile.requestedTile.x}/${result.tile.requestedTile.y}`);
    }
    console.log(`  content-type: ${result.tile.contentType || "(unknown)"}, bytes: ${result.tile.bytes}`);
    if (result.tile.decodeError) console.log(`  decode error: ${result.tile.decodeError}`);
    if (result.tile.errorPreview) console.log(`  error preview: ${result.tile.errorPreview.replace(/\s+/g, " ").trim()}`);
    for (const layer of result.tile.vectorLayers ?? []) {
      console.log(`  layer ${layer.name}: ${layer.featureCount} features`);
      console.log(`    properties: ${layer.propertyNames.join(", ") || "(none)"}`);
      for (const [property, stats] of Object.entries(layer.requestedProperties ?? {})) {
        console.log(
          `    ${property}: present ${stats.present}, missing ${stats.missing}, samples ${JSON.stringify(stats.sampleValues)}`,
        );
      }
    }
    console.log("");
  }

  if (result.warnings.length) {
    console.log("Warnings:");
    for (const warning of result.warnings) console.log(`- ${warning}`);
  } else {
    console.log("Warnings: none");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const tilejsonProbe = options.skipTilejson ? undefined : await probeTilejson(options);
  const selectedTilejson = tilejsonProbe?.selected;
  const result = {
    input: {
      geoserverUrl: options.geoserverUrl,
      workspace: options.workspace,
      layer: options.layer,
      qualifiedLayer: options.qualifiedLayer,
      sourceLayer: options.sourceLayer,
      properties: options.properties,
      tile: options.tile,
    },
    tilejsonAttempts: tilejsonProbe?.attempts,
    tilejson: summarizeTilejson(selectedTilejson),
    wfs: options.skipWfs ? undefined : await probeWfs(options),
    tile: options.skipTile ? undefined : await probeTile(options, selectedTilejson),
  };

  result.warnings = collectWarnings(options, result);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result);
  }
}

main().catch((error) => {
  console.error(`geoserver-data-probe: ${error.message}`);
  process.exit(1);
});
