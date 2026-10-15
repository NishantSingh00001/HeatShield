# HeatShield — Thane neighborhood heat-risk and cooling planner

## Why this is next

HeatShield is the next unbuilt idea in the project sequence after Touchline AI. It focuses on urban heat exposure and planning cooling interventions in Thane, Maharashtra. Its core job is to compare neighborhood cooling options, not factory scheduling, groundwater forecasting, or football analysis.

## Product goal

Help residents, planners, and student researchers explore where heat exposure may be higher and compare transparent, hypothetical interventions such as street shade, tree canopy, reflective roofs, and cooling centers. The prototype will distinguish observed data, modeled estimates, and scenario assumptions at every step. It will not present a map as an official public-health warning or a precise block-level air-temperature measurement.

## Planned pages

1. **City Overview** — large, readable headline metrics, a Thane overview map, date/source status, and the current scenario summary.
2. **Neighborhood Explorer** — filterable areas, heat/vegetation/built-up layers, source notes, and a detail drawer for each area.
3. **Cooling Studio** — add/remove interventions, adjust a small scenario budget, and compare estimated shade coverage, surface-heat proxy, people reached, and uncertainty.
4. **Evidence & Method** — source register, data dates/resolution, calculation notes, limitations, and evaluation results.

Every control should have a useful local behavior; the prototype will work without a paid API or account. Use large typography and a visual direction approved by Nishant before building the interface.

## Free-first technical direction

- Static multi-page web app hosted on Vercel; no build service required.
- MapLibre GL JS or Leaflet with an openly licensed basemap, plus openly licensed geospatial layers where usage terms permit.
- Local JavaScript for the first scenario engine and transparent baseline comparisons; do not claim agentic AI or ML until a model is implemented and evaluated.
- Optional later analysis notebooks can use open-source Python geospatial libraries and public satellite/weather archives. Keep any paid model feature optional and locked; no paid calls in the free prototype.

## Candidate data sources and limits

- **USGS Landsat Collection 2 surface temperature:** no-cost scene data for deriving a land-surface-temperature proxy. It is not near-real-time air temperature; cloud cover, acquisition date, and retrieval uncertainty must be shown. [USGS data overview](https://www.usgs.gov/landsat-missions/landsat-collection-2-surface-temperature)
- **Copernicus ERA5-Land:** open historical meteorological context. Its approximately 9 km grid is too coarse to stand in for street-level conditions in Thane. [ERA5-Land dataset](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land)
- **India Meteorological Department:** heat-wave guidance, status maps, and bulletins for official regional context; availability and update cadence should be checked when connecting the source. [IMD heat-wave guidance](https://mausam.imd.gov.in/responsive/heatwave_guidance.php)
- **OpenStreetMap:** potential base map and points of interest, subject to attribution and the ODbL. Do not treat map features as verified cooling-center inventory.

No values or neighborhood rankings have been imported yet. Before public deployment, establish a reproducible Thane boundary, check source licenses and dates, and validate any derived neighborhood layer against available observations. If suitable ground observations are unavailable, label the map as exploratory and evaluate sensitivity to assumptions rather than claiming local accuracy.

## Evaluation plan

- Compare a transparent vegetation/built-up baseline with any learned risk ranking.
- Hold out dates or locations when observations allow; report error and uncertainty, not just a heat score.
- Test whether intervention rankings remain stable when weights, missing-data handling, and intervention assumptions change.
- Report estimated benefits as scenario outputs, never measured results.
