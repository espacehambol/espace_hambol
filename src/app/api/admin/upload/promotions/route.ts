import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    
    // Determine mime type (default to image/jpeg if not found)
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    console.log(`[promo-upload] Converted file ${file.name} to Base64 data URL`);
    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error('[promo-upload] Error:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload", detail: String(error) },
      { status: 500 }
    );
  }
}
