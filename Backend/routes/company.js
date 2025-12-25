const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const authenticate = require("../middleware/authMiddleware");

// CREATE COMPANY
router.post("/create", authenticate, async (req, res) => {
  try {
    const { name, address, website } = req.body;

    const company = new Company({
      name,
      address,
      website,
    });

    await company.save();

    return res.json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET ALL COMPANIES
router.get("/all", authenticate, async (req, res) => {
  try {
    const companies = await Company.find();
    return res.json({
      success: true,
      data: companies,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
