# Quick Reference - MongoDB Connection & Session Tracking

## 🚀 Quick Start (5 Commands)

```bash
# 1. Test MongoDB connection
cd hosting/backend && node test-connection.js

# 2. Run migration
node migrate.js

# 3. Start backend
npm run dev

# 4. Start frontend (new terminal)
cd .. && npm run dev

# 5. Open browser
# Visit: http://localhost:5173
```

## 📊 MongoDB Connection

### Environment Variable
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/studyhub
```

### Test Connection
```bash
node test-connection.js
```

### Connection Status
```javascript
// In server logs, look for:
✅ MongoDB connected successfully
📊 Database: studyhub
```

## 🔌 API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get Active Rooms
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/rooms/
```

### Get User Stats
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/rooms/user/stats
```

### Create Room
```bash
curl -X POST http://localhost:5000/api/rooms/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","subject":"Math"}'
```

## 📁 Data Structure

### Room Document
```javascript
{
  _id: ObjectId,
  name: String,
  subject: String,
  createdBy: ObjectId,
  participants: [ObjectId],
  status: 'active' | 'completed' | 'scheduled',
  duration: Number,        // minutes
  maxParticipants: Number,
  ended: Boolean,
  endedAt: Date,
  createdAt: Date
}
```

### User Stats Response
```javascript
{
  activeSessions: [...],      // Currently active
  recentSessions: [...],      // Last 10 completed
  upcomingSessions: [...],    // Scheduled future
  totalHours: 45.5,
  totalSessions: 23,
  subjectDistribution: {...}
}
```

## 🔍 MongoDB Queries

### Count Active Rooms
```javascript
db.rooms.find({ status: 'active', ended: false }).count()
```

### Find User's Rooms
```javascript
db.rooms.find({ participants: ObjectId("user_id") })
```

### Calculate Total Study Time
```javascript
db.rooms.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: null, total: { $sum: '$duration' } } }
])
```

### Status Distribution
```javascript
db.rooms.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
])
```

## 🐛 Troubleshooting

### Connection Failed
```bash
# Check .env file
cat backend/.env | grep MONGO_URI

# Test with MongoDB Compass
# Use the connection string from .env
```

### Stats Showing 0
```bash
# Run migration
node migrate.js

# Check room status
mongo connection_string
db.rooms.find({ status: { $exists: false } }).count()
```

### Room Not Found
```bash
# Check if room exists
db.rooms.findOne({ _id: ObjectId("room_id") })

# Check room status
db.rooms.findOne({ _id: ObjectId("room_id") }, { status: 1, ended: 1 })
```

### Participant Count Not Updating
```bash
# Check socket connection in browser console
# Look for: Socket connected

# Check MongoDB
db.rooms.findOne({ _id: ObjectId("room_id") }, { participants: 1, maxParticipants: 1 })
```

## 📝 Common Commands

### Backend
```bash
cd hosting/backend

# Install dependencies
npm install

# Test connection
node test-connection.js

# Run migration
node migrate.js

# Start server
npm run dev

# Test API
./test-api.sh
```

### Frontend
```bash
cd hosting

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### MongoDB
```bash
# Connect to database
mongo "mongodb+srv://..."

# Use database
use studyhub

# Show collections
show collections

# Count documents
db.rooms.count()
db.users.count()
```

## 🎯 Verification Checklist

### Backend
- [ ] MongoDB connected (see ✅ in logs)
- [ ] All routes registered
- [ ] Socket.IO running
- [ ] Port 5000 accessible

### Database
- [ ] Rooms collection exists
- [ ] Users collection exists
- [ ] Indexes created
- [ ] Migration completed

### API
- [ ] Health check returns 200
- [ ] Auth endpoints work
- [ ] Room endpoints return data
- [ ] Stats endpoint returns data

### Frontend
- [ ] Dashboard shows stats
- [ ] Rooms page has 3 tabs
- [ ] Can create rooms
- [ ] Can join rooms
- [ ] Real-time updates work

## 🔗 Important Files

### Backend
- `backend/.env` - Environment variables
- `backend/db.js` - MongoDB connection
- `backend/server.js` - Express server
- `backend/routes/rooms.js` - Room API
- `backend/models/Room.js` - Room schema
- `backend/migrate.js` - Migration script
- `backend/test-connection.js` - Connection test

### Frontend
- `src/lib/roomApiV2.js` - API client
- `src/features/rooms/RoomsPage.jsx` - Rooms UI
- `src/features/dashboard/DashboardPage.jsx` - Dashboard UI
- `src/features/studyroom/StudyRoomPage.jsx` - Study room UI

### Documentation
- `MONGODB_CONNECTION_GUIDE.md` - Full connection guide
- `SESSION_TRACKING_COMPLETE.md` - System documentation
- `DATABASE_MIGRATION.md` - Migration guide
- `QUICK_START.md` - Quick start guide

## 💡 Pro Tips

1. **Always test connection first**
   ```bash
   node test-connection.js
   ```

2. **Check logs for errors**
   - Backend: Terminal running `npm run dev`
   - Frontend: Browser console (F12)

3. **Use MongoDB Compass**
   - Visual interface for database
   - Easy to verify data

4. **Monitor network tab**
   - Browser DevTools → Network
   - Check API responses

5. **Keep .env secure**
   - Never commit to git
   - Use different values for production

## 🆘 Quick Help

### Error: "MongoDB connection error"
→ Check `.env` file and network access

### Error: "Room not found"
→ Verify room exists in MongoDB

### Error: "Stats showing 0"
→ Run `node migrate.js`

### Error: "Participant count not updating"
→ Check socket connection

### Error: "Duration is 0"
→ Only new rooms track duration

## 📚 Learn More

- Full Guide: `MONGODB_CONNECTION_GUIDE.md`
- System Docs: `SESSION_TRACKING_COMPLETE.md`
- Migration: `DATABASE_MIGRATION.md`
- Quick Start: `QUICK_START.md`

---

**Ready to go!** Your MongoDB connection is configured and the session tracking system is ready to use. 🎉
