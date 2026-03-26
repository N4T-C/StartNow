const dotenv = require("dotenv");
const app = require("./app");
const { connectToDatabase } = require("./utils/db");

dotenv.config({ path: process.env.NODE_ENV === "production" ? undefined : "../.env.local" });

const PORT = process.env.PORT || 5000;

async function start() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend", error.message);
  process.exit(1);
});
