import mongoose from "mongoose";

const RefineSchema = new mongoose.Schema(
  {
    activities: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    estimatedtime: {
      type: String,
      required: [true, "Description is required"],
    },
    resources: {
      type: String,
    },

    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: [true, "Idea ID is required"],
    },
    // visionId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Vision",
    //   required: [true, "Vision ID is required"],
    // },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Refine", RefineSchema);
