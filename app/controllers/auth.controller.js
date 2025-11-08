const db = require("../models");
const User = db.User;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
//dotenv.config();
// Variabel JWT_SECRET ini sudah diset di luar fungsi
const JWT_SECRET = process.env.JWT_SECRET; // Pastikan ini mengambil nilai dari .env
exports.signup = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    // Cek jika JWT_SECRET tidak dimuat, meskipun sudah didefinisikan di atas
    if (!JWT_SECRET) {
      return res
        .status(500)
        .send({ message: "Server Error: JWT Secret is not configured." });
    }
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = await User.create({
      username,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
    });
    res
      .status(201)
      .send({
        message: "User was registered successfully!",
        user: { id: user.id, username: user.username, role: user.role },
      });
  } catch (err) {
    res
      .status(500)
      .send({ message: err.message || "Error during registration." });
  }
};
exports.signin = async (req, res) => {
  try {
    // Cek keamanan tambahan
    if (!JWT_SECRET) {
      return res
        .status(500)
        .send({ message: "Server Error: JWT Secret is not configured." });
    }
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!passwordIsValid) {
      return res
        .status(401)
        .send({ accessToken: null, message: "Invalid Password!" });
    }
    // PERBAIKAN UTAMA: Menggunakan variabel lokal JWT_SECRET
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET, // <--- Perubahan dari process.env.JWT_SECRET
      {
        expiresIn: 86400, // 24 jam
      }
    );
    res.status(200).send({
      id: user.id,
      username: user.username,
      role: user.role,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error during signin." });
  }
};
