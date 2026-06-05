import prisma from './prisma';

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.MAIL_FROM || 'reservation@espacehambol.com';

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Espace Hambol <${fromEmail}>`,
          to: [to],
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Email Service] Failed to send email to ${to}:`, res.status, errText);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`[Email Service] Error sending email to ${to}:`, error);
      return false;
    }
  } else {
    console.log(`[Email Service] (Resend not configured) Mock Send to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Body:\n${html}`);
    return true;
  }
}

async function getFullReservation(id: string) {
  return await prisma.reservation.findUnique({
    where: { id },
    include: {
      client: true,
      room: {
        include: {
          site: true,
          roomType: true,
        }
      }
    }
  });
}

export async function sendReservationRequestEmail(reservationId: string) {
  const reservation = await getFullReservation(reservationId);
  if (!reservation || !reservation.client.email) return;

  const clientName = reservation.client.name || 'Client';
  const siteName = reservation.room.site.name;
  const roomNumber = reservation.room.number;
  const roomType = reservation.room.roomType.name;
  const checkIn = new Date(reservation.checkIn).toLocaleDateString('fr-FR');
  const checkOut = new Date(reservation.checkOut).toLocaleDateString('fr-FR');
  const totalPrice = reservation.totalPrice.toLocaleString('fr-FR');
  const primaryColor = siteName.toLowerCase().includes('yopougon') ? '#8B3A1A' : '#1B4332';
  const bgLight = siteName.toLowerCase().includes('yopougon') ? '#FDFBF7' : '#F4FAF6';

  const subject = `[Espace Hambol] Confirmation de votre demande de réservation - Ch. ${roomNumber}`;

  const html = `
    <div style="font-family: 'Nunito Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: ${bgLight}; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.05); color: #1A1208;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${primaryColor}; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; margin: 0;">Espace Hambol</h1>
        <p style="color: #6B5C4E; font-size: 14px; margin: 5px 0 0 0;">${siteName}</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); margin-bottom: 30px;">
        <h2 style="color: ${primaryColor}; font-size: 18px; margin-top: 0; margin-bottom: 20px;">Bonjour ${clientName},</h2>
        <p style="line-height: 1.6; font-size: 14px; color: #6B5C4E;">
          Nous avons bien reçu votre demande de réservation pour notre établissement à <strong>${siteName}</strong>. Notre équipe est en train de la traiter.
        </p>
        <p style="line-height: 1.6; font-size: 14px; color: #6B5C4E;">
          Vous recevrez un autre e-mail dès que votre réservation aura été confirmée par notre réception.
        </p>
        
        <div style="background: ${bgLight}; padding: 20px; border-radius: 12px; margin: 25px 0;">
          <h3 style="color: ${primaryColor}; font-size: 14px; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em;">Détails de votre séjour :</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6B5C4E; font-weight: bold;">Chambre :</td>
              <td style="padding: 6px 0; font-weight: bold; color: #1A1208;">Chambre ${roomNumber} (${roomType})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6B5C4E;">Arrivée :</td>
              <td style="padding: 6px 0; color: #1A1208;">${checkIn} (Check-in)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6B5C4E;">Départ :</td>
              <td style="padding: 6px 0; color: #1A1208;">${checkOut} (Check-out)</td>
            </tr>
            <tr style="border-top: 1px solid rgba(0,0,0,0.05);">
              <td style="padding: 12px 0 0 0; color: #6B5C4E; font-weight: bold; font-size: 15px;">Montant Total :</td>
              <td style="padding: 12px 0 0 0; font-weight: bold; color: ${primaryColor}; font-size: 16px;">${totalPrice} FCFA</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div style="text-align: center; font-size: 12px; color: #9A8E82; line-height: 1.5;">
        <p style="margin: 0 0 10px 0;">Des questions ? Contactez-nous ou répondez directement à cet e-mail.</p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Espace Hambol. Tous droits réservés.</p>
      </div>
    </div>
  `;

  await sendEmail({ to: reservation.client.email, subject, html });
}

export async function sendReservationStatusEmail(reservationId: string) {
  const reservation = await getFullReservation(reservationId);
  if (!reservation || !reservation.client.email) return;

  const clientName = reservation.client.name || 'Client';
  const siteName = reservation.room.site.name;
  const roomNumber = reservation.room.number;
  const roomType = reservation.room.roomType.name;
  const checkIn = new Date(reservation.checkIn).toLocaleDateString('fr-FR');
  const checkOut = new Date(reservation.checkOut).toLocaleDateString('fr-FR');
  const totalPrice = reservation.totalPrice.toLocaleString('fr-FR');
  const primaryColor = siteName.toLowerCase().includes('yopougon') ? '#8B3A1A' : '#1B4332';
  const bgLight = siteName.toLowerCase().includes('yopougon') ? '#FDFBF7' : '#F4FAF6';

  let subject = '';
  let statusTitle = '';
  let statusMessage = '';

  if (reservation.status === 'CONFIRMED') {
    subject = `[Espace Hambol] Réservation confirmée ! - Ch. ${roomNumber}`;
    statusTitle = 'Votre réservation est confirmée !';
    statusMessage = `Nous sommes ravis de vous informer que votre demande de réservation pour notre établissement à <strong>${siteName}</strong> a été acceptée et confirmée. Notre équipe se réjouit de vous accueillir pour votre séjour.`;
  } else if (reservation.status === 'CANCELLED') {
    subject = `[Espace Hambol] Annulation de votre réservation - Ch. ${roomNumber}`;
    statusTitle = 'Votre réservation a été annulée';
    statusMessage = `Nous vous informons que votre réservation pour notre établissement à <strong>${siteName}</strong> a été annulée. Si vous estimez qu'il s'agit d'une erreur ou si vous souhaitez effectuer une autre demande, n'hésitez pas à nous contacter.`;
  } else {
    return;
  }

  const html = `
    <div style="font-family: 'Nunito Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: ${bgLight}; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.05); color: #1A1208;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${primaryColor}; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; margin: 0;">Espace Hambol</h1>
        <p style="color: #6B5C4E; font-size: 14px; margin: 5px 0 0 0;">${siteName}</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); margin-bottom: 30px;">
        <h2 style="color: ${reservation.status === 'CONFIRMED' ? '#2E7D32' : '#C62828'}; font-size: 18px; margin-top: 0; margin-bottom: 20px; text-align: center;">
          ${statusTitle}
        </h2>
        <p style="line-height: 1.6; font-size: 14px; color: #6B5C4E; text-align: center; margin-bottom: 25px;">
          Bonjour ${clientName},
        </p>
        <p style="line-height: 1.6; font-size: 14px; color: #6B5C4E;">
          ${statusMessage}
        </p>
        
        <div style="background: ${bgLight}; padding: 20px; border-radius: 12px; margin: 25px 0;">
          <h3 style="color: ${primaryColor}; font-size: 14px; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em;">Récapitulatif de la Réservation :</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6B5C4E; font-weight: bold;">Référence :</td>
              <td style="padding: 6px 0; font-weight: bold; color: #1A1208;">#${reservation.id.slice(-6).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6B5C4E; font-weight: bold;">Chambre :</td>
              <td style="padding: 6px 0; font-weight: bold; color: #1A1208;">Chambre ${roomNumber} (${roomType})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6B5C4E;">Arrivée :</td>
              <td style="padding: 6px 0; color: #1A1208;">${checkIn}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6B5C4E;">Départ :</td>
              <td style="padding: 6px 0; color: #1A1208;">${checkOut}</td>
            </tr>
            <tr style="border-top: 1px solid rgba(0,0,0,0.05);">
              <td style="padding: 12px 0 0 0; color: #6B5C4E; font-weight: bold; font-size: 15px;">Montant Total :</td>
              <td style="padding: 12px 0 0 0; font-weight: bold; color: ${primaryColor}; font-size: 16px;">${totalPrice} FCFA</td>
            </tr>
          </table>
        </div>
        
        ${reservation.status === 'CONFIRMED' ? `
        <div style="text-align: center; margin-top: 25px;">
          <p style="font-size: 13px; color: #6B5C4E; margin-bottom: 15px;">Afin de faciliter votre arrivée, veuillez effectuer votre pré-enregistrement (KYC) en ligne.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://espacehambol.com'}/client/checkin?resId=${reservation.id}" 
             style="display: inline-block; background: ${primaryColor}; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            Pré-enregistrement (KYC)
          </a>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; font-size: 12px; color: #9A8E82; line-height: 1.5;">
        <p style="margin: 0 0 10px 0;">Des questions ? Contactez-nous ou répondez directement à cet e-mail.</p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Espace Hambol. Tous droits réservés.</p>
      </div>
    </div>
  `;

  await sendEmail({ to: reservation.client.email, subject, html });
}
