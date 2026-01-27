import { NextRequest, NextResponse } from 'next/server';
import { WebhookHandler } from '@/lib/githubServices/webhookHandler';

// Initialize webhook handler
const webhookHandler = new WebhookHandler(process.env.GITHUB_WEBHOOK_SECRET);

export async function POST(request: NextRequest) {
  try {
    return await webhookHandler.handleWebhook(request);
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'GitHub webhook endpoint is active' },
    { status: 200 }
  );
}