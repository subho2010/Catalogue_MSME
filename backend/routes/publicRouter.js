import express from "express";
import { connectToDatabase } from "../lib/db.js";

const router = express.Router();

// Get all listed artisans
// Get all listed artisans
router.get("/artisans", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [artisans] = await db.query(`
      SELECT u.username, u.artisanId 
      FROM users u
      WHERE u.listed = true
      ORDER BY 
        SUBSTRING_INDEX(u.username, ' ', 1) ASC, -- Sort by first name
        u.username ASC
    `);
    res.json(artisans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add proper artisan products route
router.get("/artisans/:artisanId/products", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [products] = await db.query(
      `SELECT * FROM products 
       WHERE artisanId = ? AND is_listed = true`,
      [req.params.artisanId]
    );

    // Validate 3 products (if required)
    if (products.length < 3) {
      return res.status(404).json({ message: "Artisan not properly listed" });
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get artisan by ID
router.get("/artisans/:artisanId", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [artisans] = await db.query(
      "SELECT * FROM users WHERE artisanId = ?",
      [req.params.artisanId]
    );

    if (artisans.length === 0)
      return res.status(404).json({ message: "Artisan not found" });

    res.json({
      ...artisans[0],
      profileImageUrl: artisans[0].profileImage
        ? `${process.env.BACKEND_URL}/uploads/${artisans[0].profileImage}`
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
