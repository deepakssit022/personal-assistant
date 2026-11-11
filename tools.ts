import { tool } from "@langchain/core/tools";
import z from 'zod';
import { google } from 'googleapis';
import tokens from './tokens.json'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);
oauth2Client.setCredentials(tokens)
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const getEventTool = tool(
    async () => {
        try {
            const response = await calendar.events.list({
                calendarId: 'deepak.sapient4@gmail.com'
            })
            console.log('response===>', response.data.items);

        } catch (err) {
            console.log('ERRRRRR', err)
        }
        return JSON.stringify([{ meeting: 'Deepak presentation', date: '2026-10-21', time: '10:00 AM', location: 'Google Meet' }]);

    },
    {
        name: 'get-events',
        description: 'Call this tool to get the calendar events',
        schema: z.object({
            'query': z.string().describe('The query to get the calendar events')
        })
    }
)

export const createEventTool = tool(
    async () => {
        return 'The meeting has been created.';
    },
    {
        name: 'create-event',
        description: 'Call this tool to create the calendar events',
        schema: z.object({
            'query': z.string().describe('The query to create the calendar event')
        })
    }
)

