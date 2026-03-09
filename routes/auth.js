// routes/auth.js
const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: "Password required" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    // VERY simple: just tell frontend it's valid.
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: "Invalid password" });
  }
});

module.exports = router;
