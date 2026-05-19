const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be under 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [2000, "Content must be under 2000 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: [100, "Author name must be under 100 characters"],
    },
    category: {
      type: String,
      enum: ["motivation", "technique", "nutrition", "mindset", "performance", "recovery"],
      default: "motivation",
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 10,
        message: "Cannot have more than 10 tags",
      },
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient sorting and querying
feedSchema.index({ createdAt: -1 });
feedSchema.index({ category: 1, createdAt: -1 });
feedSchema.index({ isPinned: -1, createdAt: -1 });

const Feed = mongoose.model("Feed", feedSchema);

module.exports = Feed;
