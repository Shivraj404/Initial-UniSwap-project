const express = require("express");
const ItemRequest = require("../models/ItemRequest");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST A REQUEST
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, category, budget } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required",
      });
    }

    const request = await ItemRequest.create({
      buyer: req.user.userId,
      title,
      description,
      category,
      budget: budget || undefined,
    });

    const populated = await request.populate("buyer", "name phone college");

    res.status(201).json({ message: "Request posted successfully", request: populated });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Failed to post request", error: error.message });
  }
});

// BROWSE OPEN REQUESTS
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: "open" };
    if (category) filter.category = category;

    const requests = await ItemRequest.find(filter)
      .populate("buyer", "name phone college")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// CLOSE OWN REQUEST
router.patch("/:id/close", authMiddleware, async (req, res) => {
  try {
    const request = await ItemRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (String(request.buyer) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Only the requester can close this" });
    }

    request.status = "closed";
    await request.save();

    res.status(200).json({ message: "Request closed", request });
  } catch (error) {
    console.error("Close request error:", error);
    res.status(500).json({ message: "Failed to close request" });
  }
});

module.exports = router;
