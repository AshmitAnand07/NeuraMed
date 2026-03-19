import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/ocr';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using Google Cloud Vision
    const text = await extractTextFromImage(buffer);

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error('API /api/ocr error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
