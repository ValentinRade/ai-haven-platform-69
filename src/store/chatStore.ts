
import { create } from 'zustand';
import { Chat, ChatMessage } from '@/types/chat';

// Mock data
const mockChats: Chat[] = [
  {
    id: '1',
    title: 'Immobilienfinanzierung',
    lastMessage: 'Welche Unterlagen benötige ich für eine Baufinanzierung?',
    timestamp: new Date('2023-05-15T14:30:00'),
    messages: [
      {
        id: '1-1',
        type: 'user',
        content: 'Ich möchte eine Immobilie finanzieren. Welche Unterlagen benötige ich?',
        timestamp: new Date('2023-05-15T14:25:00')
      },
      {
        id: '1-2',
        type: 'ai',
        content: 'Für eine Baufinanzierung benötigen Sie in der Regel folgende Unterlagen:\n\n1. Einkommensnachweise (Gehaltsabrechnungen der letzten 3 Monate)\n2. Steuerbescheide der letzten 2 Jahre\n3. Grundbuchauszug\n4. Bei Neubau: Baugenehmigung und Baupläne\n5. Eigenkapitalnachweis\n6. Persönliche Ausweisdokumente\n\nMöchten Sie detailliertere Informationen zu einem dieser Punkte?',
        timestamp: new Date('2023-05-15T14:30:00')
      }
    ]
  },
  {
    id: '2',
    title: 'Mietvertrag Fragen',
    lastMessage: 'Hier ist eine Vorlage für die Mieterhöhung nach Modernisierung.',
    timestamp: new Date('2023-05-20T10:15:00'),
    messages: [
      {
        id: '2-1',
        type: 'user',
        content: 'Wie kann ich als Vermieter eine Mieterhöhung nach einer Modernisierung durchführen?',
        timestamp: new Date('2023-05-20T10:10:00')
      },
      {
        id: '2-2',
        type: 'ai',
        content: 'Nach einer Modernisierung können Sie die Miete um bis zu 8% der für die Wohnung aufgewendeten Kosten jährlich erhöhen. Sie müssen die Erhöhung schriftlich ankündigen und begründen. Die Modernisierungsmaßnahmen müssen dabei entweder Energie einsparen, den Gebrauchswert der Mietsache erhöhen oder die allgemeinen Wohnverhältnisse nachhaltig verbessern.',
        timestamp: new Date('2023-05-20T10:12:00')
      },
      {
        id: '2-3',
        type: 'user',
        content: 'Gibt es eine Vorlage für so ein Schreiben?',
        timestamp: new Date('2023-05-20T10:13:00')
      },
      {
        id: '2-4',
        type: 'ai',
        content: 'Hier ist eine Vorlage für die Mieterhöhung nach Modernisierung. Bitte passen Sie diese an Ihre spezifische Situation an:\n\n[Ihre Adresse]\n[Datum]\n\nSehr geehrte(r) [Name des Mieters],\n\nwie bereits mit Schreiben vom [Datum der Ankündigung] angekündigt, wurden in der von Ihnen gemieteten Wohnung folgende Modernisierungsmaßnahmen durchgeführt: [Beschreibung der Maßnahmen]\n\nDie Gesamtkosten dieser Maßnahmen belaufen sich auf [Betrag] Euro. Gemäß § 559 BGB bin ich berechtigt, 8% dieser Kosten auf die Jahresmiete umzulegen. Dies entspricht einer monatlichen Mieterhöhung von [Betrag] Euro.\n\nIhre neue Gesamtmiete beträgt ab dem [Datum, mindestens 3 Monate nach diesem Schreiben] monatlich [Betrag] Euro.\n\nMit freundlichen Grüßen,\n[Ihr Name]',
        timestamp: new Date('2023-05-20T10:15:00')
      }
    ]
  },
  {
    id: '3',
    title: 'Investitionsanalyse Wien',
    lastMessage: 'Die durchschnittliche Rendite für Wohnimmobilien in Wien liegt bei etwa 3-4%.',
    timestamp: new Date('2023-06-02T16:45:00'),
    messages: [
      {
        id: '3-1',
        type: 'user',
        content: 'Wie ist der Immobilienmarkt in Wien derzeit? Lohnt sich eine Investition?',
        timestamp: new Date('2023-06-02T16:40:00')
      },
      {
        id: '3-2',
        type: 'ai',
        content: 'Der Wiener Immobilienmarkt gilt als stabil und nachhaltig. Die Preise sind in den letzten Jahren kontinuierlich gestiegen, wenn auch langsamer als in anderen europäischen Hauptstädten. Wien profitiert von einer hohen Lebensqualität und einer wachsenden Bevölkerung.\n\nVorteile einer Investition in Wien:\n- Stabile politische und wirtschaftliche Lage\n- Hohe Nachfrage nach Mietwohnungen\n- Günstige Finanzierungsbedingungen\n\nNachteile:\n- Relativ niedrige Mietrenditen (besonders in zentralen Lagen)\n- Strenges Mietrecht zum Schutz der Mieter\n- Hohe Erwerbsnebenkosten\n\nDie durchschnittliche Rendite für Wohnimmobilien in Wien liegt bei etwa 3-4%. Wenn Sie langfristig investieren möchten und Wertstabilität schätzen, kann Wien eine gute Wahl sein.',
        timestamp: new Date('2023-06-02T16:45:00')
      }
    ]
  },
  {
    id: '4',
    title: 'Steuerliche Aspekte',
    lastMessage: 'Als Vermieter können Sie viele Kosten steuerlich geltend machen, darunter...',
    timestamp: new Date('2023-06-15T09:20:00'),
    messages: [
      {
        id: '4-1',
        type: 'user',
        content: 'Welche Ausgaben kann ich als Vermieter steuerlich absetzen?',
        timestamp: new Date('2023-06-15T09:15:00')
      },
      {
        id: '4-2',
        type: 'ai',
        content: 'Als Vermieter können Sie viele Kosten steuerlich geltend machen, darunter:\n\n1. Zinsen für Kredite zur Finanzierung der Immobilie\n2. Instandhaltungs- und Reparaturkosten\n3. Abschreibungen (AfA) auf das Gebäude (in der Regel 2% pro Jahr)\n4. Verwaltungskosten\n5. Versicherungsprämien\n6. Grundsteuer\n7. Betriebskosten, die nicht auf den Mieter umgelegt werden können\n8. Kosten für Fahrten zur Immobilie\n9. Kosten für einen Steuerberater\n\nBesonders wichtig ist die Unterscheidung zwischen sofort abzugsfähigen Werbungskosten (z.B. Reparaturen) und zu aktivierenden Anschaffungs- oder Herstellungskosten (z.B. umfassende Modernisierungen), die nur über die AfA abgeschrieben werden können.',
        timestamp: new Date('2023-06-15T09:20:00')
      }
    ]
  },
  {
    id: '5',
    title: 'Energieeffizienz',
    lastMessage: 'Die wichtigsten erneuerbaren Energiequellen für Immobilien sind...',
    timestamp: new Date('2023-07-03T11:30:00'),
    messages: [
      {
        id: '5-1',
        type: 'user',
        content: 'Welche erneuerbaren Energien kann ich für mein Mehrfamilienhaus nutzen?',
        timestamp: new Date('2023-07-03T11:25:00')
      },
      {
        id: '5-2',
        type: 'ai',
        content: 'Die wichtigsten erneuerbaren Energiequellen für Mehrfamilienhäuser sind:\n\n1. **Photovoltaik**: Stromerzeugung durch Sonnenlicht, kann für Gemeinschaftsstrom oder mit individuellen Zählern genutzt werden.\n\n2. **Solarthermie**: Nutzung von Sonnenwärme für Warmwasser und Heizungsunterstützung.\n\n3. **Wärmepumpen**: Nutzung von Umweltwärme (Luft, Erde, Grundwasser) für Heizung und Warmwasser, besonders effizient in Kombination mit PV-Anlagen.\n\n4. **Pellet- oder Hackschnitzelheizungen**: Nutzung von Biomasse, besonders für größere Mehrfamilienhäuser geeignet.\n\n5. **Blockheizkraftwerke (BHKW)**: Erzeugen gleichzeitig Strom und Wärme, zunehmend auch mit Biogas oder Wasserstoff betrieben.\n\n6. **Fernwärme aus erneuerbaren Quellen**: Wenn in Ihrer Region verfügbar.\n\nFör die Wirtschaftlichkeit sollten Sie Fördermöglichkeiten wie die BAFA-Förderung für erneuerbare Energien und KfW-Kredite prüfen.',
        timestamp: new Date('2023-07-03T11:30:00')
      }
    ]
  },
  {
    id: '6',
    title: 'Neuer Chat',
    lastMessage: 'Hallo! Ich bin die Immofinanz AI. Wie kann ich Ihnen heute helfen?',
    timestamp: new Date(),
    messages: [
      {
        id: '6-1',
        type: 'ai',
        content: 'Hallo! Ich bin die Immofinanz AI. Wie kann ich Ihnen heute helfen?',
        timestamp: new Date()
      }
    ]
  }
];

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChat: (chatId: string) => void;
  createNewChat: () => void;
  addMessageToCurrentChat: (message: Omit<ChatMessage, 'id'>) => void;
  getCurrentChat: () => Chat | undefined;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [...mockChats],
  currentChatId: mockChats[5].id, // Start with the "Neuer Chat"

  setCurrentChat: (chatId) => {
    set({ currentChatId: chatId });
  },

  createNewChat: () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: 'Neuer Chat',
      lastMessage: 'Hallo! Ich bin die Immofinanz AI. Wie kann ich Ihnen heute helfen?',
      timestamp: new Date(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          type: 'ai',
          content: 'Hallo! Ich bin die Immofinanz AI. Wie kann ich Ihnen heute helfen?',
          timestamp: new Date()
        }
      ]
    };

    set((state) => ({
      chats: [newChat, ...state.chats],
      currentChatId: newChat.id
    }));
  },

  addMessageToCurrentChat: (message) => {
    const { chats, currentChatId } = get();
    if (!currentChatId) return;

    const messageId = `msg-${Date.now()}`;
    const newMessage = { ...message, id: messageId };

    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === currentChatId) {
          // Update the chat title based on the first user message if it's still "Neuer Chat"
          let title = chat.title;
          if (title === 'Neuer Chat' && message.type === 'user') {
            // Take the first 30 characters of the user's message as title
            title = message.content.length > 30 
              ? `${message.content.substring(0, 30)}...` 
              : message.content;
          }

          return {
            ...chat,
            title,
            lastMessage: message.content,
            timestamp: message.timestamp,
            messages: [...chat.messages, newMessage]
          };
        }
        return chat;
      });

      return { chats: updatedChats };
    });
  },

  getCurrentChat: () => {
    const { chats, currentChatId } = get();
    return chats.find(chat => chat.id === currentChatId);
  }
}));
