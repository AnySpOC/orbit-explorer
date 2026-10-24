# Data and software rights

Reviewed: 2026-10-24.

- Original application code and documentation: MIT, AnySpOC.
- CesiumJS 1.146: Apache-2.0 and included third-party notices, retained in full.
- satellite.js 6.0.1: MIT notice retained in full.
- Natural Earth II: public-domain map data; attribution retained.
- Cesium ion services, standard skybox/Sun/Moon imagery: not used.
- Bundled orbital data: unclassified basic SSA OMMs from USSPACECOM via Space-Track.org, supplied by the owner on 2026-10-24. Space-Track's official documentation permits redistribution with appropriate citation. See `dist/licenses/SPACE-TRACK-DATA.txt`. The application MIT license does not relicense the data.
- No CelesTrak or Space-Track API access is performed by the published application. Data filters use one bundled snapshot.
- Library and map CDN requests still occur; this is not a fully offline application.

Reference: https://www.space-track.org/documentation#/odr
