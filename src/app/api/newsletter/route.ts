import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let email: string | undefined;

  try {
    const body = await request.json();
    email = body?.email;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de requête invalide.' },
      { status: 400 }
    );
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json(
      { success: false, error: 'Adresse email invalide.' },
      { status: 400 }
    );
  }

  const trimmedEmail = email.trim();

  // Toujours confirmer l'inscription à l'utilisateur immédiatement
  // Resend est appelé en "fire and forget" – ses erreurs ne bloquent pas l'UX
  const resendApiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (resendApiKey && audienceId) {
    // Appel Resend non-bloquant : on n'attend pas le résultat pour répondre
    fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmedEmail, unsubscribed: false }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          console.error('[Newsletter] Resend error:', res.status, body);
        } else {
          console.log('[Newsletter] Resend: contact ajouté —', trimmedEmail);
        }
      })
      .catch((err) => {
        console.error('[Newsletter] Resend fetch error:', err);
      });
  } else {
    console.log('[Newsletter] Inscription enregistrée (Resend non configuré) :', trimmedEmail);
  }

  // Réponse immédiate au client — indépendante du résultat Resend
  return NextResponse.json({ success: true });
}
