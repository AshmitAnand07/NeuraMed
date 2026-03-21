import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Medicine from '@/models/Medicine';
import { getVerifiedToken } from '@/lib/getVerifiedToken';

export async function GET(req: NextRequest) {
    try {
        const decoded = await getVerifiedToken(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        
        const meds = await Medicine.find({ userId: decoded.id }).sort({ createdAt: -1 });
        return NextResponse.json(meds);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const decoded = await getVerifiedToken(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { 
            name, 
            expiryDate, 
            manufacturingDate, 
            mrp, 
            category, 
            familyMember, 
            familyMemberId,
            quantityStrips,
            quantityTablets,
            dosage,
            time,
            frequency
        } = body;

        if (!name || !expiryDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();

        // Optional: Check if medicine with same name already exists to avoid duplicates
        const existingMedicine = await Medicine.findOne({
            userId: decoded.id,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            familyMemberId: familyMemberId || null
        });

        if (existingMedicine) {
            return NextResponse.json({ 
                status: 'duplicate_warning', 
                message: 'A medicine with this name already exists for this member.',
                existing: existingMedicine
            });
        }

        const newMedicine = await Medicine.create({
            userId: decoded.id,
            name,
            expiryDate: new Date(expiryDate),
            manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : undefined,
            mrp: mrp ? Number(mrp) : undefined,
            category,
            familyMember: familyMember || 'Self',
            familyMemberId: familyMemberId || null,
            quantityStrips: quantityStrips ? Number(quantityStrips) : 0,
            quantityTablets: quantityTablets ? Number(quantityTablets) : 0,
            dosage,
            time,
            frequency,
            status: 'safe'
        });

        return NextResponse.json(newMedicine, { status: 201 });
    } catch (error: any) {
        console.error('Medicine Add Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const decoded = await getVerifiedToken(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing medicine ID' }, { status: 400 });
        }

        await connectToDatabase();
        
        const deletedMedicine = await Medicine.findOneAndDelete({ 
            _id: id, 
            userId: decoded.id 
        });

        if (!deletedMedicine) {
            return NextResponse.json({ error: 'Medicine not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        console.error('Medicine Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
