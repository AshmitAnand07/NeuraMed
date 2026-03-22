import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Medicine from '@/models/Medicine';
import Log from '@/models/Log';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const decoded = token ? await verifyJWT(token) as any : null;

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectToDatabase();

        const medicine = await Medicine.findOne({ _id: id, userId: decoded.id });
        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
        }

        medicine.lastTakenDate = new Date();
        medicine.refusalCount = 0;
        medicine.isRefused = false;

        await medicine.save();

        const currentHour = new Date().getHours();
        let timeSlot = 'Morning';
        if (currentHour >= 12 && currentHour < 17) timeSlot = 'Afternoon';
        else if (currentHour >= 17 && currentHour < 21) timeSlot = 'Evening';
        else if (currentHour >= 21 || currentHour < 6) timeSlot = 'Night';

        await Log.create({
            userId: decoded.id,
            familyMemberId: medicine.familyMemberId || undefined,
            medicineId: medicine._id,
            medicineName: medicine.name,
            familyMemberName: medicine.familyMember || 'Self',
            actionTime: timeSlot,
            status: 'Taken'
        });

        return NextResponse.json(medicine);
    } catch (error: any) {
        console.error('Medicine Take Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
