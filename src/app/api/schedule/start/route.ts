import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

let schedulerProcess: any = null;

export async function POST() {
    if (schedulerProcess) {
        return NextResponse.json({ message: 'Scheduler is already running.' });
    }

    const schedulerPath = path.join(process.cwd(), 'lib', 'scheduler.js');

    // Spawn a detached process to run the scheduler in the background
    schedulerProcess = spawn('node', [schedulerPath], {
        detached: true,
        stdio: 'ignore'
    });

    schedulerProcess.unref();

    console.log('LinkedIn Background Scheduler started.');

    return NextResponse.json({
        message: 'Daily 3 PM scheduler started successfully in the background!'
    });
}
