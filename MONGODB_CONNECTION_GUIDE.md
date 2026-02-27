# MongoDB Connection & Data Fetching Guide

## Overview
This guide ensures your backend is properly connected to MongoDB and fetching data correctly for the session tracking system.

## Prerequisites

### 1. MongoDB Setup
You have MongoDB Atlas configured with:
- **Connection String**: `mongodb+srv://abhiramreddyvundhyala_db_user:mlFLhYkkqb046HAC@studyhub.ln04j07.mongodb.net/studyhub`
- **Database Name**: `studyhub`
- **Collections**: `rooms`, `users`, `studysessions`, etc.

### 2. Environment Variables
Your `.env` file should contain:
```env
MONGO_URI=mongodb+srv://abhiramreddyvundhyala_db_user:mlFLhYkkqb046HAC@studyhub.ln04j07.mongodb.net/studyhub?retryWrites=true&w=majority&appName=studyhub
JWT_SECRET=studyhub-jwt-s3cr3t-k3y-2026-xK9mP2vL8nQ
GEMINI_API_KEY=AIzaSyBX-MIusFvhY81PVt5ZNwtvxYhRY6e6x6g
PORT=5000
```

## Verification Steps

### Step 1: Test MongoDB Connection

Run the connection test script:
```bash
cd hosting/backend
node test-connection.js
```

**Expected Output:**
```
🧪 Testing MongoDB Connection and Data Fetching
═══════════════════════════════════════════════

Test 1: Connecting to MongoDB...
✅ Connected successfully
📊 Database: studyhub

Test 2: Counting documents...
✅ Rooms: X
✅ Users: X

Test 3: Fetching active rooms...
✅ Found X active rooms

... (more tests)

✅ All tests passed! MongoDB connection is working correctly.
```

**If Connection Fails:**
```
❌ Test failed: connect ECONNREFUSED

Troubleshooting:
1. Check MONGO_URI in .env file
2. Ensure MongoDB is accessible
3. Verify network connectivity
4. Check database permissions
```

**Solutions:**
- Verify `.env` file exists in `hosting/backend/`
- Check MongoDB Atlas network access (allow your IP)
- Verify database user credentials
- Test connection string in MongoDB Compass

### Step 2: Run Database Migration

If test shows missing fields:
```bash
cd hosting/backend
node migrate.js
```

**Expected Output:**
```
🔄 Starting database migration...

✅ Connected to MongoDB
📊 Database: studyhub

Step 1: Adding default values to existing rooms...
   ✅ Updated X rooms with default values

Step 2: Updating ended rooms to completed status...
   ✅ Updated X ended rooms to completed status

Step 3: Calculating duration for completed rooms...
   ✅ Calculated duration for X rooms

Step 4: Setting maxParticipants for existing rooms...
   ✅ Set maxParticipants for X rooms

Step 5: Creating database indexes...
   ✅ Created all indexes

✅ Migration completed successfully!
```

### Step 3: Start Backend Server

```bash
cd hosting/backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected successfully
📊 Database: studyhub

🚀 StudyHub Backend running on http://localhost:5000
📹 WebRTC Signaling Server active
💬 Real-Time Chat active
...
```

**If Server Fails to Start:**
- Check if port 5000 is available: `lsof -i :5000`
- Verify all dependencies installed: `npm install`
- Check for syntax errors in code

### Step 4: Test API Endpoints

#### Manual Testing with curl

**Test 1: Health Check**
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"ok","message":"StudyHub Backend Running"}`

**Test 2: Get Active Rooms (Requires Auth)**
```bash
# First, login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Use the token from response
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/rooms/
```

**Test 3: Get User Stats**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/rooms/user/stats
```

Expected Response:
```json
{
  "activeSessions": [...],
  "recentSessions": [...],
  "upcomingSessions": [...],
  "totalHours": 45.5,
  "totalSessions": 23,
  "subjectDistribution": {...}
}
```

#### Automated Testing

Make the test script executable and run it:
```bash
chmod +x hosting/backend/test-api.sh
./hosting/backend/test-api.sh
```

### Step 5: Verify Frontend Connection

Start the frontend:
```bash
cd hosting
npm run dev
```

Visit http://localhost:5173 and:

1. **Login/Signup**
   - Create account or login
   - Verify JWT token is stored

2. **Check Dashboard**
   - Should show stats cards
   - Should display active rooms
   - Should show recent sessions

3. **Check Rooms Page**
   - Should show three tabs
   - Active tab should list rooms
   - Recent tab should show completed sessions

4. **Create a Room**
   - Click "Create Room"
   - Fill in details
   - Room should appear in Active tab

5. **Join a Room**
   - Click "Join Room"
   - Should navigate to StudyRoomPage
   - Should see real-time features

## Data Flow Verification

### Creating a Room

**Frontend:**
```javascript
// src/lib/roomApiV2.js
const room = await createRoom({
  name: 'Test Room',
  subject: 'Math',
  privacy: 'public'
})
```

**Backend:**
```javascript
// routes/rooms.js
POST /api/rooms/create
→ Creates Room in MongoDB
→ Returns room object
```

**Verify:**
```bash
# Check MongoDB
mongo your_connection_string
use studyhub
db.rooms.find().sort({createdAt: -1}).limit(1).pretty()
```

### Fetching Statistics

**Frontend:**
```javascript
// src/lib/roomApiV2.js
const stats = await getUserRoomStats()
```

**Backend:**
```javascript
// routes/rooms.js
GET /api/rooms/user/stats
→ Queries MongoDB for user's rooms
→ Calculates statistics
→ Returns aggregated data
```

**Verify:**
```bash
# Check API response
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/rooms/user/stats | jq
```

### Real-time Updates

**Socket Connection:**
```javascript
// Frontend connects
socket.connect()

// Backend receives
io.on('connection', (socket) => {
  // Socket connected
})
```

**Verify:**
- Open browser console
- Check for socket connection logs
- Join a room and verify participant count updates

## Common Issues & Solutions

### Issue 1: "MongoDB connection error"

**Symptoms:**
```
❌ MongoDB connection error: connect ECONNREFUSED
```

**Solutions:**
1. Check `.env` file exists and has correct `MONGO_URI`
2. Verify MongoDB Atlas network access
3. Test connection string in MongoDB Compass
4. Check if IP is whitelisted in Atlas

### Issue 2: "Room not found"

**Symptoms:**
- Frontend shows "Room not found"
- API returns 404

**Solutions:**
1. Check if room exists in MongoDB:
   ```bash
   db.rooms.find({ _id: ObjectId("room_id") })
   ```
2. Verify room ID is correct
3. Check if room was created in MongoDB (not just in-memory)

### Issue 3: "Stats showing 0"

**Symptoms:**
- Dashboard shows 0 for all stats
- No data in tabs

**Solutions:**
1. Run migration: `node migrate.js`
2. Check if rooms have status field:
   ```bash
   db.rooms.find({ status: { $exists: false } }).count()
   ```
3. Verify user has created/joined rooms
4. Check API response for errors

### Issue 4: "Duration is 0"

**Symptoms:**
- Completed rooms show 0 duration

**Solutions:**
1. Only new rooms track duration automatically
2. Run migration to calculate for existing rooms
3. Verify `endedAt` field exists:
   ```bash
   db.rooms.find({ ended: true, endedAt: { $exists: false } })
   ```

### Issue 5: "Participant count not updating"

**Symptoms:**
- Participant count stays at 0 or doesn't change

**Solutions:**
1. Check socket connection in browser console
2. Verify `syncParticipantCount` is called in server.js
3. Check MongoDB for participant array:
   ```bash
   db.rooms.findOne({ _id: ObjectId("room_id") }, { participants: 1 })
   ```

## MongoDB Queries for Debugging

### Check Room Status Distribution
```javascript
db.rooms.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

### Find Rooms Without New Fields
```javascript
db.rooms.find({
  $or: [
    { duration: { $exists: false } },
    { status: { $exists: false } },
    { maxParticipants: { $exists: false } }
  ]
}).count()
```

### Calculate Total Study Time
```javascript
db.rooms.aggregate([
  { $match: { status: 'completed', duration: { $gt: 0 } } },
  { $group: { _id: null, total: { $sum: '$duration' } } }
])
```

### Find User's Rooms
```javascript
db.rooms.find({
  participants: ObjectId("user_id")
}).sort({ createdAt: -1 })
```

### Check Active Rooms
```javascript
db.rooms.find({
  ended: false,
  status: 'active'
}).count()
```

## Performance Monitoring

### Check Query Performance
```javascript
// Enable profiling
db.setProfilingLevel(2)

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 })
```

### Verify Indexes
```javascript
db.rooms.getIndexes()
```

Expected indexes:
- `{ status: 1, ended: 1 }`
- `{ createdBy: 1, createdAt: -1 }`
- `{ participants: 1 }`
- `{ scheduledFor: 1 }`

### Monitor Connection Pool
```javascript
db.serverStatus().connections
```

## Best Practices

### 1. Always Use Environment Variables
```javascript
// ✅ Good
const MONGO_URI = process.env.MONGO_URI

// ❌ Bad
const MONGO_URI = "mongodb://hardcoded..."
```

### 2. Handle Connection Errors
```javascript
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err)
})
```

### 3. Close Connections Properly
```javascript
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})
```

### 4. Use Indexes for Queries
```javascript
// Queries on status and ended should be fast
await Room.find({ status: 'active', ended: false })
```

### 5. Limit Query Results
```javascript
// Don't fetch all rooms
await Room.find().limit(10)
```

## Summary Checklist

- [ ] MongoDB connection string in `.env`
- [ ] `test-connection.js` passes all tests
- [ ] Migration script completed successfully
- [ ] Backend server starts without errors
- [ ] API endpoints return data
- [ ] Frontend displays stats correctly
- [ ] Rooms appear in appropriate tabs
- [ ] Real-time updates work
- [ ] Socket connections established
- [ ] Participant counts update

## Next Steps

Once everything is verified:
1. Test creating rooms
2. Test joining rooms
3. Test ending rooms
4. Verify duration calculation
5. Check statistics accuracy
6. Test navigation between pages
7. Verify auto-redirects work

## Support

If issues persist:
1. Check all logs (backend console, browser console)
2. Verify MongoDB Atlas status
3. Test connection with MongoDB Compass
4. Review API responses with browser DevTools
5. Check network tab for failed requests

Your MongoDB connection should now be fully functional and fetching data correctly! 🎉
