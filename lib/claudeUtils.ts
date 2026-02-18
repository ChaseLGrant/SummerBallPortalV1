import anthropic from './claude';

// Default configuration
const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';
const DEFAULT_MAX_TOKENS = 1024;

/**
 * Send a message to Claude and get a response
 * @param message - The message to send to Claude
 * @param systemPrompt - Optional system prompt to set context
 * @param model - Claude model to use (default: claude-3-5-sonnet-20241022)
 * @param maxTokens - Maximum tokens in response (default: 1024)
 * @returns The text response from Claude
 */
export async function sendMessage(
  message: string,
  systemPrompt?: string,
  model: string = DEFAULT_MODEL,
  maxTokens: number = DEFAULT_MAX_TOKENS
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
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
 * @param maxTokens - Maximum tokens in response (default: 1024)
 * @returns The text response from Claude
 */
export async function sendConversation(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string,
  model: string = DEFAULT_MODEL,
  maxTokens: number = DEFAULT_MAX_TOKENS
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
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
