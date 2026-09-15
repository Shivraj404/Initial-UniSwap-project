const express = require("express");
const Order = require("../models/Order");
const Listing = require("../models/Listing");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// PLACE A COD ORDER
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { listingId, buyerName, buyerPhone, deliveryAddress, notes } = req.body;

    if (!listingId || !buyerName || !buyerPhone || !deliveryAddress) {
      return res.status(400).json({
        message: "Name, phone, delivery address and listing are required",
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.status === "sold") {
      return res.status(409).json({ message: "This item has already been sold" });
    }
    if (String(listing.seller) === String(req.user.userId)) {
      return res.status(400).json({ message: "You can't order your own listing" });
    }

    const order = await Order.create({
      listing: listing._id,
      buyer: req.user.userId,
      seller: listing.seller,
      itemTitle: listing.title,
      amount: listing.price,
      buyerName,
      buyerPhone,
      deliveryAddress,
      notes,
      paymentMethod: "COD",
      status: "pending",
    });

    // Prevent the same item being ordered twice while this order is open
    listing.status = "sold";
    await listing.save();

    const populated = await order.populate([
      { path: "listing", select: "title images" },
      { path: "seller", select: "name phone college" },
    ]);

    res.status(201).json({ message: "Order placed successfully", order: populated });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
});

// MY ORDERS AS BUYER
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId })
      .populate("listing", "title images")
      .populate("seller", "name phone college")
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
});

// INCOMING ORDERS AS SELLER
router.get("/selling", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.userId })
      .populate("listing", "title images")
      .populate("buyer", "name phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Get selling orders error:", error);
    res.status(500).json({ message: "Failed to fetch incoming orders" });
  }
});

// SELLER UPDATES ORDER STATUS (confirm / mark delivered / cancel)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (String(order.seller) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Only the seller can update this order" });
    }

    order.status = status;
    await order.save();

    // If cancelled, put the listing back on the marketplace
    if (status === "cancelled") {
      await Listing.findByIdAndUpdate(order.listing, { status: "available" });
    }

    res.status(200).json({ message: "Order updated", order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
});

module.exports = router;
