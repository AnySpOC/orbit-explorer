# ORBIT

A 3D satellite and space debris viewer built with CesiumJS and satellite.js.

[Live demo](https://anyspoc.github.io/orbit-explorer/)

Click **データ取得** (Fetch data) to load a catalog, or import an OMM JSON file. Positions are estimates from orbital elements, not live observations.

## Run locally

```sh
python -m http.server 8080 --directory dist
```

Open http://localhost:8080. An internet connection and a WebGL-capable browser are required.

## License

Original code: [MIT](LICENSE).

- CesiumJS 1.146: [Apache-2.0 and third-party notices](dist/licenses/CesiumJS-LICENSE.txt).
- satellite.js 6.0.1: [MIT](dist/licenses/satellite-js-LICENSE.txt).
- Natural Earth map data: [Public domain](https://www.naturalearthdata.com/about/terms-of-use/).
- Orbital data is not bundled and is subject to its provider's terms, including the [CelesTrak usage policy](https://celestrak.org/usage-policy.php).

[Credits](dist/credits.html) · [Publication review](docs/PUBLICATION-REVIEW.md)
