import { NextResponse } from 'next/server';

/**
 * Checks request headers to verify if the client has the required position.
 * Returns { authorized: true } or { authorized: false, response: NextResponse }
 */
export function authorize(req: Request, allowedPositions: string[]) {
  const role = req.headers.get('x-user-role');
  const position = req.headers.get('x-user-position');

  // If credentials are not provided (e.g., initial loading, script calls, or missing headers)
  if (!role || !position) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Entêtes d\'authentification manquantes. Accès refusé.' },
        { status: 401 }
      )
    };
  }

  // SUPER_ADMIN and Direction (ADMIN) have master access to everything
  if (role === 'SUPER_ADMIN' || position === 'SUPER_ADMIN' || position === 'ADMIN') {
    return { authorized: true };
  }

  // Check if position is explicitly allowed
  if (allowedPositions.includes(position)) {
    return { authorized: true };
  }

  // Otherwise, block the request
  return {
    authorized: false,
    response: NextResponse.json(
      { error: 'Accès non autorisé. Droits insuffisants.' },
      { status: 403 }
    )
  };
}
