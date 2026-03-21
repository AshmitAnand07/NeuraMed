import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Ngo from '@/models/Ngo';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/lib/auth';

import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parseResult = loginSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
        }

        const { email, password } = parseResult.data;

        await connectToDatabase();

        let user: any = await User.findOne({ email });
        let isNgo = false;

        if (!user) {
            user = await Ngo.findOne({ email });
            isNgo = true;
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT
        const token = await signJWT({
            id: user._id.toString(),
            email: user.email,
            role: user.role, // 'ngo' or 'user'/'admin'
            name: user.name,
            pincode: user.pincode
        });

        const response = NextResponse.json({
            message: 'Login successful',
            token,   // ← return token in body for localStorage storage
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                pincode: user.pincode
            }
        });

        // Set cookie for middleware access
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Improved compatibility for mobile redirects
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
