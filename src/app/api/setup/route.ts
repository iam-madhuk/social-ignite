import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST() {
    const scriptPath = path.join(process.cwd(), 'lib', 'linkedin_poster.js');

    console.log('Spawning initial login setup...');

    // We use spawn instead of exec for better real-time handling
    const processChild = exec(`node "${scriptPath}" "Initial Login Setup" --headful`, (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
            console.error(`[SETUP_ERROR] ${error.message}`);
            return;
        }
        console.log(`[SETUP_STDOUT] ${stdout}`);
        console.error(`[SETUP_STDERR] ${stderr}`);
    });

    return NextResponse.json({
        message: 'Login process started. If a window doesn\'t appear, please check your terminal and run the command manually: node lib/linkedin_poster.js "Initial Login" --headful'
    });
}
