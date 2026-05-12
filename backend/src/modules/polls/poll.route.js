import { Router } from "express";
import { 
    handleCreatePoll, 
    handleGetPoll, 
    handleSubmitVote,
    handleGetCreatorPolls,
    handleGetPollAnalytics,
    handlePublishPollResults,
    handleGetPublishedPolls,
    handleClosePoll
} from "./poll.controller.js";
import validate from "../../common/middleware/validate.middleware.js";
import PollDto from "./dto/poll.dto.js";
import VoteDto from "./dto/vote.dto.js";

const router = Router();

router.get("/creator-polls", handleGetCreatorPolls);
router.get("/published", handleGetPublishedPolls);
router.post("/create", validate(PollDto), handleCreatePoll);
router.get("/:id", handleGetPoll);
router.post("/:id/vote", validate(VoteDto), handleSubmitVote);
router.get("/:id/analytics", handleGetPollAnalytics);
router.post("/:id/publish", handlePublishPollResults);
router.post("/:id/close", handleClosePoll);

export default router;
