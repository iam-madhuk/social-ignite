const cron = require('node-cron');
const { generateTrendyPost } = require('./ai_content_generator');
const { postToLinkedIn } = require('./linkedin_poster');

console.log('LinkedIn Post Scheduler starting...');

// Schedule task for 3:00 PM every day (15:00)
// Format: minute hour day-of-month month day-of-week
cron.schedule('0 15 * * *', async () => {
    console.log(`[${new Date().toLocaleString()}] Running scheduled post job...`);

    try {
        const trendyContent = generateTrendyPost();
        console.log('Trendy content generated. Attempting to post...');

        const result = await postToLinkedIn(trendyContent);

        if (result.success) {
            console.log(`[${new Date().toLocaleString()}] Scheduled post published successfully!`);
        } else {
            console.error(`[${new Date().toLocaleString()}] Scheduled post failed: ${result.error}`);
        }
    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Error in scheduler:`, error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Setting to local timezone based on metadata
});

console.log('Job scheduled for 3:00 PM daily.');

// Optional: Run a test post if an argument is passed
if (process.argv.includes('--test-run')) {
    console.log('Running manual test post...');
    const trendyContent = generateTrendyPost();
    postToLinkedIn(trendyContent, process.argv.includes('--headful'));
}
