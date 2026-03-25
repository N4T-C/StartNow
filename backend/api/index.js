const dotenv = require("dotenv");
const app = require("../src/app");

dotenv.config({ path: "../.env.local" });

module.exports = app;
