import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import BadgeProgress from '../models/BadgeProgress.js'
import StudyActivity from '../models/StudyActivity.js'
import StudySession from '../models/StudySession.js'
import Resource from '../models/Resource.js'
import Room from '../models/Room.js'
import User from '../models/User.js'

const router = express.Router()

// Badge definitions (static, same for everyone)
const BADGE_DEFINITIONS = [
  { id: 1, name: 'Study Champion', desc: 'Complete 50 study sessions', icon: 'ri-medal-line', color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', text: 'text-indigo-600', target: 50, unit: 'sessions' },
  { id: 2, name: 'Focus Master', desc: 'Maintain focus for 100 hours', icon: 'ri-focus-3-line', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', target: 100, unit: 'hours' },
  { id: 3, name: 'Knowledge Seeker', desc: 'Complete 25 different subjects', icon: 'ri-book-open-line', color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50', text: 'text-teal-600', target: 25, unit: 'subjects' },
  { id: 4, name: 'Collaboration Star', desc: 'Join 30 study groups', icon: 'ri-team-line', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', text: 'text-pink-600', target: 30, unit: 'groups' },
  { id: 5, name: 'Streak Master', desc: 'Maintain a 30-day study streak', icon: 'ri-fire-line', color: 'from-red-500 to-orange-500', bg: 'bg-red-50', text: 'text-red-600', target: 30, unit: 'days' },
  { id: 6, name: 'Innovation Pioneer', desc: 'Create 10 study materials', icon: 'ri-lightbulb-line', color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-50', text: 'text-yellow-600', target: 10, unit: 'materials' },
  { id: 7, name: 'Quiz Whiz', desc: 'Score 90%+ in 20 quizzes', icon: 'ri-question-answer-line', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600', target: 20, unit: 'quizzes' },
  { id: 8, name: 'Note Ninja', desc: 'Upload 15 quality notes', icon: 'ri-sticky-note-line', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600', target: 15, unit: 'notes' },
  { id: 9, name: 'Early Bird', desc: 'Attend 30 morning sessions', icon: 'ri-sun-line', color: 'from-orange-400 to-yellow-400', bg: 'bg-orange-50', text: 'text-orange-600', target: 30, unit: 'sessions' },
  { id: 10, name: 'Night Owl', desc: 'Study 50 late-night hours', icon: 'ri-moon-line', color: 'from-slate-600 to-indigo-700', bg: 'bg-slate-50', text: 'text-slate-600', target: 50, unit: 'hours' },
]

// ─── Compute live badge progress from real database data ───
async function computeLiveBadgeProgress(userId) {
  const progressMap = {}

  // Run all queries in parallel for performance
  const [
    completedSessionsCount,
    user,
    distinctSubjects,
    roomsJoinedCount,
    totalResourcesCount,
    notesCount,
    morningSessionsCount,
    lateNightActivities,
    manualBadgeProgress,
  ] = await Promise.all([
    // Badge 1 — Study Champion: completed study sessions
    StudySession.countDocuments({ userId, status: 'completed' }),

    // Badge 2 & 5 — Focus Master (total hours) + Streak Master (longest streak)
    User.findById(userId).select('totalStudyHours currentStreak longestStreak joinedRooms'),

    // Badge 3 — Knowledge Seeker: distinct subjects from completed sessions
    StudySession.distinct('subject', { userId, status: 'completed', subject: { $ne: '' } }),

    // Badge 4 — Collaboration Star: rooms joined
    Room.countDocuments({ participants: userId }),

    // Badge 6 — Innovation Pioneer: total resources created
    Resource.countDocuments({ $or: [{ userId }, { contributorId: userId }] }),

    // Badge 8 — Note Ninja: notes uploaded
    Resource.countDocuments({ $or: [{ userId }, { contributorId: userId }], category: 'notes' }),

    // Badge 9 — Early Bird: morning sessions (time before 09:00)
    StudySession.countDocuments({
      userId,
      status: 'completed',
      time: { $ne: '' },
      $expr: { $lt: [{ $substr: ['$time', 0, 2] }, '09'] },
    }).catch(() =>
      // Fallback if $expr not supported — simple regex
      StudySession.countDocuments({
        userId,
        status: 'completed',
        time: { $regex: /^0[0-8]:/ },
      })
    ),

    // Badge 10 — Night Owl: late-night study activity hours (sessions after 22:00)
    StudySession.find({
      userId,
      status: 'completed',
      time: { $ne: '' },
    }).select('time duration').lean(),

    // Badge 7 — Quiz Whiz: kept in BadgeProgress (manually incremented by quiz features)
    BadgeProgress.findOne({ userId, badgeId: 7 }),
  ])

  // Badge 1: Study Champion
  progressMap[1] = completedSessionsCount

  // Badge 2: Focus Master — total study hours
  progressMap[2] = Math.round(user?.totalStudyHours || 0)

  // Badge 3: Knowledge Seeker — distinct subjects
  progressMap[3] = distinctSubjects.length

  // Badge 4: Collaboration Star — rooms joined
  progressMap[4] = roomsJoinedCount

  // Badge 5: Streak Master — best streak ever
  progressMap[5] = Math.max(user?.currentStreak || 0, user?.longestStreak || 0)

  // Badge 6: Innovation Pioneer — resources created
  progressMap[6] = totalResourcesCount

  // Badge 7: Quiz Whiz — from BadgeProgress (manual tracking)
  progressMap[7] = manualBadgeProgress?.current || 0

  // Badge 8: Note Ninja
  progressMap[8] = notesCount

  // Badge 9: Early Bird
  progressMap[9] = morningSessionsCount

  // Badge 10: Night Owl — count hours from sessions starting at 22:00+
  let nightHours = 0
  for (const s of lateNightActivities) {
    const hour = parseInt(s.time?.split(':')[0], 10)
    if (hour >= 22 || hour < 5) {
      nightHours += parseFloat(s.duration) || 1
    }
  }
  progressMap[10] = Math.round(nightHours)

  // Persist computed values back to BadgeProgress so other features can reference them
  const bulkOps = Object.entries(progressMap).map(([badgeId, current]) => ({
    updateOne: {
      filter: { userId, badgeId: Number(badgeId) },
      update: { $set: { current } },
      upsert: true,
    },
  }))
  if (bulkOps.length) await BadgeProgress.bulkWrite(bulkOps)

  return progressMap
}

// ─── Get badges with live user progress ───
router.get('/badges', authMiddleware, async (req, res) => {
  try {
    const progressMap = await computeLiveBadgeProgress(req.user._id)

    const badges = BADGE_DEFINITIONS.map(b => ({
      ...b,
      current: progressMap[b.id] || 0,
    }))

    res.json({ ok: true, badges })
  } catch (err) {
    console.error('Badges fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch badges.' })
  }
})

// ─── Get leaderboard (top users by XP) ───
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const { period } = req.query // 'weekly', 'monthly', or 'all-time'

    let leaderboard

    if (period === 'weekly' || period === 'monthly') {
      // Compute XP from study activity within the time range
      const today = new Date()
      const startDate = new Date(today)
      if (period === 'weekly') startDate.setDate(startDate.getDate() - 7)
      else startDate.setMonth(startDate.getMonth() - 1)
      const startStr = startDate.toISOString().split('T')[0]

      // Aggregate study hours per user in the period
      const activityAgg = await StudyActivity.aggregate([
        { $match: { date: { $gte: startStr } } },
        { $group: { _id: '$userId', totalHours: { $sum: '$hours' } } },
        { $sort: { totalHours: -1 } },
        { $limit: 20 },
      ])

      // Also count completed sessions in the period
      const sessionAgg = await StudySession.aggregate([
        { $match: { status: 'completed', date: { $gte: startStr } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ])
      const sessionMap = {}
      sessionAgg.forEach(s => { sessionMap[String(s._id)] = s.count })

      // Fetch user details
      const userIds = activityAgg.map(a => a._id)
      const users = await User.find({ _id: { $in: userIds } }).select('name institution currentStreak')
      const userMap = {}
      users.forEach(u => { userMap[String(u._id)] = u })

      leaderboard = activityAgg.map((a, i) => {
        const u = userMap[String(a._id)]
        if (!u) return null
        const periodXP = Math.round(a.totalHours * 10) + (sessionMap[String(a._id)] || 0) * 15
        return {
          rank: i + 1,
          userId: String(a._id),
          name: u.name,
          xp: periodXP,
          avatar: u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
          dept: u.institution || 'N/A',
          streak: u.currentStreak || 0,
        }
      }).filter(Boolean)
    } else {
      // All-time: use totalXP from User model
      const users = await User.find({})
        .sort({ totalXP: -1 })
        .limit(20)
        .select('name totalXP institution currentStreak')

      leaderboard = users.map((u, i) => ({
        rank: i + 1,
        userId: String(u._id),
        name: u.name,
        xp: u.totalXP || 0,
        avatar: u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        dept: u.institution || 'N/A',
        streak: u.currentStreak || 0,
      }))
    }

    // Find requesting user's rank if not in top 20
    const currentUserId = String(req.user._id)
    const userInList = leaderboard.find(l => l.userId === currentUserId)
    let currentUserRank = null

    if (!userInList && leaderboard.length > 0) {
      const user = await User.findById(req.user._id).select('name totalXP institution currentStreak')
      const rank = await User.countDocuments({ totalXP: { $gt: user.totalXP || 0 } }) + 1
      currentUserRank = {
        rank,
        userId: currentUserId,
        name: user.name,
        xp: user.totalXP || 0,
        avatar: user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        dept: user.institution || 'N/A',
        streak: user.currentStreak || 0,
        isCurrentUser: true,
      }
    }

    // Mark current user in the list
    leaderboard = leaderboard.map(l => ({
      ...l,
      isCurrentUser: l.userId === currentUserId,
    }))

    res.json({ ok: true, leaderboard, currentUserRank })
  } catch (err) {
    console.error('Leaderboard error:', err)
    res.status(500).json({ error: 'Failed to fetch leaderboard.' })
  }
})

// ─── Get study activity heatmap data (last 84 days) ───
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 83)
    const startStr = startDate.toISOString().split('T')[0]

    // Fetch logged study activity
    const activities = await StudyActivity.find({
      userId: req.user._id,
      date: { $gte: startStr },
    }).sort({ date: 1 })

    const activityMap = {}
    activities.forEach(a => { activityMap[a.date] = a.hours })

    // Also pull completed study sessions and merge their duration
    const completedSessions = await StudySession.find({
      userId: req.user._id,
      status: 'completed',
      date: { $gte: startStr },
    }).select('date duration time').lean()

    completedSessions.forEach(s => {
      const hours = parseFloat(s.duration) || 1
      activityMap[s.date] = (activityMap[s.date] || 0) + hours
    })

    // Also pull room participation duration
    const rooms = await Room.find({
      participants: req.user._id,
      status: 'completed',
      createdAt: { $gte: startDate },
    }).select('createdAt duration').lean()

    rooms.forEach(r => {
      const dateStr = r.createdAt.toISOString().split('T')[0]
      const hours = Math.round((r.duration || 0) / 60 * 10) / 10 // minutes to hours
      if (hours > 0) {
        activityMap[dateStr] = (activityMap[dateStr] || 0) + hours
      }
    })

    // Build full 84-day array
    const data = []
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      data.push({
        date: dateStr,
        day: d.getDate(),
        month: d.toLocaleString('default', { month: 'short' }),
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
        hours: Math.round((activityMap[dateStr] || 0) * 10) / 10,
      })
    }

    res.json({ ok: true, activity: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity data.' })
  }
})

// ─── Log study activity ───
router.post('/activity', authMiddleware, async (req, res) => {
  try {
    const { date, hours } = req.body
    if (!date || hours === undefined) return res.status(400).json({ error: 'Date and hours required.' })

    await StudyActivity.findOneAndUpdate(
      { userId: req.user._id, date },
      { $inc: { hours } },
      { upsert: true, new: true }
    )

    // Update user stats
    const user = await User.findById(req.user._id)
    user.totalStudyHours = (user.totalStudyHours || 0) + hours
    user.lastStudyDate = new Date()

    // Recalculate streak from activity data
    const allActivity = await StudyActivity.find({ userId: req.user._id })
      .sort({ date: -1 })
      .select('date hours')
      .lean()

    let streak = 0
    const today = new Date()
    for (let i = 0; i <= allActivity.length; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const entry = allActivity.find(a => a.date === dateStr)
      if (entry && entry.hours > 0) {
        streak++
      } else if (i > 0) {
        // Allow today to be 0 (hasn't studied yet today), but break on past gap
        break
      }
    }

    user.currentStreak = streak
    if (streak > (user.longestStreak || 0)) {
      user.longestStreak = streak
    }

    // Award XP for study activity (10 XP per hour)
    user.totalXP = (user.totalXP || 0) + Math.round(hours * 10)
    await user.save()

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to log activity.' })
  }
})

// ─── Get user stats summary ───
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('totalStudyHours currentStreak longestStreak totalXP')

    // Compute live badge progress
    const progressMap = await computeLiveBadgeProgress(req.user._id)

    const completedBadges = BADGE_DEFINITIONS.filter(b => {
      return (progressMap[b.id] || 0) >= b.target
    }).length

    // Compute global rank by XP
    const rank = await User.countDocuments({ totalXP: { $gt: user.totalXP || 0 } }) + 1

    res.json({
      ok: true,
      stats: {
        totalXP: user.totalXP || 0,
        totalBadges: BADGE_DEFINITIONS.length,
        completedBadges,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        totalStudyHours: user.totalStudyHours || 0,
        rank: `#${rank}`,
      },
    })
  } catch (err) {
    console.error('Stats fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch stats.' })
  }
})

// ─── Submit quiz result (for Quiz Whiz badge tracking) ───
router.post('/quiz-result', authMiddleware, async (req, res) => {
  try {
    const { score, total } = req.body
    if (score === undefined || !total) return res.status(400).json({ error: 'score and total required.' })

    const percentage = Math.round((score / total) * 100)

    // Only count quizzes where user scored 90%+
    if (percentage >= 90) {
      await BadgeProgress.findOneAndUpdate(
        { userId: req.user._id, badgeId: 7 },
        { $inc: { current: 1 } },
        { upsert: true, new: true }
      )
    }

    // Award XP for completing a quiz (5 XP base + 1 per correct answer)
    const xpEarned = 5 + score
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalXP: xpEarned },
    })

    res.json({ ok: true, percentage, xpEarned })
  } catch (err) {
    console.error('Quiz result error:', err)
    res.status(500).json({ error: 'Failed to record quiz result.' })
  }
})

export default router
