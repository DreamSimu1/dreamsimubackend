import mongoose from "mongoose";

const IdeaSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "day is required"],
    },
    idea: {
      type: String,
      required: [true, "idea is required"],
    },
    // status: {
    //   type: String,
    //   enum: ["InProgress", "Refinement", "Completed"],
    //   default: "InProgress",
    // },
    // imageUrl: {
    //   type: String,
    // },
    visionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dream",
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
