# ORBIT

A 3D satellite and space debris viewer built with CesiumJS and satellite.js.

[Live demo](https://anyspoc.github.io/orbit-explorer/)

Includes 32,422 Space-Track objects supplied on October 24, 2026. Opens paused at **2026-10-24 02:17:21 UTC**. Catalog filters use bundled data; no orbital-data API is called. Positions are SGP4 estimates, not live observations or a complete inventory.

## Run locally

```sh
python -m http.server 8080 --directory dist
```

Open http://localhost:8080. Internet access is required for rendering libraries and map imagery.

## License

Original code: [MIT](LICENSE).

- CesiumJS 1.146: [Apache-2.0 and third-party notices](dist/licenses/CesiumJS-LICENSE.txt).
- satellite.js 6.0.1: [MIT](dist/licenses/satellite-js-LICENSE.txt).
- Natural Earth: [Public domain](https://www.naturalearthdata.com/about/terms-of-use/).
- Orbital data: USSPACECOM via Space-Track.org; [citation and redistribution notice](dist/licenses/SPACE-TRACK-DATA.txt). Separate from the code license.

[Credits](dist/credits.html)
