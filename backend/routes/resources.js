import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import Resource from '../models/Resource.js'

const router = express.Router()

// Get all resources (shared, public)
router.get('/', async (req, res) => {
  try {
    const { category, semester, subject, search, sort } = req.query
    const filter = {}
    if (category && category !== 'all') filter.category = category
    if (semester && semester !== 'All') filter.semester = semester
    if (subject && subject !== 'All') filter.subject = subject
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ]
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'Most Downloaded') sortOption = { downloads: -1 }
    else if (sort === 'Highest Rated') sortOption = { rating: -1 }

    const resources = await Resource.find(filter).sort(sortOption)
    res.json({ ok: true, resources })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources.' })
  }
})

// Get featured resources
router.get('/featured', async (req, res) => {
  try {
    const resources = await Resource.find({ featured: true }).sort({ downloads: -1 }).limit(10)
    res.json({ ok: true, resources })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured resources.' })
  }
})

// Upload / contribute a resource (authenticated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, subject, category, semester, type, size, fileUrl, icon, iconColor } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required.' })

    const resource = new Resource({
      title, subject, category, semester, type, size, fileUrl, icon, iconColor,
      contributorId: req.user._id,
      contributorName: req.user.name,
    })
    await resource.save()
    res.status(201).json({ ok: true, resource })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource.' })
  }
})

// Increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    )
    if (!resource) return res.status(404).json({ error: 'Resource not found.' })
    res.json({ ok: true, resource })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update download count.' })
  }
})

// Get user's uploaded resources
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.find({ contributorId: req.user._id }).sort({ createdAt: -1 })
    res.json({ ok: true, resources })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your resources.' })
  }
})

export default router
