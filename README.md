# Summer Ball Portal V1

A Next.js application for summer ball management with AI-powered features using Claude API.

## Features

- AI-powered features using Anthropic's Claude API
- Built with Next.js 14.2.21
- TypeScript support
- Tailwind CSS styling

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- Anthropic API key (get one from [https://console.anthropic.com/](https://console.anthropic.com/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ChaseLGrant/SummerBallPortalV1.git
cd SummerBallPortalV1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Claude API Integration

### API Endpoint

The application includes a Claude API endpoint at `/api/claude` that accepts POST requests.

#### Single Message Example

```javascript
const response = await fetch('/api/claude', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Hello, Claude!',
    systemPrompt: 'You are a helpful assistant.', // optional
    model: 'claude-3-5-sonnet-20241022', // optional
    maxTokens: 1024, // optional
  }),
});

const data = await response.json();
console.log(data.response);
```

#### Conversation Example

```javascript
const response = await fetch('/api/claude', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'What is the weather like?' },
      { role: 'assistant', content: 'I don\'t have real-time weather data.' },
      { role: 'user', content: 'Can you tell me about climate?' },
    ],
    systemPrompt: 'You are a helpful assistant.', // optional
    model: 'claude-3-5-sonnet-20241022', // optional
    maxTokens: 1024, // optional
  }),
});

const data = await response.json();
console.log(data.response);
```

### Utility Functions

The application provides utility functions in `lib/claudeUtils.ts`:

```typescript
import { sendMessage, sendConversation } from '@/lib/claudeUtils';

// Send a single message
const response = await sendMessage(
  'Hello, Claude!',
  'You are a helpful assistant.', // optional system prompt
  'claude-3-5-sonnet-20241022', // optional model
  1024 // optional max tokens
);

// Send a conversation
const conversationResponse = await sendConversation(
  [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' },
    { role: 'user', content: 'How are you?' },
  ],
  'You are a helpful assistant.', // optional system prompt
  'claude-3-5-sonnet-20241022', // optional model
  1024 // optional max tokens
);
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Framework**: Next.js 14.2.21
- **Language**: TypeScript 5.3.3
- **AI**: Anthropic Claude API via @anthropic-ai/sdk
- **Styling**: Tailwind CSS
- **Database**: Supabase

## License

This project is private and not licensed for public use.
