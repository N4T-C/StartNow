const BusinessUser = require("../models/BusinessUser");

const SEED_USERS = [
  { email: "hclmanager@hcl.in", password: "hclman", companyName: "HCL Technologies", role: "manager" },
  { email: "tatadirector@tata.in", password: "tataman", companyName: "Tata Group", role: "director" },
  { email: "reliancehead@reliance.in", password: "reliman", companyName: "Reliance Industries", role: "head" },
  { email: "infosyspm@infosys.in", password: "infoman", companyName: "Infosys", role: "product-manager" },
  { email: "wiproceo@wipro.in", password: "wiproman", companyName: "Wipro", role: "ceo" },
];

async function seedBusinessUsers() {
  const count = await BusinessUser.countDocuments();
  if (count > 0) return;
  await BusinessUser.insertMany(SEED_USERS);
  console.log("[seed] Business users seeded successfully.");
}

module.exports = { seedBusinessUsers };
