import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export default anthropic;
