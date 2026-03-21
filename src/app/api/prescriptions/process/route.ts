import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectToDatabase from '@/lib/db';
import Medicine from '@/models/Medicine';
import { verifyJWT } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const image = formData.get('image') as File;
        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await image.arrayBuffer());
        const base64Image = buffer.toString('base64');
        const mimeType = image.type;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });

        const prompt = `You are an expert medical AI specializing in analyzing prescriptions.
        Extract the following information for each medicine found in the prescription image:
        - "medicine": Name of the medicine
        - "dosage": Dosage strength (e.g., 500mg)
        - "time": When to take it (Morning, Afternoon, Evening, Night)
        - "frequency": How often to take it (e.g., Once daily, Twice daily)
        - "duration": Duration of the prescription if specified.

        Return ONLY a strictly valid JSON array of objects, with no markdown formatting around it. E.g:
        [
          {
            "medicine": "Paracetamol",
            "dosage": "500mg",
            "time": "Morning",
            "frequency": "Once daily"
          }
        ]
        If you find nothing, return an empty array [].`;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Clean up markdown block if present
        let cleanJsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Ensure we parse array
        let extractedMedicines: any[] = [];
        try {
            extractedMedicines = JSON.parse(cleanJsonStr);
        } catch (err) {
            console.error('Failed to parse Gemini output:', cleanJsonStr);
            return NextResponse.json({ error: 'Failed to parse AI output', raw: cleanJsonStr }, { status: 500 });
        }

        await connectToDatabase();

        const savedMedicines = [];

        for (const med of extractedMedicines) {
            if (!med.medicine) continue;

            const newMed = await Medicine.create({
                userId: String(payload.id),
                name: med.medicine,
                dosage: med.dosage || '',
                time: med.time || '',
                frequency: med.frequency || '',
                status: 'safe',
                familyMember: 'Self',
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // default to 1 yr expiry
                quantityStrips: 1,
            });

            savedMedicines.push(newMed);
        }

        return NextResponse.json({
            message: 'Prescription processed successfully',
            data: savedMedicines,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Prescription Process Error:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error',
            details: error?.message || String(error)
        }, { status: 500 });
    }
}
