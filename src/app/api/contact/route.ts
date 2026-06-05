import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, site } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    // Send via Resend if API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const recipientEmail =
        site === 'Azaguié'
          ? (process.env.CONTACT_EMAIL_AZAGUIE || 'azaguie@espacehambol.com')
          : (process.env.CONTACT_EMAIL_YOPOUGON || 'yopougon@espacehambol.com');

      const subjectLabels: Record<string, string> = {
        reservation: 'Demande de Réservation',
        event: "Organisation d'Événement",
        concierge: 'Service Conciergerie',
        other: 'Autre demande',
      };

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Espace Hambol <${process.env.MAIL_FROM || 'commercial@espacehambol.com'}>`,
          to: [recipientEmail],
          reply_to: email,
          subject: `[${site}] ${subjectLabels[subject] || subject} — ${name}`,
          html: `
            <div style="font-family: 'Nunito Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFBF7; padding: 40px; border-radius: 16px;">
              <h2 style="color: #8B3A1A; font-size: 24px; margin-bottom: 8px;">Nouveau message — Espace Hambol ${site}</h2>
              <hr style="border: 1px solid #D4956A33; margin-bottom: 24px;" />
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6B5C4E; font-weight: bold; width: 140px;">Nom :</td>
                  <td style="padding: 8px 0; color: #1A1208;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B5C4E; font-weight: bold;">Email :</td>
                  <td style="padding: 8px 0; color: #1A1208;"><a href="mailto:${email}" style="color: #8B3A1A;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B5C4E; font-weight: bold;">Objet :</td>
                  <td style="padding: 8px 0; color: #1A1208;">${subjectLabels[subject] || subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B5C4E; font-weight: bold; vertical-align: top;">Message :</td>
                  <td style="padding: 8px 0; color: #1A1208; white-space: pre-wrap;">${message}</td>
                </tr>
              </table>
              <hr style="border: 1px solid #D4956A33; margin-top: 24px;" />
              <p style="color: #6B5C4E; font-size: 12px; text-align: center; margin-top: 16px;">
                Message reçu via le formulaire de contact — espacehambol.com
              </p>
            </div>
          `,
        }),
      });
    } else {
      // Log to console in development if Resend not configured
      console.log('[Contact Form] Message received (Resend not configured):', {
        name, email, subject, message, site,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contact API]', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
