const express = require("express");
const dotenv = require("dotenv");
const db = require("./app/models");
const path = require("path");
const cors = require("cors");

// --- Pemuatan Dotenv ---
const envPath = path.resolve(__dirname, ".env");
const result = dotenv.config({ path: envPath });

// DEBUGGING: Cek apakah variabel sudah dimuat
console.log("DEBUG CHECK: .env Path:", envPath);
console.log("DEBUG CHECK: JWT Secret is set:", !!process.env.JWT_SECRET);
console.log(
  "DEBUG CHECK: Secret Value (Partial):",
  process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + "..." : "NONE"
);

if (result.error) {
  console.error("ERROR: Failed to load .env file. Check file existence and path.");
}

// ---------------------------------
const app = express();

// --- KONFIGURASI CORS ---
var corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// Sinkronisasi Database (Membuat tabel jika belum ada)
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables synced successfully.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// Rute
const authRoutes = require("./app/routes/auth.routes");
const mediaRoutes = require("./app/routes/media.routes");

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Nusantara Flix Media Management API with MySQL & JWT." });
});

app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);

// Jalankan server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
