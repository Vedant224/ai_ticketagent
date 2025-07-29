import {
    Inngest
} from "inngest";
import dotenv from 'dotenv';

dotenv.config();

export const inngest = new Inngest({
    id: "ticketing-system",
    eventKey: process.env.INNGEST_EVENT_KEY,
    signing: {
        key: process.env.INNGEST_SIGNING_KEY
    },
    middleware: [
        // Add logging middleware to debug events
        async (ctx, next) => {
            console.log(`Processing event: ${ctx.event.name}`);
            await next();
            console.log(`Completed event: ${ctx.event.name}`);
        }
    ]
});
