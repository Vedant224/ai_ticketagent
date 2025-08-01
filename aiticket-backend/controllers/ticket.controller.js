import {
    inngest
} from "../inngest/client.js";
import Ticket from "../models/ticket.model.js";

export const createTicket = async (req, res, next) => {
    try {
        const {
            title,
            description
        } = req.body;
        if (!title || !description) {
            return res
                .status(400)
                .json({
                    message: "Title and description are required"
                });
        }
        const newTicket = Ticket.create({
            title,
            description,
            createdBy: req.user._id.toString(),
        });

        await inngest.send({
            name: "ticket/created",
            data: {
                ticketId: (await newTicket)._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString(),
            },
        });
        return res.status(201).json({
            message: "Ticket created and processing started",
            ticket: newTicket,
        });
    } catch (error) {
        next(error);
    }
};

export const getTickets = async (req, res, next) => {
    try {
        const user = req.user;
        let tickets = [];
        if (user.role !== "user") {
            tickets = await Ticket.find({})
                .populate("assignedTo", ["email", "_id"])
                .sort({
                    createdAt: -1
                });
        } else {
            tickets = await Ticket.find({
                    createdBy: user._id
                })
                .select("title description status createdAt")
                .sort({
                    createdAt: -1
                });
        }
        return res.status(200).json(tickets);
    } catch (error) {
        next(error);
    }
};

export const getTicket = async (req, res, next) => {
    try {
        const user = req.user;
        let ticket;
        const { id } = req.params;
        if (user.role !== "user") {
            ticket = await Ticket.findById(id)
                .populate("assignedTo", ["email", "_id"])
                .populate("createdBy", ["email", "_id"]);
        } else {
            ticket = await Ticket.findOne({
                createdBy: user._id,
                _id: id,
            })
            .select("title description status createdAt")
            .populate("createdBy", ["email", "_id"]);
        }

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }
        return res.status(200).json({
            ticket
        });
    } catch (error) {
        next(error);
    }
};