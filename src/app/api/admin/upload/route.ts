import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nom de fichier unique
    const uniqueId = Date.now();
    const extension = path.extname(file.name) || '.png';
    const fileName = `item_${uniqueId}${extension}`;
    
    const relativePath = `/uploads/menu/${fileName}`;
    const absolutePath = path.join(process.cwd(), 'public', 'uploads', 'menu', fileName);

    await writeFile(absolutePath, buffer);
    console.log(`Fichier sauvegardé: ${absolutePath}`);

    return NextResponse.json({ url: relativePath });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
