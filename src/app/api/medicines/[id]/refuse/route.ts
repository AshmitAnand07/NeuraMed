import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Medicine from '@/models/Medicine';
import Alert from '@/models/Alert';
import User from '@/models/User';
import FamilyMember from '@/models/FamilyMember';
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

        // 1. Find medicine
        const medicine = await Medicine.findOne({ _id: id, userId: decoded.id });
        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
        }

        // 2. Increment refusal count
        medicine.refusalCount = (medicine.refusalCount || 0) + 1;
        
        let alertCreated = false;

        // 3. Check if strikes reached limit (2 refusals)
        if (medicine.refusalCount >= 2) {
            medicine.isRefused = true;

            // Generate Critical Alert
            const user = await User.findById(decoded.id);
            
            // Determine who the alert is for
            const familyMemberName = medicine.familyMember || 'Self';
            
            // Find caretaker (usually the main user or whoever is assigned)
            let caretakerId = decoded.id; // Default to main user
            
            if (medicine.familyMemberId) {
                const fm = await FamilyMember.findById(medicine.familyMemberId);
                if (fm && fm.caretakerId) {
                    caretakerId = fm.caretakerId.toString();
                }
            }

            const currentHour = new Date().getHours();
            let timeSlot = 'Morning';
            if (currentHour >= 12 && currentHour < 17) timeSlot = 'Afternoon';
            else if (currentHour >= 17 && currentHour < 21) timeSlot = 'Evening';
            else if (currentHour >= 21 || currentHour < 6) timeSlot = 'Night';

            await Alert.create({
                patientId: decoded.id,
                caretakerId: caretakerId,
                medicineId: medicine._id,
                familyMemberId: (medicine.familyMemberId as any) || null,
                message: `CRITICAL: ${familyMemberName} refused ${medicine.name} (${timeSlot}) twice.`,
                type: 'critical'
            });

            alertCreated = true;
        }

        await medicine.save();

        const currentHourLog = new Date().getHours();
        let logTimeSlot = 'Morning';
        if (currentHourLog >= 12 && currentHourLog < 17) logTimeSlot = 'Afternoon';
        else if (currentHourLog >= 17 && currentHourLog < 21) logTimeSlot = 'Evening';
        else if (currentHourLog >= 21 || currentHourLog < 6) logTimeSlot = 'Night';

        await Log.create({
            userId: decoded.id,
            familyMemberId: medicine.familyMemberId || undefined,
            medicineId: medicine._id,
            medicineName: medicine.name,
            familyMemberName: medicine.familyMember || 'Self',
            actionTime: logTimeSlot,
            status: 'Refused'
        });

        return NextResponse.json({ medicine, alertCreated });
    } catch (error: any) {
        console.error('Medicine Refuse Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
