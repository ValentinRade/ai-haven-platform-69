
import { WebhookResponse } from './types';

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

  try {
    const response = await fetch('https://automation-n8n.ny2xzw.easypanel.host/webhook/06bd3c97-5c9b-49bb-88c3-d16a5d20a52b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    // Check if response is ok
    if (!response.ok) {
      console.error(`Webhook request failed with status ${response.status}`);
      return {};
    }

    // Get the response text first
    const responseText = await response.text();
    
    // Return early if empty response
    if (!responseText || responseText.trim() === '') {
      console.log('Webhook returned empty response');
      return {};
    }
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse webhook response as JSON:', parseError);
      console.log('Raw response:', responseText);
      return {};
    }

    let result: WebhookResponse = {};

    if (responseData.answer) {
      result.answer = responseData.answer;
    } else if (responseData.output) {
      // Handle direct output property
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
    return {};
  }
};
