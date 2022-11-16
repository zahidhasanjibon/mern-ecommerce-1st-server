
const cloudinary = require("cloudinary");
const app = require("./app");

// internal
const connectDatabase = require("./config/dataBase");

// handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down server due to uncaught Exception`);
  process.exit(1);
});

if (process.env.NODE_ENV !== "PRODUCTION") {
  // config
  require("dotenv").config({ path: "backend/config/config.env" });
}

// database connection
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log(`port listening on ${process.env.PORT}`);
});

// unHandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server Shut down due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
