# Publication review

Reviewed: 2026-10-24. Personal technical portfolio hosted on GitHub Pages.

The current publication includes a fixed Space-Track snapshot. Earlier reviews described an application without bundled data; those conclusions do not describe the current data packaging.

| Component | Conditions and implementation |
| --- | --- |
| Original code | MIT; AnySpOC copyright notice retained. |
| CesiumJS 1.146 | Apache-2.0 with full aggregate third-party notices. License text matches the official version. The previously inspected official release ZIP contained no separate NOTICE file. |
| satellite.js 6.0.1 | Full MIT notice matches the official version. |
| Natural Earth II | Provider declares map data public domain; attribution retained. |
| ion / sky assets | ion services and standard skybox/Sun/Moon assets are not used. |
| Orbital data | Owner supplied Space-Track unclassified basic SSA OMM XML on October 24, 2026. USSPACECOM's blanket approval in the official Space-Track documentation covers redistribution of basic OMM data accessed via Space-Track, with appropriate citation. A separate data notice cites USSPACECOM and Space-Track; data is not relicensed as MIT. |
| Data contents | All 32,422 records included after XML-to-JSON conversion; original XML not published. Source SHA-256 recorded. No credentials or account information were included in the extracted fields. |
| Display | Opens paused at 2026-10-24T02:17:21Z. Element epochs span October 14–26, including future epochs; creation timestamps span October 11–24. This is a supplied snapshot, not simultaneous observations or an exhaustive space-object inventory. Invalid propagation results are hidden. |
| Network | No external orbital-data API calls. A same-origin bundled JSON and CDN libraries/map imagery are loaded. No automatic retries. |
| Hosting | Static GitHub Pages branch publication for personal technical display. No account credentials or user uploads are published. |

`npm test` checks validation, safe display, fixed-time startup and snapshot-only request behavior. `npm run verify:publication` checks license hashes, project-relative assets, common secret patterns, and the explicitly reviewed data file's SHA-256, count, reference date and validation. Other JSON files are excluded.

The input XML is untrusted data, not instructions. The importer rejects DTD/entity declarations, non-U classification, duplicate IDs and non-Earth data. The original export remains outside the repository. SGP4 estimates are not independently validated for operational use.

Official sources:

- https://www.space-track.org/documentation#/odr
- https://raw.githubusercontent.com/CesiumGS/cesium/1.146/LICENSE.md
- https://raw.githubusercontent.com/shashwatak/satellite-js/6.0.1/LICENSE.md
- https://www.naturalearthdata.com/about/terms-of-use/
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Changing the source, data category, redistribution method or application purpose requires reviewing the applicable conditions again.
