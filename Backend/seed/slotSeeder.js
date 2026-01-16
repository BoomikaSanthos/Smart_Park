const mongoose = require("mongoose");
const Slot = require("../models/slotModel");
require("dotenv").config();

const places = [
  {prefix: 'TN-AIR', state: 'TN', count: 50}, // Airport
  {prefix: 'TN-EXP', state: 'TN', count: 30}, // Mall
  {prefix: 'TN-NEH', state: 'TN', count: 25}, // Stadium
  // KA 110, MH 115, DL 95, KL 95 = 520 total
  {prefix: 'KA-BLR', state: 'KA', count: 45},
  {prefix: 'KA-UBC', state: 'KA', count: 35},
  {prefix: 'KA-CHI', state: 'KA', count: 30},
  {prefix: 'MH-MUM', state: 'MH', count: 50},
  {prefix: 'MH-PVR', state: 'MH', count: 35},
  {prefix: 'MH-WNK', state: 'MH', count: 30},
  {prefix: 'DL-DEL', state: 'DL', count: 40},
  {prefix: 'DL-SAK', state: 'DL', count: 30},
  {prefix: 'DL-FRO', state: 'DL', count: 25},
  {prefix: 'KL-COK', state: 'KL', count: 40},
  {prefix: 'KL-LUL', state: 'KL', count: 30},
  {prefix: 'KL-JLN', state: 'KL', count: 25}
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Slot.deleteMany({});
  const allSlots = places.flatMap(p =>
    Array.from({length: p.count}, (_, i) => ({
      slotNumber: `${p.prefix}-${(i+1).toString().padStart(3,'0')}`,
      state: p.state,
      location: p.prefix
    }))
  );
  await Slot.insertMany(allSlots);
  console.log(`✅ ${allSlots.length} slots inserted! TN-AIR:50 TN-EXP:30`);
  process.exit(0);
});