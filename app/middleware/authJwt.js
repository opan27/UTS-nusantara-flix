const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("../models");
const User = db.User;
const JWT_SECRET = process.env.JWT_SECRET;
// 1. Memeriksa Token (Authentication)
const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length); // Hapus "Bearer "
  }
  if (!token) {
    return res
      .status(403)
      .send({ message: "No token provided! Authorization denied." });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ message: "Unauthorized! Token is invalid or expired." });
    }
    // Simpan data dari payload token ke request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};
// 2. Memeriksa Peran Admin (Authorization)
const isAdmin = (req, res, next) => {
  // role sudah tersedia dari middleware verifyToken
  if (req.userRole && req.userRole === "admin") {
    next();
    return;
  }
  res.status(403).send({ message: "Require Admin Role! Access denied." });
};
const authJwt = {
  verifyToken,
  isAdmin,
};
module.exports = authJwt;
