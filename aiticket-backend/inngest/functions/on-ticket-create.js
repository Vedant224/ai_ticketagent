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
            const {
                ticketId
            } = event.data;
            const ticket = await step.run("fetch-ticket", async () => {
                const ticketObject = await Ticket.findById(ticketId)
                if (!ticketObject) {
                    throw new NonRetriableError("Ticket not found");
                }
                return ticketObject;
            })
            await step.run("update-ticket-status", async () => {
                await Ticket.findByIdAndUpdate(ticket._id, {
                    status: "TODO"
                })
            })
            const aiResponse = await analyzeTicket(ticket)
            JSON.stringify(aiResponse);
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
            return {
                success: false,
                error: error.message
            }
        }


    }

)