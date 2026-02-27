# Complete Session Tracking System

## Overview
This document describes the complete session tracking system that tracks active, recent, and upcoming study sessions across the application with proper interlinking between pages.

## Architecture

### Database Layer (MongoDB)

#### Room Model Updates
```javascript
{
  name: String,
  subject: String,
  createdBy: ObjectId (User),
  participants: [ObjectId (User)],
  privacy: String,
  audio: Boolean,
  video: Boolean,
  createdAt: Date,
  ended: Boolean,
  endedAt: Date,
  
  // NEW FIELDS
  duration: Number,          // in minutes, auto-calculated
  maxParticipants: Number,   // tracks peak attendance
  scheduledFor: Date,        // for scheduled sessions
  status: String             // 'scheduled', 'active', 'completed', 'cancelled'
}
```

#### Auto-calculation
- When `ended` is set to true, the model automatically:
  - Sets `endedAt` to current time
  - Calculates `duration` in minutes
  - Updates `status` to 'completed'

### API Endpoints

#### New Endpoints

**GET /api/rooms/user/stats**
Returns comprehensive user session statistics:
```json
{
  "activeSessions": [...],      // Currently active rooms user is in
  "recentSessions": [...],      // Last 10 completed sessions
  "upcomingSessions": [...],    // Scheduled future sessions
  "totalHours": 45.5,           // Total study time
  "totalSessions": 23,          // Total completed sessions
  "subjectDistribution": {      // Time per subject
    "Math": 120,                // in minutes
    "Physics": 90
  }
}
```

**POST /api/rooms/create** (Updated)
Now supports scheduling:
```json
{
  "name": "Study Session",
  "subject": "Math",
  "scheduledFor": "2024-03-15T10:00:00Z"  // Optional
}
```

#### Updated Endpoints

**POST /api/rooms/:id/join**
- Now tracks `maxParticipants` count
- Updates participant count in real-time

**POST /api/rooms/:id/end**
- Auto-calculates session duration
- Sets status to 'completed'
- Records endedAt timestamp

**GET /api/rooms/**
- Now filters by `status: 'active'` and `ended: false`
- Only returns currently active rooms

### Frontend Components

#### RoomsPage (Completely Redesigned)

**Features:**
- Three tabs: Active, Recent, Upcoming
- Real-time updates every 10 seconds
- Session statistics display
- Proper status badges

**Tab Views:**

1. **Active Tab**
   - Shows currently running rooms
   - "Join Room" button
   - Live participant count
   - Green status badge

2. **Recent Tab**
   - Shows last 10 completed sessions
   - Displays duration and end time
   - "View Details" button
   - Gray status badge

3. **Upcoming Tab**
   - Shows scheduled future sessions
   - Displays scheduled time
   - "View Session" button
   - Blue status badge

#### DashboardPage (Enhanced)

**New Stats Cards:**
- Total Study Time (hours)
- Total Sessions (count)
- Active Now (current active rooms)
- Upcoming (scheduled sessions)

**Updated Sections:**
1. **Active Study Rooms** - Quick join active sessions
2. **Recent Sessions** - View completed session history
3. **Upcoming Sessions** - See scheduled sessions

**Charts:**
- Study Progress (7-day activity)
- Subject Distribution (from room data)

### Data Flow

#### Creating a Room
```
User → CreateRoomPage → POST /api/rooms/create
  ↓
MongoDB Room created with status='active'
  ↓
User added to createdRooms and joinedRooms arrays
  ↓
Socket connection established
  ↓
In-memory room created for real-time features
```

#### Joining a Room
```
User → RoomsPage → Click "Join Room"
  ↓
POST /api/rooms/:id/join
  ↓
User added to participants array
  ↓
maxParticipants updated if needed
  ↓
Navigate to StudyRoomPage
  ↓
Socket emits 'join-meeting'
  ↓
Real-time collaboration begins
```

#### Ending a Room
```
Host → StudyRoomPage → Click "End Room"
  ↓
POST /api/rooms/:id/end (MongoDB)
  ↓
Room.ended = true, duration calculated
  ↓
Socket emits 'end-room' event
  ↓
All participants receive 'room-ended'
  ↓
Auto-redirect to /rooms after 1 second
  ↓
In-memory room marked as ended
```

#### Leaving a Room
```
User → StudyRoomPage → Click "Leave"
  ↓
disconnectSocket() called
  ↓
Socket disconnect event
  ↓
User removed from in-memory participants
  ↓
Navigate to /rooms
  ↓
MongoDB participants array unchanged (tracks who joined)
```

### Interlinking Between Pages

#### Dashboard → Rooms
- "View All" buttons link to RoomsPage
- Active room cards have "Join" buttons → StudyRoomPage
- Recent sessions link to RoomsPage (recent tab)
- Upcoming sessions link to RoomsPage (upcoming tab)

#### Rooms → StudyRoom
- "Join Room" button → StudyRoomPage with room ID
- "View Details" (recent) → StudyRoomPage (read-only)
- "View Session" (upcoming) → StudyRoomPage (scheduled)

#### StudyRoom → Rooms
- "Leave Room" button → RoomsPage
- "End Room" (host) → Auto-redirect to RoomsPage
- Room not found → Auto-redirect to RoomsPage (3s)
- Room ended → Auto-redirect to RoomsPage (2s)

### Session State Management

#### Active Sessions
- `ended: false`
- `status: 'active'`
- Shown in: Dashboard (Active Rooms), RoomsPage (Active tab)
- Real-time participant count from socket

#### Recent Sessions
- `ended: true`
- `status: 'completed'`
- Shown in: Dashboard (Recent Sessions), RoomsPage (Recent tab)
- Displays duration and end time

#### Upcoming Sessions
- `ended: false`
- `status: 'scheduled'`
- `scheduledFor` is in the future
- Shown in: Dashboard (Upcoming), RoomsPage (Upcoming tab)

### Real-time Updates

#### Socket Events
- `join-meeting` - User joins room
- `user-joined` - Broadcast to others
- `user-left` - User disconnects
- `participants-updated` - Participant count changes
- `end-room` - Host ends session
- `room-ended` - Broadcast to all participants

#### Polling
- RoomsPage polls every 10 seconds for updates
- Dashboard loads on mount only
- StudyRoomPage fetches room info on mount

### Statistics Tracking

#### Per User
- Total study hours (sum of all session durations)
- Total sessions (count of completed rooms)
- Subject distribution (minutes per subject)
- Created rooms history
- Joined rooms history

#### Per Room
- Duration (auto-calculated on end)
- Max participants (peak attendance)
- Participant list (all who joined)
- Created/ended timestamps

### Error Handling

#### Room Not Found
1. Display error message in StudyRoomPage header
2. Show "Redirecting to rooms..." message
3. Auto-redirect after 3 seconds
4. Socket disconnects cleanly

#### Room Ended
1. Display "(Ended)" in room title
2. Show "This room has been closed" message
3. Alert participants with socket event
4. Auto-redirect after 2 seconds
5. Update status in database

#### Network Issues
- API calls have 3 retry attempts with backoff
- Socket has auto-reconnection enabled
- Graceful fallback to empty states

### UI/UX Improvements

#### Status Badges
- **Active** - Green badge, indicates live session
- **Completed** - Gray badge, shows finished session
- **Scheduled** - Blue badge, indicates future session

#### Visual Feedback
- Loading states for all data fetches
- Empty states with helpful messages
- Real-time participant count updates
- Duration display for completed sessions
- Scheduled time display for upcoming sessions

#### Navigation Flow
- Clear breadcrumb trail
- Consistent "View All" links
- Auto-redirects on errors
- Proper cleanup on navigation

## Testing Checklist

### Room Creation
- [ ] Create instant room (status='active')
- [ ] Create scheduled room (status='scheduled')
- [ ] Room appears in appropriate tab
- [ ] Creator is added to participants

### Joining Rooms
- [ ] Join active room from RoomsPage
- [ ] Join from Dashboard quick join
- [ ] Join via URL/ID modal
- [ ] Participant count updates
- [ ] maxParticipants tracks correctly

### Ending Rooms
- [ ] Host can end room
- [ ] Non-host cannot end room
- [ ] Duration calculated correctly
- [ ] Status changes to 'completed'
- [ ] All participants notified
- [ ] Auto-redirect works

### Leaving Rooms
- [ ] Socket disconnects properly
- [ ] Navigate to /rooms works
- [ ] Can rejoin same room
- [ ] Participant count updates

### Session Tracking
- [ ] Active sessions show in Active tab
- [ ] Completed sessions show in Recent tab
- [ ] Scheduled sessions show in Upcoming tab
- [ ] Dashboard stats are accurate
- [ ] Subject distribution calculates correctly

### Navigation
- [ ] Dashboard → Rooms works
- [ ] Rooms → StudyRoom works
- [ ] StudyRoom → Rooms works
- [ ] All "View All" links work
- [ ] Auto-redirects function properly

### Real-time Updates
- [ ] Participant count updates live
- [ ] Room ended event received
- [ ] Polling updates room lists
- [ ] Socket reconnection works

## Performance Considerations

### Database Queries
- Indexed fields: `createdBy`, `participants`, `status`, `ended`
- Populate only necessary fields (name, email)
- Limit results (10 for recent, 5 for dashboard)
- Sort by relevant dates

### Frontend Optimization
- Polling interval: 10 seconds (not too aggressive)
- Conditional rendering based on loading states
- Memoized calculations where possible
- Cleanup on component unmount

### Socket Management
- Single socket connection per user
- Proper disconnect on navigation
- Room-based event broadcasting
- Cleanup empty rooms after 10 minutes

## Future Enhancements

### Potential Features
1. **Session Analytics**
   - Average session duration
   - Peak activity times
   - Retention metrics

2. **Advanced Scheduling**
   - Recurring sessions
   - Calendar integration
   - Reminder notifications

3. **Room Templates**
   - Save room configurations
   - Quick create from template
   - Subject-specific defaults

4. **Collaboration History**
   - Export session notes
   - Download chat logs
   - Resource archives

5. **Performance Metrics**
   - Study streak tracking
   - Goal setting and tracking
   - Achievement badges

## Deployment Notes

### Environment Variables
```env
MONGODB_URI=mongodb://...
JWT_SECRET=...
GEMINI_API_KEY=...
```

### Database Migration
Run this to add new fields to existing rooms:
```javascript
db.rooms.updateMany(
  { duration: { $exists: false } },
  { 
    $set: { 
      duration: 0,
      maxParticipants: 0,
      status: 'active'
    }
  }
)
```

### Index Creation
```javascript
db.rooms.createIndex({ status: 1, ended: 1 })
db.rooms.createIndex({ createdBy: 1, createdAt: -1 })
db.rooms.createIndex({ participants: 1 })
db.rooms.createIndex({ scheduledFor: 1 })
```

## Summary

The complete session tracking system now provides:
✅ Active session monitoring
✅ Recent session history
✅ Upcoming session scheduling
✅ Comprehensive statistics
✅ Proper interlinking between pages
✅ Real-time updates
✅ Clean state management
✅ Error handling and auto-redirects
✅ Duration tracking
✅ Subject distribution analytics

All pages are now properly connected with consistent data flow and user experience.
