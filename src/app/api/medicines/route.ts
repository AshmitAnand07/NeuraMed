import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Medicine from '@/models/Medicine';
import Donation from '@/models/Donation';
import { verifyJWT } from '@/lib/auth';

// Helper to determine status based on expiry
// Safe > 3 months
// Expiring: < 3 months && > 0
// Expired: <= 0
// Actually the spec says:
// 6 months, 3 months, 1 month - reminders
// Status: Green (Safe), Yellow (Expiring Soon), Red (Expired)
function getStatus(expiryDate: Date): 'safe' | 'expiring' | 'expired' {
    const now = new Date();
    const diffTime = new Date(expiryDate).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'expired';
    if (diffDays <= 90) return 'expiring'; // 3 months
    return 'safe';
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();

        const medicines = await Medicine.find({ userId: String(payload.id) }).sort({ expiryDate: 1 });

        return NextResponse.json(medicines);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { z } from 'zod';

const medicineSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    expiryDate: z.string().or(z.date()),
    manufacturingDate: z.string().or(z.date()).optional(),
    mrp: z.union([z.number(), z.string()]).optional(),
    category: z.string().optional(),
    familyMember: z.string().optional(),
    quantityStrips: z.union([z.number(), z.string()]).optional(),
    quantityTablets: z.union([z.number(), z.string()]).optional(),
    forceAdd: z.boolean().optional()
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const parseResult = medicineSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
        }

        const { name, expiryDate, manufacturingDate, mrp, category, familyMember } = parseResult.data;

        await connectToDatabase();

        // INTELLIGENT DUPLICATE CHECK
        // Rule: Check case-insensitive name across ALL family members for this user.
        const existing = await Medicine.findOne({
            userId: String(payload.id),
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existing) {
            // Rule 3: If it's EXPIRED, delete and add fresh
            if (existing.status === 'expired') {
                await Medicine.findByIdAndDelete(existing._id);
                // Continue to create new medicine below
            } else {
                // Rule 2: SAFE or EXPIRING
                const existingStrips = existing.quantityStrips || 0;
                const newStrips = body.quantityStrips ? Number(body.quantityStrips) : 0;

                // Case A: More than 2 strips remaining
                if (existingStrips > 2) {
                    return NextResponse.json({
                        status: "duplicate_warning",
                        message: "You already have this medicine. Please avoid purchasing a new one."
                    });
                } 
                
                // Case B: 2 or fewer strips - Merge
                existing.quantityStrips = existingStrips + newStrips;
                if (body.quantityTablets) {
                    existing.quantityTablets = (existing.quantityTablets || 0) + Number(body.quantityTablets);
                }
                
                // Update expiry if new one is later? (Optional but good) - Spec didn't say, keeping old for now.
                await existing.save();

                return NextResponse.json({
                    status: "merged",
                    message: "Medicine already exists. Strips have been added to the existing record."
                });
            }
        }

        const expiry = new Date(expiryDate);
        const status = getStatus(expiry);

        const newMedicine = await Medicine.create({
            userId: String(payload.id),
            name,
            expiryDate: expiry,
            manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : undefined,
            mrp: mrp ? Number(mrp) : undefined,
            category,
            status, // Calculated initial status
            familyMember: familyMember || 'Self',
            quantityStrips: body.quantityStrips ? Number(body.quantityStrips) : 0,
            quantityTablets: body.quantityTablets ? Number(body.quantityTablets) : 0,
        });

        return NextResponse.json({
            status: existing ? "replaced" : "created",
            message: existing ? "Expired medicine removed and new medicine added." : "Medicine added successfully",
            data: newMedicine
        }, { status: 201 });
    } catch (error) {
        console.error('Medicine Create Error:', error);
        const msg = (error as Error).message || 'Internal Server Error';
        if (msg.includes('Cast to ObjectId failed') || msg.includes('[object Object]')) {
            return NextResponse.json({ error: 'Session expired/corrupted. Please Log Out and Log In again.' }, { status: 401 });
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Medicine ID required' }, { status: 400 });

        await connectToDatabase();

        const deleted = await Medicine.findOneAndDelete({ _id: id, userId: String(payload.id) });
        if (!deleted) return NextResponse.json({ error: 'Medicine not found or unauthorized' }, { status: 404 });

        // Cascade delete: Remove associated donation request
        await Donation.deleteMany({ medicineId: id });

        return NextResponse.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
