import { 
    createPollService, 
    getPollByIdService, 
    submitVoteService,
    getCreatorPollsService,
    getPollAnalyticsService,
    publishPollResultsService,
    getPublishedPollsService,
    closePollService
} from "./poll.service.js";
import ApiResponse from "../../common/utils/api.response.js";
import ApiError from "../../common/utils/api-error.js";
import { getAuth } from "@clerk/express";

export async function handleCreatePoll(req, res) {
    try {
        const auth = getAuth(req);
        const pollData = req.body;

        if (!auth.isAuthenticated) {
            throw ApiError.unauthorized("You must be logged in to create a poll");
        }

        const clerkUserId = auth?.userId;
        const poll = await createPollService(pollData, clerkUserId);

        return ApiResponse.created(res, "Poll created successfully", poll);

    } catch (error) {
        console.error("Error in handleCreatePoll:", error);
        if (error instanceof ApiError) throw error;
        throw ApiError.badRequest("Error creating poll");
    }
}

export async function handleGetPoll(req, res) {
    try {
        const { id } = req.params;
        const poll = await getPollByIdService(id);

        return ApiResponse.ok(res, "Poll fetched successfully", poll);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.badRequest(error.message || "Error fetching poll");
    }
}

import { getIO } from "../../common/config/socket.js";

export async function handleSubmitVote(req, res) {
    try {
        const { id } = req.params;
        const auth = getAuth(req);
        const voteData = req.body;
        const clerkUserId = auth?.userId;
        const ipAddress = req.ip;

        const vote = await submitVoteService(id, voteData, clerkUserId, ipAddress);
        
        // Fetch latest analytics to broadcast
        try {
            // We pass null for clerkUserId because this is an internal fetch for broadcasting
            // Wait, getPollAnalyticsService checks authorization if not published.
            // We can just emit a "newVote" event, and the frontend can refetch if it's the admin viewing analytics.
            const io = getIO();
            io.to(id).emit("pollUpdated", { message: "New vote received!" });
        } catch (err) {
            console.error("Socket emission failed:", err);
        }

        return ApiResponse.created(res, "Vote submitted successfully", vote);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.badRequest(error.message || "Error submitting vote");
    }
}

export async function handleGetCreatorPolls(req, res) {
    try {
        const auth = getAuth(req);
        if (!auth.isAuthenticated) throw ApiError.unauthorized("Must be logged in");

        const polls = await getCreatorPollsService(auth.userId);
        return ApiResponse.ok(res, "Polls fetched successfully", polls);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.badRequest(error.message || "Error fetching polls");
    }
}

export async function handleGetPollAnalytics(req, res) {
    try {
        const { id } = req.params;
        const auth = getAuth(req);
        
        let clerkUserId = auth?.userId;
        
        const analytics = await getPollAnalyticsService(id, clerkUserId);
        return ApiResponse.ok(res, "Analytics fetched successfully", analytics);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.badRequest(error.message || "Error fetching analytics");
    }
}

export async function handlePublishPollResults(req, res) {
    try {
        const { id } = req.params;
        const auth = getAuth(req);
        if (!auth.isAuthenticated) throw ApiError.unauthorized("Must be logged in");

        const poll = await publishPollResultsService(id, auth.userId);
        return ApiResponse.ok(res, "Poll published successfully", poll);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.badRequest(error.message || "Error publishing poll");
    }
}

export async function handleGetPublishedPolls(req, res) {
    try {
        let { search } = req.query;
        if (search && typeof search === 'string') {
            search = search.substring(0, 100);
        }
        const polls = await getPublishedPollsService(search);
        return ApiResponse.ok(res, "Published polls fetched successfully", polls);
    } catch (error) {
        throw ApiError.badRequest(error.message || "Error fetching published polls");
    }
}

export async function handleClosePoll(req, res) {
    try {
        const { id } = req.params;
        const auth = getAuth(req);
        if (!auth.isAuthenticated) throw ApiError.unauthorized("Must be logged in");

        const poll = await closePollService(id, auth.userId);
        return ApiResponse.ok(res, "Poll closed successfully", poll);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.badRequest(error.message || "Error closing poll");
    }
}
