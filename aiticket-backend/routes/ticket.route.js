import express from "express";
import {
    authenticate
} from "../middlewares/auth.js";
import { createTicket, getTicket, getTickets } from "../controllers/ticket.controller.js";


const router = express.Router();

router.get("/get-tickets", authenticate, getTickets);
router.get("/get-ticket/:id", authenticate, getTicket);
router.post("/create-ticket", authenticate, createTicket);

export default router;