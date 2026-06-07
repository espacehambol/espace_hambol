import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

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
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'menu');
    const absolutePath = path.join(uploadDir, fileName);

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(absolutePath, buffer);
    console.log(`Fichier sauvegardé: ${absolutePath}`);

    return NextResponse.json({ url: relativePath });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
