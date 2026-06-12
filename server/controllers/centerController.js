const Center = require('../models/Center')

// GET /api/centers — public, both roles use this to load the map
const getCenters = async (req, res) => {
  try {
    const centers = await Center.find({ isActive: true })
    res.json(centers)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/admin/centers — admin places a new container on the map
const createCenter = async (req, res) => {
  try {
    const { name, address, city, coordinates, hours } = req.body

    if (!coordinates?.lat || !coordinates?.lng) {
      return res.status(400).json({ message: 'Coordinates are required' })
    }

    const center = await Center.create({ name, address, city, coordinates, hours })
    res.status(201).json(center)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/admin/centers/:id — edit name, hours, etc.
const updateCenter = async (req, res) => {
  try {
    const center = await Center.findByIdAndUpdate(req.params.id, req.body, {
      new: true,           // return the updated doc
      runValidators: true,
    })
    if (!center) return res.status(404).json({ message: 'Center not found' })
    res.json(center)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/admin/centers/:id — soft delete (just flags isActive: false)
const deleteCenter = async (req, res) => {
  try {
    const center = await Center.deleteOne({ _id: req.params.id })
    
    if (!center) return res.status(404).json({ message: 'Center not found' })
    res.json({ message: 'Center removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getCenters, createCenter, updateCenter, deleteCenter }