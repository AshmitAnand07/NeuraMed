import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Donation from '@/models/Donation';
import Medicine from '@/models/Medicine';
import { verifyJWT } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();

        if (payload.role === 'ngo') {
            // NGO sees pending donations in their pincode
            // Assuming payload has pincode. If not, fetch user?
            // For now, use pincode from payload if available, else fetch user.
            // We stored pincode in token payload in login route.
            if (!payload.pincode) {
                return NextResponse.json({ error: 'NGO location not found' }, { status: 400 });
            }

            const donations = await Donation.find({
                pincode: payload.pincode as string,
                status: 'pending'
            }).populate('medicineId').populate('donorId', 'name email phone');

            return NextResponse.json(donations.filter((d: any) => d.medicineId));
        } else {
            // Users see their own donations
            const donations = await Donation.find({ donorId: payload.id as string }).sort({ requestedAt: -1 }).populate('medicineId');
            return NextResponse.json(donations.filter((d: any) => d.medicineId));
        }
    } catch (error) {
        console.error('Donations GET Error:', (error as Error).message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { medicineId, ngoName, pickupAddress, pickupDate, phone, donateStrips, donateTablets } = await req.json();

        await connectToDatabase();

        // Verify medicine ownership and status
        const medicine = await Medicine.findOne({ _id: medicineId, userId: payload.id as string }) as any;
        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
        }

        if (medicine.status === 'expired') {
            return NextResponse.json({ error: 'Cannot donate expired medicine' }, { status: 400 });
        }

        // Check if already fully donated
        const remainingStripsCheck = (medicine.quantityStrips || 0) - (medicine.donatedStrips || 0);
        const remainingTabletsCheck = (medicine.quantityTablets || 0) - (medicine.donatedTablets || 0);
        
        if (remainingStripsCheck <= 0 && remainingTabletsCheck <= 0 && medicine.isDonated) {
            return NextResponse.json({ error: 'Already fully donated' }, { status: 400 });
        }

        // Validate requested amount
        const reqStrips = Number(donateStrips) || 0;
        const reqTablets = Number(donateTablets) || 0;

        if (reqStrips > remainingStripsCheck) {
            return NextResponse.json({ error: `Cannot donate ${reqStrips} strips. Only ${remainingStripsCheck} remaining.` }, { status: 400 });
        }
        if (reqTablets > remainingTabletsCheck) {
            return NextResponse.json({ error: `Cannot donate ${reqTablets} tablets. Only ${remainingTabletsCheck} remaining.` }, { status: 400 });
        }

        if (reqStrips === 0 && reqTablets === 0) {
            return NextResponse.json({ error: 'Please specify a quantity to donate' }, { status: 400 });
        }

        // Create Donation
        const donation = await Donation.create({
            medicineId,
            donorId: payload.id as string,
            pincode: payload.pincode as string,
            status: 'pending',
            ngoName,
            pickupAddress,
            pickupDate,
            phone,
            quantityStrips: reqStrips,
            quantityTablets: reqTablets
        });

        // Update Medicine status
        medicine.donatedStrips = (medicine.donatedStrips || 0) + reqStrips;
        medicine.donatedTablets = (medicine.donatedTablets || 0) + reqTablets;

        const updatedRemainingStrips = (medicine.quantityStrips || 0) - medicine.donatedStrips;
        const updatedRemainingTablets = (medicine.quantityTablets || 0) - medicine.donatedTablets;

        if (updatedRemainingStrips <= 0 && updatedRemainingTablets <= 0) {
            medicine.isDonated = true;
        }

        await medicine.save();

        return NextResponse.json(donation, { status: 201 });
    } catch (error) {
        console.error('Donation POST Error:', (error as Error).message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Donation ID required' }, { status: 400 });

        await connectToDatabase();

        const donation = await Donation.findOne({ _id: id, donorId: payload.id as string, status: 'pending' });
        if (!donation) {
            return NextResponse.json({ error: 'Donation not found or cannot be cancelled' }, { status: 404 });
        }

        const medicine = await Medicine.findById(donation.medicineId) as any;
        if (medicine) {
            medicine.donatedStrips = Math.max(0, (medicine.donatedStrips || 0) - (donation.quantityStrips || 0));
            medicine.donatedTablets = Math.max(0, (medicine.donatedTablets || 0) - (donation.quantityTablets || 0));
            medicine.isDonated = false; // Restore visibility flag just in case
            await medicine.save();
        }

        await Donation.findByIdAndDelete(donation._id);

        return NextResponse.json({ message: 'Donation cancelled safely' });
    } catch (error) {
        console.error("Cancel Donation Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
