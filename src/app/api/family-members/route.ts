import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import FamilyMember from '@/models/FamilyMember';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        let token: string | undefined;
        const cookieStore = await cookies();
        token = cookieStore.get('token')?.value;

        if (!token) {
            const authHeader = req.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.slice(7);
            }
        }

        const decoded = token ? await verifyJWT(token) as any : null;

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        
        const userId = new mongoose.Types.ObjectId(decoded.id);
        const members = await FamilyMember.find({ userId })
            .populate({
                path: 'caretakerId',
                select: 'name email phone'
            })
            .sort({ createdAt: -1 });

        return NextResponse.json(members);
    } catch (error: any) {
        console.error('Family Members Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        let token: string | undefined;
        const cookieStore = await cookies();
        token = cookieStore.get('token')?.value;

        if (!token) {
            const authHeader = req.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.slice(7);
            }
        }

        const decoded = token ? await verifyJWT(token) as any : null;

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, age, relation, caretakerId, caretakerModel } = await req.json();

        if (!name || !age || !relation) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();

        const newMember = await FamilyMember.create({
            userId: new mongoose.Types.ObjectId(decoded.id),
            name,
            age: Number(age),
            relation,
            caretakerId: caretakerId || null,
            caretakerModel: caretakerModel || 'User'
        });

        return NextResponse.json(newMember, { status: 201 });
    } catch (error: any) {
        console.error('Add Family Member Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
