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
    }
});
