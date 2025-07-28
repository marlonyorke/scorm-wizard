# Oplossing voor 500 Internal Server Error in AI Question Generation

## Probleem

Bij het genereren van AI-vragen via de OpenAI API trad een 500 Internal Server Error op. De frontend ontving een foutmelding en kon geen vragen genereren.

## Oorzaak

De API response miste het vereiste `metadata` veld dat verwacht wordt volgens de `AIGenerationResponse` type definitie in `src/types/ai.ts`. De frontend verwachtte dit veld om informatie over de generatie te tonen en voor interne verwerking.

## Oplossing

### 1. Toevoegen van metadata generatie in `api/generate-questions.ts`

```typescript
// Bereken metadata voor de response
const metadata = {
  generatedAt: new Date().toISOString(),
  model: "gpt-4-turbo",
  promptTokens: completion.usage?.prompt_tokens || 0,
  completionTokens: completion.usage?.completion_tokens || 0,
  totalTokens: completion.usage?.total_tokens || 0,
  generationTime: endTime - startTime
};

// Stuur de response terug met metadata
console.log('Sending response to client');
return res.status(200).json({
  questions: parsedResponse.questions,
  metadata: metadata,
  statusCode: 200
} as AIGenerationResponse);
```

### 2. Toevoegen van tijdregistratie

Om de generatietijd te berekenen, werden startTime en endTime timestamps toegevoegd:

```typescript
// Roep OpenAI API aan
console.log('Calling OpenAI API...');
const startTime = Date.now();
const completion = await openai.chat.completions.create({
  // ... OpenAI configuratie ...
});
const endTime = Date.now();
console.log('OpenAI API response received');
```

### 3. Controleren van type definities

De `AIGenerationResponse` interface in `src/types/ai.ts` verwacht zowel een `questions` als een `metadata` veld:

```typescript
export interface AIGenerationResponse {
  questions: AIMultipleChoiceQuestion[];
  metadata: AIGenerationMetadata;
}

export interface AIGenerationMetadata {
  generatedAt: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost?: number;
  generationTime?: number;
}
```

## Testen van de oplossing

De oplossing kan getest worden met het `test-api.ps1` script dat een directe API-aanroep doet en de response controleert:

```powershell
.\test-api.ps1
```

Een succesvolle response zal de gegenereerde vragen tonen samen met de metadata, inclusief generatietijd, tokengebruik en modelinformatie.

## Preventie voor de toekomst

Om dit probleem in de toekomst te voorkomen:

1. Zorg ervoor dat alle API responses voldoen aan de gedefinieerde TypeScript interfaces
2. Implementeer uitgebreide logging voor API responses
3. Voeg expliciete type checking toe voor API responses
4. Overweeg het gebruik van een API response validator middleware

## Gerelateerde bestanden

- `api/generate-questions.ts` - API endpoint voor vraag generatie
- `src/types/ai.ts` - Type definities voor AI-gerelateerde interfaces
- `src/services/aiService.ts` - Frontend service voor communicatie met de API
- `src/components/editor/ai/AIQuestionGenerator.tsx` - Component dat de API aanroept

## Datum van oplossing

5 maart 2025
