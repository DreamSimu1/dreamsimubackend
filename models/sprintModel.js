import mongoose from "mongoose";

const SprintSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    activity: {
      type: String,
      required: [true, "Description is required"],
    },

    refineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Refine",
      required: [true, "Refine ID is required"],
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

export default mongoose.model("Sprint", SprintSchema);
