# HeatShield — Thane Field Atlas

A free-first, multi-page web prototype for Thane, Maharashtra. Its city overview uses live Open-Meteo weather-model values and a real Esri World Imagery basemap, with a custom animated heat visualization. The weather field represents broad-grid ambient conditions, not satellite-measured surface temperature or street-level readings. Neighborhood scenario scores and cooling-plan outcomes remain illustrative.

## Pages

- `index.html` — animated 3D city study, live weather metrics, 24-hour forecast, hotspot tools, and satellite map.
- `neighborhoods.html` — searchable sample-area explorer.
- `cooling-studio.html` — intervention toggles, budget slider, local scenario saves, and JSON export.
- `evidence.html` — connected data sources, methods, and limits.

## Run locally

Open `index.html` in a browser (requires internet for map tiles, weather data, fonts, and Leaflet), or serve the folder with Python:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy on Vercel

1. Put the contents of this folder at the root of a GitHub repository.
2. Import the repository in Vercel.
3. Select **Other** as the framework preset.
4. Leave the build command blank and use `.` as the output directory.
5. Deploy. No API key, paid service, build step, or backend is required.

## Prototype behavior

- The dark and light themes use the same field-atlas design and remember your choice on this device.
- The 3D city can be dragged to orbit and zoomed; selecting a weather point pans and zooms to its heat field. Satellite imagery and individual readings are available as alternate views.
- The overview includes a 24-hour apparent-temperature forecast, configurable local feels-like alerts, live hotspot ranking, CSV export, and saved favorite places. Favorites and alert settings stay in this browser.
- Sample-area shapes can be selected by click or keyboard. Area search, scenario controls, saved scenarios, and JSON export work locally.
- Saved scenarios remain in browser storage and are not sent to a server.
- The scenario formula is a toy model. Its relative index changes are not degrees Celsius, measured impact, population counts, or cost estimates.
- The city overview connects the live weather API and satellite imagery. No neighborhood-level heat layer is validated; the named area shapes and scenario indices remain synthetic examples.

## Data plan and caveats

Potential no-cost sources include USGS Landsat Collection 2 surface-temperature products, Copernicus ERA5-Land, IMD heat-wave bulletins, and OpenStreetMap features. Review each source's license, date, spatial resolution, quality flags, and attribution requirements before use. Satellite surface temperature differs from air temperature; ERA5-Land's roughly 9 km grid is coarse for street-level analysis. Do not use this demo for emergency, medical, engineering, or public-health decisions.

## Live data and use

- Weather: [Open-Meteo Forecast API](https://open-meteo.com/en/docs), CC BY 4.0 attribution required. Free endpoint is for non-commercial use and rate limited; see provider terms before commercial deployment.
- Satellite tiles: Esri World Imagery, with attribution displayed in-map. Review current Esri terms before commercial use.
- Heat halos visualize weather-model apparent-temperature readings. They are artistic, regional-scale overlays—not satellite thermal measurements.
