import { tool } from "@langchain/core/tools";
import z from 'zod';

export const createEventTool = tool(
    async () => {
        return 'The meeting has been created.';
    },
    {
        name: 'create-event',
        description: 'Call this tool to create the calendar events',
        schema: z.object({})
    }
)

export const getEventTool = tool(
    async () => {
        return JSON.stringify([{ meeting: 'Deepak presentation', date: '2026-10-21', time: '10:00 AM', location: 'Google Meet' }]);
    },
    {
        name: 'get-events',
        description: 'Call this tool to get the calendar events',
        schema: z.object({})
    }
)