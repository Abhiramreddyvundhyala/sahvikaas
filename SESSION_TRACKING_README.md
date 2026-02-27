# Session Tracking System - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)
8. [Documentation](#documentation)

## 🎯 Overview

The Session Tracking System is a comprehensive solution for managing study room sessions in the StudyHub application. It tracks active, recent, and upcoming sessions with full statistics and analytics.

### What's New
- ✅ Active session monitoring
- ✅ Recent session history (last 10)
- ✅ Upcoming scheduled sessions
- ✅ Automatic duration tracking
- ✅ Peak participant tracking
- ✅ Subject distribution analytics
- ✅ Real-time updates
- ✅ Seamless page interlinking

## 🚀 Features

### For Users
- **Dashboard Overview**: See total study time, sessions, and active rooms at a glance
- **Session History**: View all past study sessions with duration and participants
- **Upcoming Sessions**: Schedule and view future study sessions
- **Real-time Updates**: Live participant counts and session status
- **Statistics**: Track study time by subject and view progress charts

### For Developers
- **RESTful API**: Clean endpoints for all session operations
- **Socket.IO Integration**: Real-time collaboration features
- **MongoDB Storage**: Persistent session data
- **Auto-calculation**: Duration and statistics computed automatically
- **Comprehensive Docs**: Full documentation and migration guides

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React, React Router, Recharts
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO for live updates

### Data Flow
```
User Action → Frontend Component → API Call → Backend Route
     ↓                                              ↓
Socket Event ← Real-time Update ← Database Update
     ↓
UI Update
```

### Database Schema
```javascript
Room {
  name: String,
  subject: String,
  createdBy: ObjectId,
  participants: [ObjectId],
  status: 'active' | 'completed' | 'scheduled' | 'cancelled',
  duration: Number,        // minutes
  maxParticipants: Number,
  scheduledFor: Date,
  ended: Boolean,
  endedAt: Date,
  createdAt: Date
}
```

## 📦 Installation

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Step 1: Clone and Install
```bash
cd hosting

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Step 2: Environment Setup
Create `hosting/backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/studyhub
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### Step 3: Database Migration
```bash
cd hosting/backend
node migrate.js
```

Expected output:
```
✅ Connected to MongoDB
✅ Updated X rooms with default values
✅ Updated X ended rooms to completed status
✅ Calculated duration for X rooms
✅ Set maxParticipants for X rooms
✅ Created all indexes
✅ Migration completed successfully!
```

### Step 4: Start Services
```bash
# Terminal 1 - Backend
cd hosting/backend
npm run dev

# Terminal 2 - Frontend
cd hosting
npm run dev
```

### Step 5: Verify Installation
Visit http://localhost:5173 and:
1. Login/Signup
2. Navigate to Dashboard - should see stats
3. Navigate to Rooms - should see three tabs
4. Create a test room
5. Verify it appears in Active tab

## 💻 Usage

### Creating a Room
```javascript
// Frontend
import { createRoom } from '../../lib/roomApiV2'

const room = await createRoom({
  name: 'Math Study Session',
  subject: 'Calculus',
  privacy: 'public',
  audio: true,
  video: true,
  scheduledFor: '2024-03-15T10:00:00Z' // Optional
})
```

### Getting User Statistics
```javascript
// Frontend
import { getUserRoomStats } from '../../lib/roomApiV2'

const stats = await getUserRoomStats()
// Returns: activeSessions, recentSessions, upcomingSessions, totalHours, etc.
```

### Joining a Room
```javascript
// Frontend
import { joinRoom } from '../../lib/roomApiV2'

await joinRoom(roomId)
// User added to participants, maxParticipants updated
```

### Ending a Room
```javascript
// Frontend (Host only)
import { endRoom } from '../../lib/roomApiV2'

await endRoom(roomId)
// Duration calculated, status set to 'completed'
```

## 📡 API Reference

### Endpoints

#### POST /api/rooms/create
Create a new room.

**Request:**
```json
{
  "name": "Study Session",
  "subject": "Math",
  "privacy": "public",
  "audio": true,
  "video": true,
  "scheduledFor": "2024-03-15T10:00:00Z"
}
```

**Response:**
```json
{
  "ok": true,
  "room": {
    "_id": "...",
    "name": "Study Session",
    "status": "active",
    ...
  }
}
```

#### GET /api/rooms/
Get all active rooms.

**Response:**
```json
{
  "rooms": [
    {
      "_id": "...",
      "name": "Study Session",
      "subject": "Math",
      "participants": [...],
      "createdBy": {...}
    }
  ]
}
```

#### GET /api/rooms/user/stats
Get user session statistics.

**Response:**
```json
{
  "activeSessions": [...],
  "recentSessions": [...],
  "upcomingSessions": [...],
  "totalHours": 45.5,
  "totalSessions": 23,
  "subjectDistribution": {
    "Math": 120,
    "Physics": 90
  }
}
```

#### POST /api/rooms/:id/join
Join a room.

**Response:**
```json
{
  "ok": true,
  "room": {...}
}
```

#### POST /api/rooms/:id/end
End a room (host only).

**Response:**
```json
{
  "ok": true,
  "room": {
    "ended": true,
    "endedAt": "...",
    "duration": 45,
    "status": "completed"
  }
}
```

### Socket Events

#### Client → Server
- `join-meeting` - Join a room
- `end-room` - End room (host only)
- `disconnect` - Leave room

#### Server → Client
- `room-ended` - Room was ended
- `user-joined` - New user joined
- `user-left` - User left
- `participants-updated` - Participant list changed

## 🔧 Troubleshooting

### Common Issues

#### 1. Stats Not Showing
**Symptoms**: Dashboard shows 0 for all stats

**Solutions**:
```bash
# Check API endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/rooms/user/stats

# Run migration
cd backend
node migrate.js

# Check database
mongo your_mongodb_uri
use studyhub
db.rooms.find().limit(5).pretty()
```

#### 2. Rooms Not Appearing in Tabs
**Symptoms**: Tabs are empty despite having rooms

**Solutions**:
```bash
# Check room status
db.rooms.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

# Update room status
db.rooms.updateMany(
  { ended: false, status: { $exists: false } },
  { $set: { status: 'active' } }
)
```

#### 3. Duration is 0
**Symptoms**: Completed rooms show 0 duration

**Solutions**:
- Only new rooms track duration automatically
- Old rooms need manual calculation
- Run migration script to calculate for existing rooms

#### 4. Auto-redirect Not Working
**Symptoms**: Stays on error page

**Solutions**:
```javascript
// Check console for errors
// Verify navigate function is imported
import { useNavigate } from 'react-router-dom'

// Check timeout values in StudyRoomPage.jsx
setTimeout(() => navigate('/rooms'), 3000)
```

### Debug Mode

Enable debug logging:
```javascript
// In backend/server.js
const DEBUG = true

if (DEBUG) {
  console.log('Room state:', room)
  console.log('Participants:', getParticipantsList(room))
}
```

## 📚 Documentation

### Complete Documentation Files

1. **SESSION_TRACKING_COMPLETE.md**
   - Complete system architecture
   - Data flow diagrams
   - Feature specifications
   - Testing checklist

2. **DATABASE_MIGRATION.md**
   - Step-by-step migration guide
   - Rollback procedures
   - Verification steps
   - Common issues

3. **IMPLEMENTATION_SUMMARY.md**
   - Files modified
   - Changes made
   - API endpoints
   - Testing checklist

4. **QUICK_START.md**
   - 5-minute setup guide
   - Quick reference
   - Troubleshooting tips
   - Success indicators

5. **ROOM_STATE_FIX.md**
   - Previous room state fixes
   - Socket cleanup
   - Error handling

### Code Examples

#### Custom Hook for Room Stats
```javascript
// useRoomStats.js
import { useState, useEffect } from 'react'
import { getUserRoomStats } from '../lib/roomApiV2'

export function useRoomStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getUserRoomStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return { stats, loading }
}
```

#### Room Status Badge Component
```javascript
// StatusBadge.jsx
export function StatusBadge({ status }) {
  const classes = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
```

## 🧪 Testing

### Manual Testing Checklist

#### Room Lifecycle
- [ ] Create room → appears in Active tab
- [ ] Join room → participant count increases
- [ ] Leave room → participant count decreases
- [ ] End room → moves to Recent tab
- [ ] Duration calculated correctly
- [ ] Status updates properly

#### Navigation
- [ ] Dashboard → Rooms works
- [ ] Rooms → StudyRoom works
- [ ] StudyRoom → Rooms works
- [ ] Auto-redirects function
- [ ] All "View All" links work

#### Statistics
- [ ] Total hours accurate
- [ ] Total sessions accurate
- [ ] Subject distribution correct
- [ ] Active count real-time
- [ ] Recent shows last 10

### Automated Testing

```javascript
// Example test
describe('Room Statistics', () => {
  it('should calculate total hours correctly', async () => {
    const stats = await getUserRoomStats()
    expect(stats.totalHours).toBeGreaterThanOrEqual(0)
  })

  it('should return recent sessions', async () => {
    const stats = await getUserRoomStats()
    expect(stats.recentSessions).toBeInstanceOf(Array)
    expect(stats.recentSessions.length).toBeLessThanOrEqual(10)
  })
})
```

## 🚀 Deployment

### Production Checklist

- [ ] Run database migration
- [ ] Create indexes
- [ ] Set environment variables
- [ ] Build frontend (`npm run build`)
- [ ] Test API endpoints
- [ ] Verify socket connections
- [ ] Monitor logs
- [ ] Backup database

### Environment Variables (Production)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong_random_secret
GEMINI_API_KEY=your_api_key
NODE_ENV=production
PORT=5000
```

### Build Commands
```bash
# Frontend
npm run build

# Backend
npm start
```

## 📊 Performance

### Optimization Tips

1. **Database Queries**
   - Use indexes for frequently queried fields
   - Limit results (10 for recent, 5 for dashboard)
   - Populate only necessary fields

2. **Frontend**
   - Polling interval: 10 seconds
   - Conditional rendering
   - Cleanup on unmount

3. **Socket**
   - Single connection per user
   - Room-based broadcasting
   - Proper disconnect handling

### Monitoring

```javascript
// Track API response times
console.time('getUserRoomStats')
const stats = await getUserRoomStats()
console.timeEnd('getUserRoomStats')

// Monitor socket connections
io.on('connection', (socket) => {
  console.log(`Total connections: ${io.engine.clientsCount}`)
})
```

## 🤝 Contributing

### Development Workflow

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Update documentation
5. Submit pull request

### Code Style

- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is part of the StudyHub application.

## 🆘 Support

For issues or questions:
1. Check documentation files
2. Review troubleshooting section
3. Check console logs
4. Verify database connection
5. Test API endpoints with curl

## ✨ Summary

The Session Tracking System provides:
- ✅ Complete session lifecycle management
- ✅ Real-time updates and notifications
- ✅ Comprehensive statistics and analytics
- ✅ Seamless navigation between pages
- ✅ Automatic duration tracking
- ✅ Clean API and socket integration
- ✅ Full documentation and migration support

Ready to track your study sessions! 📚🎓
