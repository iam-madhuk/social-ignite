import { NextResponse } from 'next/server';
import { postToLinkedIn } from '@/../lib/linkedin_poster';

export async function POST(request: Request) {
    const { text } = await request.json();

    if (!text) {
        return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    try {
        const result = await postToLinkedIn(text);
        if (result.success) {
            return NextResponse.json({ message: 'Posted successfully!' });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
