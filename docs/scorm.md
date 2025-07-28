# SCORM Export Implementatie

Dit document beschrijft de implementatie van de SCORM export functionaliteit in de SCORM Wizard applicatie, met een focus op compatibiliteit en gebruikerservaring.

## Overzicht

De SCORM export functionaliteit stelt gebruikers in staat om quizzen te exporteren als SCORM-pakketten die kunnen worden geïmporteerd in verschillende Learning Management Systems (LMS). De implementatie is ontworpen met de volgende doelen:

1. **Maximale compatibiliteit** met verschillende SCORM-viewers en LMS-systemen
2. **Visueel aantrekkelijke presentatie** met behoud van het Cyberpunk Neon thema
3. **Ondersteuning voor optie-specifieke feedback** voor elke antwoordkeuze
4. **Flexibele weergavemodi** (één vraag per pagina of alle vragen op één pagina)

## Technische Implementatie

### Architectuur

De SCORM export functionaliteit bestaat uit drie hoofdcomponenten:

1. **Package Generator** (`src/utils/scorm/package.ts`): Verantwoordelijk voor het genereren van het volledige SCORM-pakket, inclusief HTML, CSS, JavaScript en manifest bestanden.

2. **Renderers** (`src/utils/scorm/renderers/`): Verantwoordelijk voor het omzetten van verschillende vraagtypes naar HTML. Elke renderer is gespecialiseerd in een specifiek vraagtype.

3. **Base Renderer** (`src/utils/scorm/renderers/base.ts`): Basisklasse voor alle renderers, bevat gemeenschappelijke functionaliteit.

### Vereenvoudigde HTML-structuur

Om maximale compatibiliteit te garanderen, is gekozen voor een eenvoudige HTML-structuur:

```html
<div class="question">
  <h2 class="question-text">Vraagtekst hier</h2>
  <div class="options">
    <label class="option-label">
      <input type="radio" name="question-id" value="optie-id" data-correct="true">
      <span class="option-text">Optietekst hier</span>
    </label>
    <!-- Meer opties hier -->
  </div>
  <button class="check-button" onclick="checkAnswer('vraag-id')">Controleer antwoord</button>
  <div id="feedback-container-vraag-id" class="feedback-container"></div>
</div>
```

Deze structuur:
- Gebruikt standaard HTML-elementen (div, label, input, button)
- Vermijdt geneste elementen waar mogelijk
- Koppelt labels direct aan inputs voor betere toegankelijkheid
- Gebruikt data-attributen voor JavaScript interactie

### CSS Implementatie

De CSS is vereenvoudigd tot één bestand met directe styling in plaats van CSS-variabelen of complexe selectors:

```css
/* Basis stijlen */
body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #0F0F12;
  color: #E0E0FF;
}

/* Vraag container */
.question {
  background-color: #1A1A24;
  border: 1px solid #303050;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* Meer CSS hier... */
```

De styling behoudt de belangrijkste kenmerken van het Cyberpunk Neon thema:
- Donkere achtergrond (#0F0F12, #1A1A24)
- Neon accenten (#FF2E6E, #01FFC3)
- Subtiele schaduwen en hover-effecten
- Duidelijke visuele hiërarchie

### JavaScript Functionaliteit

De JavaScript-code is gescheiden in een apart bestand en vereenvoudigd voor maximale compatibiliteit:

```javascript
// Wacht tot de pagina geladen is
window.onload = function() {
  // Initialiseer SCORM API
  if (typeof API !== 'undefined') {
    API.LMSInitialize('');
  }
  
  // Voeg click event toe aan alle optie labels
  var optionLabels = document.querySelectorAll('.option-label');
  for (var i = 0; i < optionLabels.length; i++) {
    // Event handlers hier...
  }
  
  // Initialiseer paginering als we in multi-page modus zijn
  if (document.getElementById('prev-button')) {
    initPagination();
  }
};

// Meer JavaScript functies hier...
```

De JavaScript-code:
- Gebruikt alleen basisfunctionaliteit die in alle browsers werkt
- Vermijdt moderne ES6+ features voor betere compatibiliteit
- Implementeert directe event handlers in plaats van complexe event delegation
- Gebruikt eenvoudige DOM-manipulatie technieken

### Feedback Systeem

Het feedback systeem is geïmplementeerd als een directe weergave onder de vraag:

1. Elke optie heeft een unieke feedback tekst die wordt opgeslagen in verborgen elementen
2. Wanneer een gebruiker op "Controleer antwoord" klikt, wordt de juiste feedback getoond
3. De feedback container krijgt een klasse (`feedback-correct` of `feedback-incorrect`) afhankelijk van het antwoord
4. De specifieke feedback tekst voor de gekozen optie wordt in de container geplaatst

Dit systeem:
- Toont duidelijk of een antwoord correct of incorrect is
- Geeft specifieke feedback voor elke antwoordoptie
- Is visueel consistent met het algemene thema
- Werkt betrouwbaar in verschillende browsers en SCORM-viewers

### Feedback Mechanisme

#### Optie-specifieke Feedback
Elke antwoordoptie heeft zijn eigen specifieke feedback die wordt getoond wanneer een student dat antwoord kiest. Dit vervangt het eerdere model waarbij algemene feedback werd gegeven voor correcte en incorrecte antwoorden.

#### Feedback Erkenning
Om ervoor te zorgen dat studenten actief betrokken zijn bij het leerproces, is een mechanisme geïmplementeerd waarbij studenten het juiste antwoord moeten erkennen voordat ze verder kunnen gaan:

1. **Bij correcte antwoorden:**
   - De specifieke feedback voor dat antwoord wordt getoond
   - De student kan direct doorgaan naar de volgende vraag

2. **Bij incorrecte antwoorden:**
   - De specifieke feedback voor dat antwoord wordt getoond
   - De student moet het juiste antwoord invoeren in een tekstveld
   - De "Volgende" knop blijft uitgeschakeld totdat het juiste antwoord is ingevoerd
   - Het systeem controleert of de invoer overeenkomt met de tekst van het correcte antwoord
   - Wanneer het juiste antwoord is ingevoerd, wordt de "Volgende" knop ingeschakeld

Dit mechanisme zorgt ervoor dat studenten niet alleen passief de feedback lezen, maar actief betrokken zijn bij het begrijpen van het juiste antwoord.

#### Anti-Copy-Paste Maatregelen

Om te garanderen dat studenten het juiste antwoord daadwerkelijk lezen en begrijpen, zijn de volgende maatregelen geïmplementeerd:

1. **Uitschakelen van antwoordopties na controle:**
   - Zodra een antwoord is gecontroleerd, worden alle radio buttons uitgeschakeld
   - De "Controleer antwoord" knop wordt verborgen na de eerste controle
   - Dit voorkomt dat studenten alsnog het juiste antwoord selecteren na een fout antwoord

2. **Anti-plak maatregelen:**
   - Copy, cut en paste acties worden geblokkeerd in het invoerveld
   - Waarschuwingsberichten worden getoond wanneer een student probeert te plakken
   - Het invoerveld wordt tijdelijk uitgeschakeld bij verdachte activiteit

3. **Detectie van natuurlijk typgedrag:**
   - Het systeem analyseert typpatronen om onnatuurlijk typgedrag te detecteren
   - Als een student te snel of te consistent typt (wat kan duiden op geautomatiseerde invoer), wordt een waarschuwing getoond
   - Het invoerveld wordt tijdelijk uitgeschakeld bij verdacht typgedrag

Deze maatregelen zorgen ervoor dat studenten het juiste antwoord daadwerkelijk moeten lezen en handmatig invoeren, wat bijdraagt aan een dieper begrip van de leerstof.

#### Technische Implementatie
De feedback functionaliteit is geïmplementeerd met de volgende technische oplossingen:

1. **JavaScript-functies in de global scope:**
   ```javascript
   // Globale functies definiëren voor gebruik in HTML
   window.checkAnswer = function(questionId) {
     // Functie-implementatie
   };
   
   window.checkCorrectAnswer = function(questionId, correctText) {
     // Functie-implementatie
   };
   
   // Functie voor detectie van natuurlijk typgedrag
   function setupTypingDetection(inputId, questionId) {
     // Functie-implementatie
   }
   ```

2. **Correct escapen van strings in event handlers:**
   ```javascript
   '<button onclick="checkCorrectAnswer(\\'' + questionId + '\\', \\'' + correctText + '\\')">Controleer</button>'
   ```

3. **Gebruik van window-scope in de renderer:**
   ```html
   <button class="check-button" onclick="window.checkAnswer('${questionId}')">Controleer antwoord</button>
   ```

4. **Dynamische UI-updates:**
   - Feedback containers worden dynamisch getoond/verborgen
   - Knoppen worden in-/uitgeschakeld op basis van de antwoorden
   - Feedback-stijlen worden aangepast aan correcte/incorrecte antwoorden
   - Antwoordopties worden uitgeschakeld na de eerste controle
   - De "Controleer antwoord" knop wordt verborgen na de eerste controle

5. **Event listeners voor anti-plak maatregelen:**
   ```javascript
   inputField.addEventListener('paste', function(event) {
     event.preventDefault();
     // Toon waarschuwing
   });
   ```

6. **Algoritme voor detectie van typgedrag:**
   - Berekent gemiddelde tijd tussen toetsaanslagen
   - Berekent standaarddeviatie van typsnelheid
   - Detecteert onnatuurlijk consistente of snelle typpatronen

#### Troubleshooting
Bij problemen met de feedback functionaliteit, controleer het volgende:

1. **JavaScript-console fouten:**
   - `Uncaught SyntaxError: Unexpected string` - Controleer escape-tekens in strings
   - `Uncaught ReferenceError: X is not defined` - Controleer of functies in de global scope beschikbaar zijn
   - `Uncaught TypeError: Cannot read property 'addEventListener' of null` - Controleer of elementen correct worden gevonden

2. **SCORM-integratie:**
   - Zorg dat de SCORM API correct wordt geïnitialiseerd
   - Controleer of de SCORM-viewer JavaScript toestaat
   - Sommige SCORM-viewers kunnen strikte CSP (Content Security Policy) hebben die event listeners beperkt

3. **Browser-compatibiliteit:**
   - Test in verschillende browsers om compatibiliteitsproblemen te identificeren
   - Vermijd geavanceerde JavaScript-functies die mogelijk niet in alle SCORM-viewers worden ondersteund
   - Controleer of de browser alle gebruikte event listeners ondersteunt

4. **Anti-plak maatregelen:**
   - Als de anti-plak maatregelen te streng zijn, pas de parameters aan in de setupTypingDetection functie
   - Bij problemen met de typgedrag detectie, pas de drempelwaarden voor standaarddeviatie en gemiddelde tijd aan
   - Als studenten legitieme problemen ondervinden met het invoeren van antwoorden, overweeg de gevoeligheid te verlagen

### Paginering

Voor de "één vraag per pagina" modus is een eenvoudig pagineringssysteem geïmplementeerd:

1. Elke vraag wordt in een `div` met de klasse `page` geplaatst
2. Alleen de actieve pagina krijgt de klasse `active` en wordt getoond
3. Navigatieknoppen (Vorige/Volgende) schakelen tussen pagina's
4. Een pagina-indicator toont de huidige positie (bijv. "Vraag 2 van 5")

De paginering:
- Werkt zonder afhankelijkheid van complexe libraries
- Gebruikt eenvoudige CSS-klassen voor weergavelogica
- Biedt duidelijke visuele feedback over de huidige positie
- Schakelt knoppen automatisch uit bij de eerste/laatste vraag

## Aanpassingen voor Compatibiliteit

Om maximale compatibiliteit te garanderen, zijn de volgende aanpassingen gemaakt:

1. **Verwijdering van complexe CSS-frameworks**: Geen afhankelijkheid van externe CSS-frameworks of variabelen.

2. **Vereenvoudigde DOM-structuur**: Minder geneste elementen en eenvoudigere selector-logica.

3. **Basis JavaScript**: Gebruik van oudere JavaScript-technieken die in alle browsers werken.

4. **Directe styling**: Inline styling waar nodig voor kritieke elementen.

5. **Gescheiden bestanden**: CSS en JavaScript in aparte bestanden voor betere caching en prestaties.

6. **Minimale afhankelijkheden**: Alleen JSZip als externe afhankelijkheid voor het maken van het ZIP-bestand.

## Weergavemodi

De SCORM export ondersteunt twee weergavemodi:

1. **Single-page modus**: Alle vragen worden op één pagina getoond, wat handig is voor korte quizzen.

2. **Multi-page modus**: Elke vraag wordt op een aparte pagina getoond met navigatieknoppen, wat beter is voor langere quizzen of wanneer vragen veel media bevatten.

## Toekomstige Verbeteringen

Mogelijke toekomstige verbeteringen voor de SCORM export functionaliteit:

1. **Betere rapportage**: Uitgebreidere SCORM-rapportage met meer gedetailleerde scores en voortgangsinformatie.

2. **Meer vraagtypes**: Ondersteuning voor andere vraagtypes zoals drag-and-drop, matching, etc.

3. **Aanpasbare thema's**: Mogelijkheid voor gebruikers om het thema aan te passen of te kiezen uit meerdere thema's.

4. **Verbeterde toegankelijkheid**: Verdere verbeteringen voor screenreaders en toetsenbordnavigatie.

5. **Offline modus**: Mogelijkheid om SCORM-pakketten offline te gebruiken.

6. **Geavanceerdere anti-fraude maatregelen**: Verdere verfijning van de typgedrag detectie en anti-plak maatregelen.

7. **Alternatieve verificatiemethoden**: Implementatie van verschillende methoden om begrip te verifiëren, zoals multiple-choice vragen over het juiste antwoord.

8. **Aanpasbare gevoeligheid**: Mogelijkheid voor docenten om de gevoeligheid van de anti-fraude maatregelen aan te passen.

## Conclusie

De huidige implementatie biedt een goede balans tussen visuele aantrekkelijkheid en brede compatibiliteit. De SCORM-pakketten werken in vrijwel alle SCORM-compatibele leeromgevingen, terwijl ze nog steeds de visuele identiteit van de Cyberpunk Neon stijl behouden.

Door te kiezen voor eenvoudige, beproefde technieken in plaats van geavanceerde maar mogelijk problematische features, zorgt deze implementatie voor een betrouwbare en consistente gebruikerservaring in verschillende LMS-systemen.
