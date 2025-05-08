
# Funnel UI Component Library

Diese Komponenten-Bibliothek stellt eine responsive React+Tailwind Funnel UI bereit.

## Verzeichnisstruktur

```
src/
├── components/
│   ├── funnel/
│   │   ├── FunnelContainer.tsx      # Haupt-Container für den gesamten Funnel
│   │   ├── FunnelProgress.tsx       # Fortschrittsanzeige
│   │   ├── Step1.tsx                # Erste statische Stufe
│   │   ├── Step2.tsx                # Zweite statische Stufe (bedingt)
│   │   ├── DynamicStep.tsx          # Komponente für dynamische Stufen
│   │   ├── IconLoader.tsx           # Dynamic Icon Loader
│   │   ├── views/                   # Unter-Komponenten für verschiedene Fragetypen
│   │   │   ├── QuestionView.tsx     # Einzelauswahl-Frage
│   │   │   ├── MultiSelectView.tsx  # Mehrfachauswahl
│   │   │   ├── TextInputView.tsx    # Kurztextfeld
│   │   │   ├── TextAreaView.tsx     # Langtextfeld
│   │   │   ├── DateInputView.tsx    # Datumsauswahl
│   │   │   ├── NumberInputView.tsx  # Nummerneingabe
│   │   │   └── ContactFormView.tsx  # Kontaktformular
├── pages/
│   └── FunnelPage.tsx               # Seite, die den Funnel enthält
```

## Webhook-Integration

Der Funnel sendet Daten an einen Webhook-Endpunkt nach jeder Benutzeraktion. Die Integration erfolgt auf zwei mögliche Arten:

### Option 1: Nutzen des bestehenden Webhook-Systems

Die Funnel-Komponente nutzt standardmäßig den in `chatStore.ts` konfigurierten Webhook:

```typescript
const { sendToWebhook } = useChatStore();
const actualWebhookUrl = webhookUrl || useChatStore.getState().webhookUrl;
```

### Option 2: Eigenen Webhook-Endpunkt angeben

Alternativ kann ein eigener Webhook-Endpunkt bei der Verwendung der Komponente übergeben werden:

```jsx
<FunnelContainer webhookUrl="https://your-webhook-url.com/endpoint" />
```

### JSON-Antwortformat des Webhooks

Der Webhook sollte folgendes Format für die JSON-Antwort verwenden:

```json
{
  "nextSteps": [
    {
      "type": "question", // oder "multiSelect", "text", "textarea", "date", "number", "contact"
      "id": "unique_field_id",
      "title": "Ihre Frage hier?",
      "description": "Optionale Beschreibung",
      "options": [
        {
          "id": "option_1",
          "label": "Option 1",
          "value": "option_1_value"
        },
        {
          "id": "option_2",
          "label": "Option 2",
          "value": "option_2_value"
        }
      ]
      // weitere Eigenschaften je nach Typ
    }
  ]
}
```

### Verwendung der Komponente in einer Seite:

```jsx
import FunnelContainer from "@/components/funnel/FunnelContainer";

const MyPage = () => {
  return (
    <div>
      <h1>Ihre Finanzierungsanfrage</h1>
      <FunnelContainer />
    </div>
  );
};
```

## Dynamische Schritte

Ab Schritt 3 werden alle Schritte dynamisch vom Webhook generiert. Der letzte Schritt ist immer ein Kontaktformular.

## Beispiel-Responses für verschiedene Fragetypen:

### Einzelauswahl (question)
```json
{
  "nextSteps": [
    {
      "type": "question",
      "id": "property_type",
      "title": "Welche Art von Immobilie suchen Sie?",
      "description": "Bitte wählen Sie eine Option, die zu Ihren Plänen passt.",
      "options": [
        { "id": "house", "label": "Haus", "value": "house" },
        { "id": "apartment", "label": "Wohnung", "value": "apartment" },
        { "id": "land", "label": "Grundstück", "value": "land" }
      ]
    }
  ]
}
```

### Mehrfachauswahl (multiSelect)
```json
{
  "nextSteps": [
    {
      "type": "multiSelect",
      "id": "property_features",
      "title": "Welche Eigenschaften sind Ihnen wichtig?",
      "description": "Wählen Sie alle zutreffenden Optionen.",
      "options": [
        { "id": "garden", "label": "Garten", "value": "garden" },
        { "id": "balcony", "label": "Balkon", "value": "balcony" },
        { "id": "garage", "label": "Garage", "value": "garage" },
        { "id": "basement", "label": "Keller", "value": "basement" }
      ]
    }
  ]
}
```
