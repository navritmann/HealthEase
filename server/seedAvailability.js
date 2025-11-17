import "dotenv/config.js";
import mongoose from "mongoose";
import Availability from "./models/Availability.js"; // 👈 FIXED PATH

const usage = `
Usage:
  node scripts/seedAvailability.js <DOCTOR_ID> <CLINIC_ID> [TYPE] [START=YYYY-MM-DD] [DAYS=90] [START_HOUR=9] [END_HOUR=17] [INTERVAL_MIN=30]

Example:
  node scripts/seedAvailability.js 652e... 64f1... clinic 2025-11-13 90 9 17 30
`;

const [
  ,
  ,
  doctorId,
  clinicId,
  type = "clinic",
  startStr,
  daysStr = "90",
  shStr = "9",
  ehStr = "17",
  stepStr = "30",
] = process.argv;

if (!doctorId || !clinicId) {
  console.error(usage);
  process.exit(1);
}

const startDate = startStr ? new Date(`${startStr}T00:00:00`) : new Date();
startDate.setHours(0, 0, 0, 0);
const days = parseInt(daysStr, 10);
const startHour = parseInt(shStr, 10);
const endHour = parseInt(ehStr, 10);
const step = parseInt(stepStr, 10);

const addMinutes = (d, m) => new Date(d.getTime() + m * 60000);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to Mongo");

  const bulk = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += step) {
        const start = new Date(day);
        start.setHours(h, m, 0, 0);
        const end = addMinutes(start, step);

        bulk.push({
          updateOne: {
            filter: { doctorId, clinicId, type, start, end },
            update: {
              $setOnInsert: {
                doctorId,
                clinicId,
                type,
                start,
                end,
                blocked: false,
              },
            },
            upsert: true,
          },
        });
      }
    }
  }

  if (bulk.length) {
    const res = await Availability.bulkWrite(bulk, { ordered: false });
    console.log("Upserted slots:", res.upsertedCount ?? 0);
  }

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
