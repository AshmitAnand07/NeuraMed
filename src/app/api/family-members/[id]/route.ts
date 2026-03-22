import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import FamilyMember from '@/models/FamilyMember';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        const { id } = await params;

        await connectToDatabase();

        // Ensure user owns the member
        const member = await FamilyMember.findOne({ 
            _id: new mongoose.Types.ObjectId(id), 
            userId: new mongoose.Types.ObjectId(decoded.id) 
        });
        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Self-caretaker prevention
        if (caretakerModel === 'FamilyMember' && caretakerId === id) {
             return NextResponse.json({ error: 'Member cannot be their own caretaker' }, { status: 400 });
        }

        member.name = name || member.name;
        member.age = age ? Number(age) : member.age;
        member.relation = relation || member.relation;
        member.caretakerId = caretakerId || null;
        member.caretakerModel = caretakerModel || 'User';

        await member.save();

        return NextResponse.json(member);
    } catch (error: any) {
        console.error('Update Family Member Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params;

        await connectToDatabase();

        // 1. Delete the member
        const deletedMember = await FamilyMember.findOneAndDelete({ 
            _id: new mongoose.Types.ObjectId(id), 
            userId: new mongoose.Types.ObjectId(decoded.id) 
        });
        if (!deletedMember) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // 2. Cleanup: Remove this member as a caretaker for others
        await FamilyMember.updateMany(
            { caretakerId: id, caretakerModel: 'FamilyMember', userId: decoded.id },
            { $set: { caretakerId: null } }
        );

        return NextResponse.json({ message: 'Member removed successfully' });
    } catch (error: any) {
        console.error('Delete Family Member Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
