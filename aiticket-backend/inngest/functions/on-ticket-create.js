import {
    inngest
} from "../client.js";
import Ticket from "../../models/ticket.model.js";
import User from "../../models/user.model.js";
import {
    NonRetriableError
} from "inngest";
import {
    sendMail
} from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction({
        id: "on-ticket-created",
        retries: 2
    }, {
        event: "ticket/created"
    },
    async ({
        event,
        step
    }) => {
        try {
            // Initial logging
            await step.run("function-start", async () => {
                return {
                    message: "Starting ticket processing",
                    timestamp: new Date().toISOString()
                };
            });

            const {
                ticketId
            } = event.data;
            
            // Log the incoming event data
            await step.run("log-event", async () => {
                return { 
                    phase: "event-received",
                    ticketId, 
                    eventData: event.data,
                    timestamp: new Date().toISOString()
                };
            });

            // MongoDB connection check
            await step.run("check-db-connection", async () => {
                return {
                    phase: "db-connection",
                    connected: Ticket.db.readyState === 1,
                    timestamp: new Date().toISOString()
                };
            });

            const ticketData = await step.run("fetch-ticket", async () => {
                const ticketObject = await Ticket.findById(ticketId)
                if (!ticketObject) {
                    throw new NonRetriableError("Ticket not found");
                }
                return {
                    phase: "ticket-fetched",
                    ticket: ticketObject,
                    timestamp: new Date().toISOString()
                };
            })
            const ticket = ticketData.ticket;
            
            await step.run("update-ticket-status", async () => {
                await Ticket.findByIdAndUpdate(ticket._id, {
                    status: "TODO"
                })
            })
            await step.run("pre-ai-check", async () => {
                return {
                    phase: "pre-ai",
                    geminiKey: !!process.env.GEMINI_API_KEY,
                    timestamp: new Date().toISOString()
                };
            });

            const aiResponse = await analyzeTicket(ticket)
            const aiResponseString = JSON.stringify(aiResponse);
            
            await step.run("log-ai-response", async () => {
                return {
                    phase: "ai-response",
                    response: aiResponseString,
                    timestamp: new Date().toISOString()
                };
            });
            
            const relatedSkills = await step.run("ai-processing", async () => {
                let skills = []
                if (aiResponse) {
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority: !["low", "medium", "high"].
                        includes(aiResponse.priority) ? "medium" : aiResponse.priority,
                        helpfulNotes: aiResponse.helpfulNotes,
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills
                    })
                    skills = aiResponse.relatedSkills
                }
                return skills
            })

            const moderator = await step.run("assign-moderator",
                async () => {
                    const moderators = await User.find({ role: "moderator" });
                    let bestMatch = null;
                    let maxMatches = 0;
                    for (const mod of moderators) {
                        if (Array.isArray(mod.skills)) {
                            const matches = mod.skills.filter(skill =>
                                relatedSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
                            ).length;
                            if (matches > maxMatches) {
                                maxMatches = matches;
                                bestMatch = mod;
                            }
                        }
                    }
                    let user = bestMatch;
                    if (!user) {
                        user = await User.findOne({ role: "admin" });
                    }
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        assignedTo: user?._id || null,
                    });
                    return user;
                });

            await step.run("send-email-notification", async () => {
                if (moderator) {
                    const finalTicket = await Ticket.findById(ticket._id)
                    await sendMail(
                        moderator.email,
                        "Ticket Assigned",
                        `A new ticket is assigned to you ${finalTicket.title}`
                    )
                }
            })

            return {
                success: true
            }

        } catch (error) {
            // Enhanced error logging
            const errorDetails = {
                message: error.message,
                stack: error.stack,
                phase: error.step || 'unknown',
                ticketId: event.data?.ticketId,
                timestamp: new Date().toISOString()
            };

            // Log the error in a step for better visibility in Inngest dashboard
            await step.run("error-logging", async () => {
                return errorDetails;
            });

            // For database connection errors, we want to retry
            if (error.message.includes('connecting to db') || 
                error.name === 'MongoNetworkError' ||
                error.name === 'MongoTimeoutError') {
                throw error; // This will trigger a retry
            }

            // For other errors, return failure
            return {
                success: false,
                error: errorDetails
            }
        }


    }

)