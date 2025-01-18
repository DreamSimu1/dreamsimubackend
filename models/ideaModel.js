import mongoose from "mongoose";

const IdeaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    status: {
      type: String,
      enum: ["InProgress", "Refinement", "Completed"],
      default: "InProgress",
    },
    imageUrl: {
      type: String,
    },
    visionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vision",
      required: [true, "Vision ID is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Idea", IdeaSchema);
