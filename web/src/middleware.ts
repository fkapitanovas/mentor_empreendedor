import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|manifest.webmanifest|icon|apple-icon|opengraph-image|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico)$).*)',
  ],
}
