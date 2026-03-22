import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Log from '@/models/Log';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const decoded = token ? await verifyJWT(token) as any : null;

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const familyMemberId = searchParams.get('familyMemberId');

        await connectToDatabase();

        const query: any = { userId: decoded.id };
        
        if (familyMemberId === 'self') {
            query.familyMemberId = null;
        } else if (familyMemberId && familyMemberId !== 'all') {
            query.familyMemberId = familyMemberId;
        }

        const logs = await Log.find(query).sort({ createdAt: -1 }).lean();

        return NextResponse.json(logs);
    } catch (error: any) {
        console.error('Fetch Logs Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
