const mongoose = require('mongoose')
const Reward = require('../models/Reward')
require('dotenv').config()

const rewards = [
  {
    title: 'Reusable shopping bag',
    description: 'Eco-friendly tote bag made from recycled materials.',
    pointsCost: 30,
    type: 'physical',
    stock: 100,
  },
  {
    title: 'Plant a tree certificate',
    description: 'We plant a tree in your name in a reforestation zone in Algeria.',
    pointsCost: 50,
    type: 'digital',
    stock: -1,
  },
  {
    title: 'Organic baby wipes pack',
    description: '3-pack of biodegradable, fragrance-free baby wipes.',
    pointsCost: 45,
    type: 'physical',
    stock: 50,
  },
  {
    title: 'Faderco discount voucher 10%',
    description: '10% off your next Faderco product purchase.',
    pointsCost: 60,
    type: 'digital',
    stock: -1,
  },
  {
    title: 'Stainless steel water bottle',
    description: 'Keep hydrated sustainably — 500ml insulated bottle.',
    pointsCost: 80,
    type: 'physical',
    stock: 30,
  },
  {
    title: 'Eco starter kit',
    description: 'Bamboo toothbrush, soap bar, and reusable produce bags.',
    pointsCost: 120,
    type: 'physical',
    stock: 20,
  },
]

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  await Reward.deleteMany({})
  await Reward.insertMany(rewards)
  console.log(`${rewards.length} rewards seeded`)
  process.exit()
}

seed()