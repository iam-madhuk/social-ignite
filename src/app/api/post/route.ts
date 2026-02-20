import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { postToLinkedIn } from '@/../lib/linkedin_poster';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get('content-type') || '';
        let text = '';
        let mediaPath = '';
        let mediaType = '';
        let isArticle = false;

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            text = formData.get('text') as string || '';
            isArticle = formData.get('isArticle') === 'true';

            const file = formData.get('file') as File;
            if (file) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Save to a temporary location
                const uploadDir = join(process.cwd(), 'tmp', 'uploads');
                await mkdir(uploadDir, { recursive: true });

                const fileName = `${Date.now()}-${file.name}`;
                mediaPath = join(uploadDir, fileName);
                await writeFile(mediaPath, buffer);
                mediaType = file.type.split('/')[0]; // image, video, or application (for docs)
                if (file.type.includes('pdf')) mediaType = 'pdf';
            }
        } else {
            const body = await request.json();
            text = body.text;
            mediaPath = body.mediaPath;
            mediaType = body.mediaType;
            isArticle = body.isArticle;
        }

        if (!text && !mediaPath) {
            return NextResponse.json({ error: 'Text or media is required' }, { status: 400 });
        }

        const result = await postToLinkedIn(text, { mediaPath, mediaType, isArticle });

        if (result.success) {
            return NextResponse.json({ message: 'Posted successfully!' });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
