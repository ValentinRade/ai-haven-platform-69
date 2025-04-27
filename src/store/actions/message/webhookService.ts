
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

  const response = await fetch('https://automation-n8n.ny2xzw.easypanel.host/webhook/06bd3c97-5c9b-49bb-88c3-d16a5d20a52b', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(webhookPayload)
  });

  const responseData = await response.json();
  let result: WebhookResponse = {};

  if (responseData.answer) {
    result.answer = responseData.answer;
  } else if (Array.isArray(responseData) && responseData[0]?.output) {
    result.output = responseData[0].output;
  }
  
  if (isFirstMessage && responseData.chatname) {
    result.chatname = responseData.chatname;
  }

  return result;
};
