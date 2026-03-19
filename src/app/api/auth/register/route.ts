import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Ngo from '@/models/Ngo';
import bcrypt from 'bcryptjs';

import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'ngo', 'admin']).optional().default('user'),
    pincode: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    verificationDocumentUrl: z.string().optional()
}).refine((data) => {
    if (data.role === 'ngo' && !data.verificationDocumentUrl) {
        return false;
    }
    return true;
}, {
    message: "Verification document is required for NGOs",
    path: ["verificationDocumentUrl"]
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parseResult = registerSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
        }

        const { name, email, password, role, pincode, address, phone, description, website, verificationDocumentUrl } = parseResult.data;

        await connectToDatabase();

        // Check if user exists in EITHER collection
        const existingUser = await User.findOne({ email });
        const existingNgo = await Ngo.findOne({ email });

        if (existingUser || existingNgo) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'ngo') {
            const newNgo = await Ngo.create({
                name,
                email,
                password: hashedPassword,
                role: 'ngo',
                pincode,
                address,
                phone,
                description,
                website,
                verificationDocumentUrl,
                isVerified: false
            });
            return NextResponse.json({ message: 'NGO registered successfully', userId: newNgo._id }, { status: 201 });
        } else {
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword,
                role: role || 'user', // Default to user
                pincode,
            });
            return NextResponse.json({ message: 'User registered successfully', userId: newUser._id }, { status: 201 });
        }

    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
