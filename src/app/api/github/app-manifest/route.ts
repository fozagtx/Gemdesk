import { NextRequest, NextResponse } from 'next/server';

// GitHub App manifest for easy setup
export async function GET() {
  const manifest = {
    name: 'Gemdesk Documentation Assistant',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://gemdesk.ai',
    hook_attributes: {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://gemdesk.ai'}/api/github/webhook`,
    },
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://gemdesk.ai'}/dashboard/github/callback`,
    description: 'AI-powered documentation updates that keep your docs in sync with your code.',
    public: false,
    default_events: [
      'push',
      'pull_request',
      'installation',
      'installation_repositories',
    ],
    default_permissions: {
      contents: 'write',
      metadata: 'read',
      pull_requests: 'write',
      issues: 'read',
    },
    request_oauth_on_install: true,
  };

  return NextResponse.json(manifest);
}

// Handle GitHub App setup callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, installation_id, setup_action } = body;

    if (setup_action === 'install') {
      // Exchange code for access token
      const tokenResponse = await fetch(
        `https://github.com/login/oauth/access_token`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        // Store installation data
        return NextResponse.json({
          success: true,
          installation_id,
          redirect_url: '/dashboard/github/success',
        });
      }
    }

    return NextResponse.json(
      { error: 'Failed to setup GitHub App' },
      { status: 400 }
    );
  } catch (error) {
    console.error('GitHub App setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}