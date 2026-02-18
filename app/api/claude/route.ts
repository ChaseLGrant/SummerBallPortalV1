import { NextRequest, NextResponse } from 'next/server';
import { sendMessage, sendConversation } from '@/lib/claudeUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, messages, systemPrompt, model } = body;

    // Validate request
    if (!message && !messages) {
      return NextResponse.json(
        { error: 'Either message or messages array is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    let response: string;

    // Handle single message or conversation
    if (messages && Array.isArray(messages)) {
      response = await sendConversation(messages, systemPrompt, model);
    } else {
      response = await sendMessage(message, systemPrompt, model);
    }

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error('Error in Claude API route:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
