# Quick Start Guide - Session Tracking System

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
# Backend
cd hosting/backend
npm install

# Frontend
cd ..
npm install
```

### Step 2: Set Environment Variables
Create `hosting/backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### Step 3: Run Database Migration
```bash
cd hosting/backend
node migrate.js
```

Expected output:
```
Connected to MongoDB
Updated X rooms with default values
Updated X ended rooms to completed status
Calculated duration for X rooms
Set maxParticipants for X rooms
Migration completed successfully!
```

### Step 4: Start the Application
```bash
# Terminal 1 - Backend
cd hosting/backend
npm run dev

# Terminal 2 - Frontend
cd hosting
npm run dev
```

### Step 5: Test the Features

#### Create a Room
1. Navigate to http://localhost:5173
2. Login/Signup
3. Click "Study Rooms" in sidebar
4. Click "Create Room"
5. Fill in details and create

#### View Sessions
1. Go to Dashboard - see stats overview
2. Go to Rooms page - see three tabs:
   - **Active**: Currently running rooms
   - **Recent**: Completed sessions
   - **Upcoming**: Scheduled sessions

#### Join a Room
1. Click "Join Room" on any active room
2. Collaborate in real-time
3. Click "Leave Room" to exit

#### End a Room (Host Only)
1. As room creator, click "End Room"
2. Confirm the action
3. All participants are notified
4. Room moves to "Recent" tab

## 📊 What You'll See

### Dashboard
- **4 Stat Cards**: Total hours, sessions, active, upcoming
- **Active Rooms**: Quick join active sessions
- **Recent Sessions**: View completed session history
- **Upcoming Sessions**: See scheduled sessions
- **Charts**: Study progress and subject distribution

### Rooms Page
- **Active Tab**: Live rooms with "Join" button
- **Recent Tab**: Completed sessions with duration
- **Upcoming Tab**: Scheduled sessions with time

### Study Room
- Real-time collaboration
- Video/audio controls
- Chat, notes, tasks, resources
- Leave/End room buttons
- Auto-redirect on errors

## 🔍 Verify Everything Works

### Test Checklist
```bash
# 1. Check API endpoints
curl http://localhost:5000/api/health
# Should return: {"status":"ok","message":"StudyHub Backend Running"}

# 2. Check rooms endpoint (with auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/rooms/user/stats
# Should return user statistics

# 3. Check active rooms
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/rooms/
# Should return list of active rooms
```

### Frontend Checks
- [ ] Dashboard loads with stats
- [ ] Rooms page shows three tabs
- [ ] Can create a room
- [ ] Can join a room
- [ ] Can leave a room
- [ ] Host can end a room
- [ ] Stats update correctly

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB connection
mongo your_mongodb_uri

# Check environment variables
cat backend/.env

# Check port availability
lsof -i :5000
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Vite config
cat vite.config.js
```

### Stats not showing
```bash
# Run migration again
cd backend
node migrate.js

# Check database
mongo your_mongodb_uri
use studyhub
db.rooms.find().limit(5).pretty()
```

### Rooms not appearing
```bash
# Check room status
db.rooms.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

# Should show: active, completed, scheduled
```

## 📝 Quick Reference

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rooms/create` | POST | Create room |
| `/api/rooms/` | GET | Get active rooms |
| `/api/rooms/:id` | GET | Get room details |
| `/api/rooms/:id/join` | POST | Join room |
| `/api/rooms/:id/end` | POST | End room |
| `/api/rooms/user/stats` | GET | Get user stats |

### Socket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `join-meeting` | Client → Server | Join room |
| `end-room` | Client → Server | End room |
| `room-ended` | Server → Client | Room ended |
| `participants-updated` | Server → Client | Participant list changed |

### Room Status Values
- `active` - Currently running
- `completed` - Finished session
- `scheduled` - Future session
- `cancelled` - Cancelled session

## 🎯 Next Steps

### Customize
1. Adjust polling interval in `RoomsPage.jsx` (line 50)
2. Change stats card colors in `DashboardPage.jsx`
3. Modify tab labels in `RoomsPage.jsx`

### Extend
1. Add session analytics
2. Implement recurring sessions
3. Add calendar integration
4. Export session history

### Deploy
1. Build frontend: `npm run build`
2. Deploy backend to your server
3. Update environment variables
4. Run migration on production DB

## 📚 Documentation

- `SESSION_TRACKING_COMPLETE.md` - Full system documentation
- `DATABASE_MIGRATION.md` - Migration guide
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `ROOM_STATE_FIX.md` - Previous fixes

## 💡 Tips

1. **Development**: Use `npm run dev` for hot reload
2. **Production**: Use `npm run build` and serve static files
3. **Database**: Backup before migration
4. **Testing**: Test with multiple users/browsers
5. **Monitoring**: Check logs for errors

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Dashboard shows accurate stats
- ✅ Rooms page has three functional tabs
- ✅ Can create and join rooms
- ✅ Duration is calculated on room end
- ✅ Auto-redirects work properly
- ✅ Real-time updates happen
- ✅ No console errors

## 🆘 Need Help?

1. Check the documentation files
2. Review console logs (browser & server)
3. Verify database connection
4. Check API responses
5. Test with curl commands

## 🎉 You're Ready!

The session tracking system is now fully functional. Users can:
- Create and join study rooms
- View active, recent, and upcoming sessions
- Track study time and statistics
- Navigate seamlessly between pages
- Collaborate in real-time

Happy studying! 📚✨
