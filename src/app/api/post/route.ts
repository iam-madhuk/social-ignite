import { NextResponse } from 'next/server';
import { postToLinkedIn } from '@/../lib/linkedin_poster';

export async function POST(request: Request) {
    const { text, mediaPath, mediaType, isArticle } = await request.json();

    if (!text && !mediaPath) {
        return NextResponse.json({ error: 'Text or media is required' }, { status: 400 });
    }

    try {
        const result = await postToLinkedIn(text, { mediaPath, mediaType, isArticle });
        if (result.success) {
            return NextResponse.json({ message: 'Posted successfully!' });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
