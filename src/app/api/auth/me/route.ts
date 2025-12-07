import { auth } from '@app/server/auth/better-auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ session: null }, { status: 200 });
  }

  return NextResponse.json({ session });
}

