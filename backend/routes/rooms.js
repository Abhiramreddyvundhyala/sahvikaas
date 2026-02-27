import express from 'express'
import Room from '../models/Room.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Create a new room
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, subject, privacy, audio, video, scheduledFor } = req.body
    const userId = req.user._id
    
    const roomData = {
      name,
      subject,
      privacy,
      audio,
      video,
      createdBy: userId,
      participants: [userId],
    }
    
    // If scheduledFor is provided, set status to scheduled
    if (scheduledFor) {
      roomData.scheduledFor = new Date(scheduledFor)
      roomData.status = 'scheduled'
    } else {
      roomData.status = 'active'
    }
    
    const room = await Room.create(roomData)
    await User.findByIdAndUpdate(userId, { 
      $push: { createdRooms: room._id, joinedRooms: room._id } 
    })
    
    res.json({ ok: true, room })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create room', details: err.message })
  }
})

// Join a room
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ error: 'Room not found' })
    if (room.ended) return res.status(400).json({ error: 'Room has ended' })
    
    if (!room.participants.includes(userId)) {
      room.participants.push(userId)
      // Update max participants count
      if (room.participants.length > room.maxParticipants) {
        room.maxParticipants = room.participants.length
      }
      await room.save()
      await User.findByIdAndUpdate(userId, { $addToSet: { joinedRooms: room._id } })
    }
    
    res.json({ ok: true, room })
  } catch (err) {
    res.status(500).json({ error: 'Failed to join room', details: err.message })
  }
})

// End a room (host only)
router.post('/:id/end', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ error: 'Room not found' })
    if (String(room.createdBy) !== String(userId)) {
      return res.status(403).json({ error: 'Only host can end the room' })
    }
    
    room.ended = true
    room.endedAt = new Date()
    room.status = 'completed'
    room.duration = Math.round((room.endedAt - room.createdAt) / 60000)
    await room.save()
    
    res.json({ ok: true, room })
  } catch (err) {
    res.status(500).json({ error: 'Failed to end room', details: err.message })
  }
})

// Get all active rooms (public)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find({ 
      ended: false,
      status: 'active'
    }).populate('createdBy', 'name email')
    res.json({ rooms })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms', details: err.message })
  }
})

// Get room info
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('createdBy', 'name email')
    if (!room) return res.status(404).json({ error: 'Room not found' })
    res.json({ room })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room', details: err.message })
  }
})

// Get user's room history (created and joined)
router.get('/user/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id
    
    // Get all rooms user created or joined
    const createdRooms = await Room.find({ createdBy: userId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      
    const joinedRooms = await Room.find({ 
      participants: userId,
      createdBy: { $ne: userId }
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
    
    res.json({
      createdRooms,
      joinedRooms,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user room history', details: err.message })
  }
})

// Get user's session statistics
router.get('/user/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id
    
    // Active sessions
    const activeSessions = await Room.find({
      participants: userId,
      ended: false,
      status: 'active'
    }).populate('createdBy', 'name email')
    
    // Recent completed sessions (last 10)
    const recentSessions = await Room.find({
      participants: userId,
      status: 'completed'
    })
      .populate('createdBy', 'name email')
      .sort({ endedAt: -1 })
      .limit(10)
    
    // Upcoming scheduled sessions
    const upcomingSessions = await Room.find({
      participants: userId,
      status: 'scheduled',
      scheduledFor: { $gte: new Date() }
    })
      .populate('createdBy', 'name email')
      .sort({ scheduledFor: 1 })
    
    // Calculate total study time
    const completedRooms = await Room.find({
      participants: userId,
      status: 'completed'
    })
    
    const totalMinutes = completedRooms.reduce((sum, room) => sum + (room.duration || 0), 0)
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10
    
    // Subject distribution
    const subjectMap = {}
    completedRooms.forEach(room => {
      if (room.subject) {
        subjectMap[room.subject] = (subjectMap[room.subject] || 0) + (room.duration || 0)
      }
    })
    
    res.json({
      activeSessions,
      recentSessions,
      upcomingSessions,
      totalHours,
      totalSessions: completedRooms.length,
      subjectDistribution: subjectMap
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user stats', details: err.message })
  }
})

export default router
