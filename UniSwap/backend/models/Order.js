const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Snapshot of price/title at order time, so later edits to the listing
    // (or the listing being deleted) never change what was actually ordered.
    itemTitle: { type: String, required: true },
    amount: { type: Number, required: true },

    buyerName: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    notes: { type: String, default: "" },

    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
