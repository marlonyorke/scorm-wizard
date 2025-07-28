# SCORM Wizard Code Standards

Dit document beschrijft de code standaarden en linting regels voor het SCORM Wizard project.

## ESLint Configuratie

Het project gebruikt ESLint met een uitgebreide set regels om consistente code stijl en kwaliteit te waarborgen. De configuratie is te vinden in `eslint.config.js` in de root van het project.

### Belangrijke Regels

- **Quotes**: Gebruik dubbele aanhalingstekens (`"`) voor strings
- **Indentatie**: 2 spaties voor indentatie
- **Semicolons**: Verplicht aan het einde van statements
- **Comma Dangle**: Verplicht voor multi-line objecten en arrays
- **Imports**: Geordend volgens conventie (builtin → external → internal)
- **React Hooks**: Volg de regels voor React Hooks
- **TypeScript**: Waarschuwingen voor `any` type en ongebruikte variabelen

## Gebruik van ESLint

### Commando's

- **Linting controleren**: `npm run lint`
- **Automatisch fixbare issues oplossen**: `npm run lint:fix`

### Pre-commit Hook

Het project gebruikt Husky en lint-staged om automatisch linting uit te voeren bij elke commit. Dit zorgt ervoor dat alle gecommitte code voldoet aan de vastgestelde standaarden.

## Code Stijl Richtlijnen

### Algemeen

- Gebruik betekenisvolle namen voor variabelen, functies en klassen
- Houd functies klein en met een enkele verantwoordelijkheid
- Vermijd magic numbers en strings, gebruik constanten
- Voeg commentaar toe voor complexe logica

### TypeScript

- Gebruik expliciete types waar mogelijk
- Vermijd het gebruik van `any`
- Gebruik interfaces voor object types
- Gebruik type guards voor type narrowing

### React

- Gebruik functionele componenten met hooks
- Vermijd class componenten
- Gebruik destructuring voor props
- Gebruik React.memo voor performance optimalisatie waar nodig

### Import Volgorde

1. React en React-gerelateerde imports
2. Externe libraries
3. Interne modules
4. Types
5. Styles

### Bestandsorganisatie

- Eén component per bestand
- Bestandsnaam moet overeenkomen met de component naam
- Gebruik index.ts bestanden voor het exporteren van meerdere componenten uit een directory

## Conclusie

Door deze standaarden te volgen, zorgen we voor een consistente, leesbare en onderhoudbare codebase. De automatische linting en pre-commit hooks helpen om deze standaarden te handhaven zonder extra moeite van ontwikkelaars.
