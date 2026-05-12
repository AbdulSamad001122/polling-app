import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questions: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      text: {
        type: String,
        required: true,
      },
      isRequired: {
        type: Boolean,
        default: false,
      },
      options: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
          text: { type: String, required: true },
        },
      ],
    },
  ],

  requiresAuth: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true },
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Poll", pollSchema);
