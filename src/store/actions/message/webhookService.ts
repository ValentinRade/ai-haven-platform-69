
import { WebhookResponse } from './types';
import { toast } from '@/hooks/use-toast';

// Fallback URL if environment variable is not set
const FALLBACK_WEBHOOK_URL = 'https://automation-n8n.ny2xzw.easypanel.host/webhook/06bd3c97-5c9b-49bb-88c3-d16a5d20a52b';

export const sendMessageToWebhook = async (
  userId: string,
  chatId: string,
  content: string,
  isFirstMessage: boolean,
  isAudioMessage: boolean
): Promise<WebhookResponse> => {
  const webhookPayload = {
    userId,
    chatId,
    isFirstMessage,
    ...(isAudioMessage 
      ? { audio: content }
      : { message: content }
    )
  };

  // Get webhook URL from environment variable or use fallback
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || FALLBACK_WEBHOOK_URL;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify(webhookPayload)
    });

    // Check if response is ok
    if (!response.ok) {
      console.error(`Webhook request failed with status ${response.status}`);
      toast({
        title: "Verbindungsfehler",
        description: `Der Server konnte nicht erreicht werden (Status: ${response.status})`,
        variant: "destructive"
      });
      return {};
    }

    // Get the response text first
    const responseText = await response.text();
    
    // Return early if empty response
    if (!responseText || responseText.trim() === '') {
      console.log('Webhook returned empty response');
      toast({
        title: "Information",
        description: "Keine Antwort vom Server erhalten",
        variant: "destructive"
      });
      return {};
    }
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse webhook response as JSON:', parseError);
      console.log('Raw response:', responseText);
      toast({
        title: "Verarbeitungsfehler",
        description: "Die Serverantwort konnte nicht verarbeitet werden",
        variant: "destructive"
      });
      return {};
    }

    let result: WebhookResponse = {};

    if (responseData.answer) {
      result.answer = responseData.answer;
    } else if (responseData.output) {
      result.output = responseData.output;
    } else if (Array.isArray(responseData) && responseData[0]?.output) {
      result.output = responseData[0].output;
    }
    
    if (isFirstMessage && responseData.chatname) {
      result.chatname = responseData.chatname;
    }

    return result;
  } catch (error) {
    console.error('Webhook request error:', error);
    toast({
      title: "Verbindungsfehler",
      description: "Die Verbindung zum Server konnte nicht hergestellt werden",
      variant: "destructive"
    });
    return {};
  }
};

