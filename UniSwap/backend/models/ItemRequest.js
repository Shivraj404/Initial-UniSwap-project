const mongoose = require("mongoose");

const itemRequestSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Books", "Electronics", "Furniture", "Stationery", "Clothing", "Other"],
    },
    budget: { type: Number },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ItemRequest", itemRequestSchema);
