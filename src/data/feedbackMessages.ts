/**
 * Positieve feedback berichten voor correcte antwoorden
 */
export const positiveFeedbackMessages = [
  "Goed gedaan! Je hebt het juiste antwoord gekozen.",
  "Perfect! Dat is het correcte antwoord.",
  "Uitstekend! Je hebt de vraag correct beantwoord.",
  "Bravo! Je hebt het helemaal goed.",
  "Geweldig! Je antwoord is correct.",
  "Knap gedaan! Je hebt de juiste keuze gemaakt.",
  "Fantastisch! Je hebt het goed begrepen.",
  "Prima! Je antwoord is helemaal juist.",
  "Heel goed! Je hebt de vraag correct beantwoord.",
  "Uitstekend werk! Je antwoord is correct.",
  "Goed zo! Je hebt het juiste antwoord gevonden.",
  "Indrukwekkend! Je hebt het goed.",
  "Correct! Je begrijpt het materiaal goed.",
  "Goed beantwoord! Je hebt de juiste keuze gemaakt.",
  "Helemaal goed! Je hebt de vraag correct beantwoord.",
];

/**
 * Negatieve feedback berichten voor incorrecte antwoorden
 */
export const negativeFeedbackMessages = [
  "Helaas, dat is niet het juiste antwoord. Probeer het nog eens.",
  "Niet helemaal. Kijk nog eens goed naar de vraag.",
  "Dat is niet correct. Lees de vraag nog eens zorgvuldig.",
  "Jammer, je antwoord is niet juist. Probeer het nog een keer.",
  "Dat is niet het antwoord waar we naar op zoek zijn.",
  "Niet correct. Denk nog eens na over de vraag.",
  "Helaas, je antwoord is niet juist. Probeer het opnieuw.",
  "Dat klopt niet helemaal. Bekijk de vraag nog eens.",
  "Je antwoord is niet correct. Probeer het nog eens.",
  "Niet juist. Denk nog eens goed na over de vraag.",
  "Dat is niet het juiste antwoord. Lees de vraag nog eens.",
  "Niet correct. Probeer het nog een keer.",
  "Jammer, dat is niet juist. Probeer het opnieuw.",
  "Dat antwoord is niet correct. Kijk nog eens naar de vraag.",
  "Helaas, je hebt het niet goed. Probeer het nog eens.",
];

/**
 * Thema-specifieke feedback berichten
 */
export const themeFeedbackMessages = {
  cosmic: {
    positive: [
      "Kosmisch goed! Je antwoord straalt als een supernova.",
      "Stellair! Je kennis is zo helder als een quasar.",
      "Galactisch correct! Je begrip is van een andere dimensie.",
      "Astronomisch goed! Je antwoord is spot-on.",
      "Interstellair briljant! Je hebt de juiste koers gevonden.",
    ],
    negative: [
      "Een kleine afwijking in je kosmische navigatie. Probeer opnieuw.",
      "Je antwoord is in een zwart gat verdwenen. Nog een poging?",
      "Niet helemaal in de juiste baan. Herbereken je koers.",
      "Je bent net naast de sterrennevel. Probeer het nog eens.",
      "Een kleine meteoriet heeft je antwoord geraakt. Probeer opnieuw.",
    ],
  },
  cyberpunk: {
    positive: [
      "Hack geslaagd! Je antwoord is perfect geïnfiltreerd.",
      "Netrunner-status bereikt! Je kennis is op topniveau.",
      "Digitaal meesterwerk! Je hebt de code gekraakt.",
      "Synthetisch perfect! Je antwoord is volledig geoptimaliseerd.",
      "Cybernetisch briljant! Je hebt het systeem gehackt.",
    ],
    negative: [
      "Systeemfout gedetecteerd. Probeer je hack opnieuw.",
      "Firewall geblokkeerd. Je antwoord kwam niet door.",
      "Corrupte data gedetecteerd. Herformatteer je antwoord.",
      "Toegang geweigerd. Je hebt de verkeerde toegangscode.",
      "Malware gedetecteerd in je antwoord. Probeer opnieuw.",
    ],
  },
  aurora: {
    positive: [
      "Schitterend als het noorderlicht! Je antwoord is perfect.",
      "Betoverend goed! Je kennis danst als de aurora.",
      "Magisch correct! Je begrip schittert helder.",
      "Stralend juist! Je antwoord gloeit van precisie.",
      "Hemels goed! Je hebt de juiste harmonie gevonden.",
    ],
    negative: [
      "Je antwoord is achter de wolken verdwenen. Probeer het nog eens.",
      "Een kleine storm heeft je antwoord verstoord. Nog een poging?",
      "De aurora is nog niet zichtbaar in je antwoord. Probeer opnieuw.",
      "Je antwoord mist nog wat gloed. Probeer het nog eens.",
      "De hemelse dans is nog niet perfect. Probeer opnieuw.",
    ],
  },
};

/**
 * Haalt een willekeurig feedback bericht op, afhankelijk van of het antwoord correct is of niet
 * @param isCorrect Boolean die aangeeft of het antwoord correct is
 * @param theme Optioneel thema voor thema-specifieke berichten
 * @returns Een willekeurig feedback bericht
 */
export function getRandomFeedbackMessage(isCorrect: boolean, theme?: string): string {
  // Basis berichten selecteren
  const messages = isCorrect ? positiveFeedbackMessages : negativeFeedbackMessages;
  
  // Thema-specifieke berichten toevoegen als een thema is opgegeven
  let themeMessages: string[] = [];
  if (theme && themeFeedbackMessages[theme as keyof typeof themeFeedbackMessages]) {
    themeMessages = themeFeedbackMessages[theme as keyof typeof themeFeedbackMessages][isCorrect ? "positive" : "negative"];
  }
  
  // Combineer de berichten en kies er willekeurig één
  const allMessages = [...messages, ...themeMessages];
  const randomIndex = Math.floor(Math.random() * allMessages.length);
  
  return allMessages[randomIndex];
}
