const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Please enter the Task"],
      min: 3,
      trim: true,
    },
    path: {
      type: String,
      required: [true, "A file must have a path "],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const File = mongoose.model("file", fileSchema);

module.exports = File;
