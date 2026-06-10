import { SessionOptions, getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export interface SessionData {
  userId: string
  email: string
  username: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'default-dev-secret-32-chars-minimum-x',
  cookieName: 'patch_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function getSessionFromReq(req: NextRequest, res: NextResponse) {
  return getIronSession<SessionData>(req, res, sessionOptions)
}
