import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { mockDonors } from "./db/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const db = drizzle(process.env.DATABASE_URL);

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const sharedPhone = "+918168326332";

const mockData = [
  {
    name: "Donor A+ Nearby 1",
    phone: sharedPhone,
    latitude: "31.6210",
    longitude: "74.8770",
    bloodType: "A+",
  },
  {
    name: "Donor A+ Nearby 2",
    phone: sharedPhone,
    latitude: "31.6300",
    longitude: "74.8800",
    bloodType: "A+",
  },
  {
    name: "Donor A+ Nearby 3",
    phone: sharedPhone,
    latitude: "31.6500",
    longitude: "74.8700",
    bloodType: "A+",
  },
  {
    name: "Donor A+ Far 1",
    phone: sharedPhone,
    latitude: "31.7000",
    longitude: "74.9000",
    bloodType: "A+",
  },
  {
    name: "Donor B+ Nearby",
    phone: sharedPhone,
    latitude: "31.6250",
    longitude: "74.8750",
    bloodType: "B+",
  },
  {
    name: "Donor O- Far",
    phone: sharedPhone,
    latitude: "30.6203",
    longitude: "74.8765",
    bloodType: "O-",
  },
];

async function seed() {
  console.log("Seeding/Updating mock donors...");

  await db.update(mockDonors).set({ phone: sharedPhone });

  for (const donor of mockData) {
    await db.insert(mockDonors).values({
      id: crypto.randomUUID(),
      ...donor,
      isAvailable: true,
    });
    console.log(`Added: ${donor.name} (${donor.bloodType}) at ${donor.latitude}, ${donor.longitude}`);
  }

  console.log("Done!");
}

seed().catch(console.error);
