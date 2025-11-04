

const dotenv = require("dotenv")
 
dotenv.config({
  path:"./.env"
});
 

const mongoose = require("mongoose");
const app = require("./src/app");

const DB = process.env.DB;





if (!DB) {
  console.error("DB environment variable is not defined");
  process.exit(1);
}

mongoose
  .connect(DB)
  .then(() => console.log("✅ Connected to Database"))
  .catch((err) => console.error("Failed to connect to the database", err));


const PORT = 7000;

app.listen(PORT, "localhost", () => {
  console.log("Server is running on  PORT 7000");
});
