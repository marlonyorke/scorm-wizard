# Lean LTI 1.3 Stappenplan – SCORM Wizard

Dit plan is gericht op een solo-project, proof-of-concept of kleine pilot. Alleen de essentiële stappen, zonder overbodige complexiteit.

---

## 1. Voorbereiding
- [✅] **Installeer ltijs**: `npm install ltijs express-session`
- [✅] **.env**: Zet secrets (client secret, db-url) in `.env` (niet in git)
- [✅] **HTTPS via ngrok**: Start je backend met `ngrok http 3002` (LTI 1.3 vereist HTTPS)
https://19cc-178-224-10-53.ngrok-free.app  →  http://localhost:3002
**DoD:**
- [✅] App start op, secrets staan niet in repo, backend is publiek bereikbaar via ngrok.

---

## 2. LTI-provider (backend)
- [❌] **Configureer ltijs**: Initieer ltijs, stel JWKS endpoint en launch endpoint in.
- [❌] **/lti/launch**: Endpoint die launchdata verwerkt en gebruiker in sessie zet.
- [❌] **Nette foutafhandeling**: Bij JWT/LTI-fout → duidelijke foutpagina (“Access denied – please launch from Moodle”)
- [❌] **/health**: Simpele endpoint die `{ status: 'ok' }` teruggeeft

**DoD:**
- [❌] JWKS endpoint werkt (`/lti/.well-known/jwks.json`)
- [❌] Launch endpoint accepteert geldige launches
- [❌] Foutpagina bij ongeldige launch
- [❌] Healthcheck endpoint werkt

---

## 3. LTI-tool registratie in Moodle
- [❌] **Registreer ngrok-URL** als Tool URL, JWKS endpoint en login endpoint in Moodle
- [❌] **Let op**: Na elke ngrok-reset moet je de tool opnieuw registreren

**DoD:**
- [❌] Launch vanuit Moodle werkt, gebruiker komt in de app

---

## 4. Frontend integratie
- [❌] **/api/lti/user**: Endpoint die launchdata (naam, rol) teruggeeft aan frontend
- **React haalt deze data op** en toont naam/rol zichtbaar in de UI
- **Foutmelding**: Bij 403/fout toont frontend “Deze pagina is alleen toegankelijk via Moodle.”

**DoD:**
- Gebruiker ziet naam/rol na launch
- Bij foutieve launch duidelijke melding

---

## 5. Testen
- **Handmatige tests**:
  - Launch via Moodle → werkt, naam/rol zichtbaar
  - Directe toegang → nette foutpagina
  - JWKS en healthcheck endpoints werken

**DoD:**
- Kritieke flows werken in praktijk

---

## 6. Documentatie
- **README**: Korte uitleg over installatie, LTI-registratie, healthcheck, en troubleshooting (max 1 pagina)

**DoD:**
- README is kort, duidelijk, en getest door jezelf of collega

---

## Extra (optioneel, alleen als je app groeit)
- CORS/rate limiting/logging frameworks/security policies toevoegen zodra je app publiek of door meerdere mensen gebruikt wordt.
- Unit/E2E tests toevoegen voor kritieke paden als je project groter wordt.

---

**Keep it lean:** Bouw alleen wat je snapt en wat je project nu nodig heeft. Breid uit als het project groeit!
