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
    async (params) => {

        const { timeMin, timeMax, q } = params
        console.log('params===>', params)

        try {
            const response = await calendar.events.list({
                calendarId: 'deepak.sapient4@gmail.com',
                q: q,
                timeMin: timeMin,
                timeMax: timeMax
            })

            const events = response.data.items?.map(event => ({
                title: event.summary ?? 'No Title',
                description: event.description ?? '',
                location: event.location ?? '',
                start: event.start?.dateTime ?? event.start?.date ?? '',
                end: event.end?.dateTime ?? event.end?.date ?? '',
                organizer: event.organizer?.email ?? '',
                attendees: event.attendees?.map(a => a.email) ?? [],
                link: event.htmlLink ?? '',
                status: event.status ?? '',
            })) ?? [];

            return JSON.stringify(events);

        } catch (err) {
            console.error('Error fetching calendar events:', err);
            return JSON.stringify({ error: 'Failed to fetch calendar events' });
        }

    },
    {
        name: 'get-events',
        description: 'Call this tool to get the calendar events',
        schema: z.object({
            timeMin: z.string().optional().describe('The minimum time to get the calendar events'),
            timeMax: z.string().optional().describe('The maximum time to get the calendar events'),
            q: z.string().optional().describe('The query to search from the calendar events')
        })
    }
)

export const createEventTool = tool(
    async (eventData) => {
        const { summary, description, start, end, attendees } = eventData

        const response = await calendar.events.insert({
            calendarId: 'primary',
            sendUpdates: 'all',
            requestBody: {
                summary,
                description,
                start,
                end,
                attendees
            },
        })

        console.log("response =====>", response)

        return 'The meeting has been created.';
    },
    {
        name: 'create-event',
        description: 'Call this tool to create the calendar events',
        schema: z.object({
            summary: z.string().describe('Title of the event'),
            description: z.string().optional().describe('Description of the event'),
            start: z.object({
                dateTime: z.string().describe('Start date and time in UTC e.g. 2026-11-13T10:00:00Z'),
                timeZone: z.string().optional().default('UTC').describe('Timezone e.g. UTC'),
            }).describe('Start time of the event'),
            end: z.object({
                dateTime: z.string().describe('End date and time in UTC e.g. 2026-11-13T11:00:00Z'),
                timeZone: z.string().optional().default('UTC').describe('Timezone e.g. UTC'),
            }).describe('End time of the event'),
            attendees: z.array(z.object({
                email: z.string().describe('Email address of the attendee'),
            })).optional().describe('List of attendees'),
        })
    }
)

