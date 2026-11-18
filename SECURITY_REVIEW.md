# Security Review — HeatShield

HeatShield is a static, multi-page client-side city-heat prototype
(`index.html`, `neighborhoods.html`, `cooling-studio.html`, `evidence.html` +
shared `app.js`/`city3d.js`). The only network calls are to two public,
no-key APIs: Open-Meteo (`app.js:116`, fixed lat/lon query params built from
a hardcoded `weatherPoints` list — no user text in the request) and Esri's
World Imagery map tiles (via Leaflet). Saved scenarios and favorites are
stored only in browser `localStorage`, never sent to a server, consistent
with the README.

## 20-point pen-test checklist

| # | Check | Applicable? | Notes |
|---|-------|-------------|-------|
| 1 | HTTP/2 Rapid Reset (CVE-2023-44487) | N/A | No server component in this repo. |
| 2 | bcrypt 72-byte truncation | N/A | No password hashing. |
| 3 | SAML signature bypass (CVE-2024-45409) | N/A | No SAML/SSO. |
| 4 | nOAuth | N/A | No OAuth/auth of any kind. |
| 5 | GraphQL alias batching | N/A | No GraphQL. |
| 6 | TOTP replay (RFC 6238 §5.2) | N/A | No TOTP/2FA. |
| 7 | ReDoS | No | No user-supplied-pattern regexes in `app.js`/`city3d.js`. |
| 8 | JWT algorithm confusion | N/A | No JWTs. |
| 9 | HTTP request smuggling | N/A | No server; calls go straight from the browser to Open-Meteo/Esri. |
| 10 | Web cache poisoning | N/A | No server/cache layer under this app's control (the weather fetch explicitly sets `cache:'no-store'`). |
| 11 | Spoofed X-Forwarded-For | N/A | No server-side request handling. |
| 12 | Postgres views bypassing RLS | N/A | No database. |
| 13 | `Math.random()` for security tokens | No | `Math.random()` is not used anywhere in this repo. |
| 14 | Timing attacks on secret comparison | N/A | No secrets/credentials to compare. |
| 15 | Padding oracle | N/A | No encryption/decryption. |
| 16 | Server-side prototype pollution | N/A | No server; `localStorage` reads are parsed into fixed-shape arrays, not deep-merged. |
| 17 | Server-side template injection | N/A | No server, no templating engine. |
| 18 | XXE | N/A | No XML parsing (the Open-Meteo response is JSON). |
| 19 | Cross-site WebSocket hijacking | N/A | No WebSockets. |
| 20 | Unicode username normalization | N/A | No usernames/accounts. |

## Findings outside the 20-point list

None. The one free-text user input — the "Save this scenario as" field
(`#scenarioName`, max 36 characters) — is consistently passed through
`escapeHtml()` (`app.js:139`, escaping `&`/`<`/`>`/`"`/`'`) wherever it's
rendered back via `innerHTML` in `renderSaved()` (`app.js:134`), both in the
saved-scenarios list and the two-scenario comparison panel. Every other
`innerHTML` write in the app (page templates, weather-point names, forecast
chart/SVG, favorite-place options) builds its content only from hardcoded
app data or numeric/date values computed from the API response — no other
unescaped free-text user input reaches the DOM.

No fixes are proposed or applied in this review.
