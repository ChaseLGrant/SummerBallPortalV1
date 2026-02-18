import anthropic from './claude';

/**
 * Send a message to Claude and get a response
 * @param message - The message to send to Claude
 * @param systemPrompt - Optional system prompt to set context
 * @param model - Claude model to use (default: claude-3-5-sonnet-20241022)
 * @returns The text response from Claude
 */
export async function sendMessage(
  message: string,
  systemPrompt?: string,
  model: string = 'claude-3-5-sonnet-20241022'
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Extract text from the response
    const textContent = response.content.find((block) => block.type === 'text');
    return textContent && textContent.type === 'text' ? textContent.text : '';
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

/**
 * Send a conversation to Claude (multiple messages)
 * @param messages - Array of messages in the conversation
 * @param systemPrompt - Optional system prompt to set context
 * @param model - Claude model to use (default: claude-3-5-sonnet-20241022)
 * @returns The text response from Claude
 */
export async function sendConversation(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string,
  model: string = 'claude-3-5-sonnet-20241022'
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    // Extract text from the response
    const textContent = response.content.find((block) => block.type === 'text');
    return textContent && textContent.type === 'text' ? textContent.text : '';
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}
