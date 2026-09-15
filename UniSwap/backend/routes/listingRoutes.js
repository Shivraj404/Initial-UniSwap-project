const express = require("express");
const Listing = require("../models/Listing");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// CREATE LISTING (multipart/form-data — up to 5 images under the "images" field)
router.post("/", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, price, category, condition, location, phone } =
      req.body;

    if (!location || !location.trim()) {
      return res.status(400).json({
        message: "Pickup location is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        message: "A contact mobile number is required to list an item",
      });
    }

    // Keep the seller's profile phone number in sync with whatever they
    // enter on the listing form, so buyers always see an up-to-date number
    // and the seller doesn't have to enter it separately on their profile.
    await User.findByIdAndUpdate(req.user.userId, { phone: phone.trim() });

    const imageUrls = (req.files || []).map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      location,
      images: imageUrls,
      seller: req.user.userId,
    });

    const populated = await listing.populate("seller", "name email college phone");

    res.status(201).json({
      message: "Listing created successfully",
      listing: populated,
    });
  } catch (error) {
    console.error("Create listing error:", error);

    if (error.message && error.message.includes("Only image files")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Failed to create listing",
      error: error.message,
    });
  }
});

// GET ALL LISTINGS WITH SEARCH AND FILTER
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {
      status: "available",
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const listings = await Listing.find(filter)
      .populate("seller", "name email college phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Listings fetched successfully",
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Get listings error:", error);

    res.status(500).json({
      message: "Failed to fetch listings",
      error: error.message,
    });
  }
});

// GET SINGLE LISTING (used by the Buy Now detail popup as a fallback,
// and useful for direct-link sharing later)
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "seller",
      "name email college phone"
    );

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({ listing });
  } catch (error) {
    console.error("Get listing error:", error);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
});

module.exports = router;
