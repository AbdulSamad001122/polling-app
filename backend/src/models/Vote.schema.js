import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Poll",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // Optional for anonymous polls
  },
  clerkUserId: String, // Handy for quick auth checks
  ipAddress: String, // Track IP for anonymous votes
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      optionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
  ],
  votedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only vote once per poll (if userId is present)
voteSchema.index({ pollId: 1, userId: 1 }, { unique: true, sparse: true });
voteSchema.index({ pollId: 1, clerkUserId: 1 }, { unique: true, sparse: true });
// For anonymous voters
voteSchema.index({ pollId: 1, ipAddress: 1 }, { unique: true, sparse: true });

export default mongoose.model("Vote", voteSchema);
