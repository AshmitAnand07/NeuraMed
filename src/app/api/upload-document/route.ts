import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Only PDF, PNG, and JPG files up to 10MB are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Only PDF, PNG, and JPG files up to 10MB are allowed.' },
                { status: 400 }
            );
        }

        // Create a unique filename
        const timestamp = Date.now();
        const uniqueFilename = `ngo-documents/${timestamp}-${file.name.replace(/\s+/g, '_')}`;

        // Upload to Vercel Blob
        const blob = await put(uniqueFilename, file, {
            access: 'public',
        });

        return NextResponse.json({ documentUrl: blob.url });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }
}
