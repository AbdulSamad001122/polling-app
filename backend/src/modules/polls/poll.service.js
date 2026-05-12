import mongoose from "mongoose";
import { clerkClient } from "@clerk/express";
import Poll from "../../models/Poll.schema.js";
import User from "../../models/User.schema.js";
import Vote from "../../models/Vote.schema.js";
import ApiError from "../../common/utils/api-error.js";

async function getOrCreateUser(clerkUserId) {
    if (!clerkUserId) return null;
    let user = await User.findOne({ clerkUserId });
    
    if (!user) {
        try {
            const clerkUser = await clerkClient.users.getUser(clerkUserId);
            if (clerkUser) {
                const emailObj = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId) || clerkUser.emailAddresses[0];
                const email = emailObj?.emailAddress || "";
                
                user = await User.findOneAndUpdate(
                    { email: email },
                    {
                        clerkUserId: clerkUser.id,
                        firstName: clerkUser.firstName || "",
                        lastName: clerkUser.lastName || "",
                        imageUrl: clerkUser.imageUrl || ""
                    },
                    { new: true, upsert: true }
                );
            }
        } catch (err) {
            console.error("Failed to auto-sync user from Clerk:", err);
        }
    }
    return user;
}

export async function createPollService(pollData, clerkUserId) {
    const user = await getOrCreateUser(clerkUserId);

    if (!user) {
        throw ApiError.notFound("User not found");
    }

    const poll = await Poll.create({
        ...pollData,
        createdBy: user._id,
        isPublished: false, 
    });

    return poll;
}

export async function getCreatorPollsService(clerkUserId) {
    const user = await getOrCreateUser(clerkUserId);
    if (!user) return []; 

    const polls = await Poll.find({ createdBy: user._id })
        .sort({ createdAt: -1 })
        .limit(100);
    return polls;
}

export async function getPollByIdService(pollId) {
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
        throw ApiError.badRequest("Invalid Poll ID format");
    }
    const poll = await Poll.findById(pollId).populate("createdBy", "firstName lastName");
    if (!poll) {
        throw ApiError.notFound("Poll not found");
    }
    return poll;
}

export async function submitVoteService(pollId, voteData, clerkUserId, ipAddress) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");

    if (!poll.isActive) {
        throw ApiError.badRequest("This poll is no longer active");
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
        throw ApiError.badRequest("This poll has expired");
    }

    if (poll.requiresAuth && !clerkUserId) {
        throw ApiError.unauthorized("This poll requires you to be logged in to vote");
    }

    // Validate answers and prevent duplicates
    const answeredQuestionIds = new Set();
    for (const answer of voteData.answers) {
        if (answeredQuestionIds.has(answer.questionId)) {
            throw ApiError.badRequest("Duplicate answers for the same question are not allowed.");
        }
        answeredQuestionIds.add(answer.questionId);

        const question = poll.questions.find(q => q._id.toString() === answer.questionId);
        if (!question) {
            throw ApiError.badRequest(`Question ID ${answer.questionId} is invalid for this poll.`);
        }
        const optionExists = question.options.some(opt => opt._id.toString() === answer.optionId);
        if (!optionExists) {
            throw ApiError.badRequest(`Option ID ${answer.optionId} is invalid for question "${question.text}".`);
        }
    }

    for (const question of poll.questions) {
        if (question.isRequired && !answeredQuestionIds.has(question._id.toString())) {
            throw ApiError.badRequest(`Question "${question.text}" is mandatory.`);
        }
    }

    let user = null;
    if (clerkUserId) {
        user = await getOrCreateUser(clerkUserId);
        const existingVote = await Vote.findOne({ pollId, $or: [{ userId: user?._id }, { clerkUserId }] });
        if (existingVote) {
            throw ApiError.badRequest("You have already voted on this poll");
        }
    } else if (ipAddress) {
        const existingAnonymousVote = await Vote.findOne({ pollId, ipAddress });
        if (existingAnonymousVote) {
            throw ApiError.badRequest("You have already voted on this poll from this IP address");
        }
    }

    const vote = await Vote.create({
        pollId,
        userId: user?._id,
        clerkUserId,
        ipAddress,
        answers: voteData.answers,
    });

    return vote;
}

export async function getPollAnalyticsService(pollId, clerkUserId) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");

    if (!poll.isPublished) {
        if (!clerkUserId) throw ApiError.unauthorized("Authentication required to view private analytics");
        const user = await getOrCreateUser(clerkUserId);
        if (!user || poll.createdBy.toString() !== user._id.toString()) {
            throw ApiError.unauthorized("You are not authorized to view analytics for this poll");
        }
    }

    const votes = await Vote.find({ pollId }).populate("userId", "firstName lastName imageUrl");
    
    const respondents = votes.map(vote => {
        let respondentDetails = {
            id: vote._id,
            votedAt: vote.votedAt,
            answers: vote.answers
        };

        if (poll.isAnonymous || !vote.userId) {
            respondentDetails.user = {
                name: "Anonymous",
                imageUrl: null
            };
        } else {
            const name = `${vote.userId.firstName} ${vote.userId.lastName}`.trim() || "Unknown User";
            const fallbackImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=034F46&color=FFFFEB`;
            
            respondentDetails.user = {
                name: name,
                imageUrl: vote.userId.imageUrl || fallbackImageUrl
            };
        }
        return respondentDetails;
    });
    
    const analytics = {
        totalResponses: votes.length,
        questions: poll.questions.map(q => {
            const optionsCount = {};
            q.options.forEach(opt => {
                optionsCount[opt._id] = { _id: opt._id.toString(), text: opt.text, count: 0, voters: [] };
            });

            let questionResponses = 0;

            votes.forEach(vote => {
                const answer = vote.answers.find(a => a.questionId.toString() === q._id.toString());
                if (answer && optionsCount[answer.optionId]) {
                    optionsCount[answer.optionId].count++;
                    questionResponses++;
                    
                    let voter = { id: vote._id.toString(), name: "Anonymous", imageUrl: null };
                    if (!poll.isAnonymous && vote.userId) {
                        const name = `${vote.userId.firstName} ${vote.userId.lastName}`.trim() || "Unknown User";
                        const fallbackImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=034F46&color=FFFFEB`;
                        voter = { id: vote.userId._id.toString(), name, imageUrl: vote.userId.imageUrl || fallbackImageUrl };
                    }
                    optionsCount[answer.optionId].voters.push(voter);
                }
            });

            return {
                questionId: q._id,
                text: q.text,
                totalAnswers: questionResponses,
                options: Object.values(optionsCount)
            };
        }),
        respondents: respondents.sort((a, b) => new Date(b.votedAt) - new Date(a.votedAt)) // Newest first
    };

    return analytics;
}

export async function publishPollResultsService(pollId, clerkUserId) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");

    const user = await getOrCreateUser(clerkUserId);
    if (!user || poll.createdBy.toString() !== user._id.toString()) {
        throw ApiError.unauthorized("You are not authorized to publish results for this poll");
    }

    poll.isPublished = true;
    poll.isActive = false; 
    await poll.save();

    return poll;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getPublishedPollsService(searchQuery = "") {
    const query = { isPublished: true };
    if (searchQuery) {
        const safeQuery = escapeRegExp(searchQuery);
        query.title = { $regex: safeQuery, $options: "i" };
    }
    const polls = await Poll.find(query)
        .populate("createdBy", "firstName lastName imageUrl")
        .sort({ createdAt: -1 })
        .limit(100);
    return polls;
}

export async function closePollService(pollId, clerkUserId) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");

    const user = await getOrCreateUser(clerkUserId);
    if (!user || (poll.createdBy && user._id && poll.createdBy.toString() !== user._id.toString())) {
        throw ApiError.unauthorized("You are not authorized to close this poll");
    }

    poll.isActive = false;
    await poll.save();

    return poll;
}
