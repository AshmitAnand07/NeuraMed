import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { medicineName } = await req.json();

        if (!medicineName) {
            return NextResponse.json({ error: 'Medicine name is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

        const prompt = `Explain how to safely dispose of the medicine: ${medicineName}. Provide safe household disposal steps. Return the response as a JSON array of strings under the key "instructions". No other text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean up the response to ensure it's valid JSON
        const jsonText = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(jsonText);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Disposal API Error:', error);
        return NextResponse.json({ 
            instructions: [
                "Do not flush medicines down the toilet unless instructed.",
                "Mix the medicine with undesirable material like coffee grounds or dirt.",
                "Place the mixture in a sealed bag before throwing in the trash.",
                "Remove personal information from the packaging."
            ]
        });
    }
}
