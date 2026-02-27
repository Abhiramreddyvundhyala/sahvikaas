# Database Migration Guide

## Overview
This guide helps you migrate existing Room data to support the new session tracking features.

## Changes to Room Schema

### New Fields Added
```javascript
{
  duration: Number,          // Session duration in minutes
  maxParticipants: Number,   // Peak participant count
  scheduledFor: Date,        // Scheduled start time (optional)
  status: String             // 'scheduled', 'active', 'completed', 'cancelled'
}
```

### Pre-save Hook Added
Automatically calculates duration when room ends.

## Migration Steps

### Step 1: Backup Your Database
```bash
# MongoDB backup
mongodump --uri="your_mongodb_uri" --out=./backup

# Or using MongoDB Atlas
# Use the Atlas UI to create a backup snapshot
```

### Step 2: Update Existing Rooms

#### Option A: Using MongoDB Shell
```javascript
// Connect to your database
use studyhub

// Update all existing rooms with default values
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

// Update ended rooms to have 'completed' status
db.rooms.updateMany(
  { ended: true, status: { $ne: 'completed' } },
  { 
    $set: { 
      status: 'completed'
    }
  }
)

// Calculate duration for ended rooms (if endedAt exists)
db.rooms.find({ ended: true, endedAt: { $exists: true } }).forEach(function(room) {
  var duration = Math.round((room.endedAt - room.createdAt) / 60000);
  db.rooms.updateOne(
    { _id: room._id },
    { $set: { duration: duration } }
  );
});

// Set maxParticipants to current participant count
db.rooms.find({}).forEach(function(room) {
  var count = room.participants ? room.participants.length : 0;
  db.rooms.updateOne(
    { _id: room._id },
    { $set: { maxParticipants: count } }
  );
});
```

#### Option B: Using Node.js Script
Create a file `migrate.js`:

```javascript
import mongoose from 'mongoose';
import Room from './backend/models/Room.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update rooms without new fields
    const result1 = await Room.updateMany(
      { duration: { $exists: false } },
      { 
        $set: { 
          duration: 0,
          maxParticipants: 0,
          status: 'active'
        }
      }
    );
    console.log(`Updated ${result1.modifiedCount} rooms with default values`);

    // Update ended rooms
    const result2 = await Room.updateMany(
      { ended: true, status: { $ne: 'completed' } },
      { $set: { status: 'completed' } }
    );
    console.log(`Updated ${result2.modifiedCount} ended rooms to completed status`);

    // Calculate duration for ended rooms
    const endedRooms = await Room.find({ 
      ended: true, 
      endedAt: { $exists: true },
      duration: 0
    });

    for (const room of endedRooms) {
      const duration = Math.round((room.endedAt - room.createdAt) / 60000);
      room.duration = duration;
      await room.save();
    }
    console.log(`Calculated duration for ${endedRooms.length} rooms`);

    // Set maxParticipants
    const allRooms = await Room.find({ maxParticipants: 0 });
    for (const room of allRooms) {
      room.maxParticipants = room.participants?.length || 0;
      await room.save();
    }
    console.log(`Set maxParticipants for ${allRooms.length} rooms`);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

Run the migration:
```bash
node migrate.js
```

### Step 3: Create Indexes

```javascript
// In MongoDB shell
use studyhub

// Create indexes for better query performance
db.rooms.createIndex({ status: 1, ended: 1 })
db.rooms.createIndex({ createdBy: 1, createdAt: -1 })
db.rooms.createIndex({ participants: 1 })
db.rooms.createIndex({ scheduledFor: 1 })
db.rooms.createIndex({ endedAt: -1 })

// Verify indexes
db.rooms.getIndexes()
```

### Step 4: Verify Migration

```javascript
// Check rooms with new fields
db.rooms.find({ duration: { $exists: true } }).count()
db.rooms.find({ maxParticipants: { $exists: true } }).count()
db.rooms.find({ status: { $exists: true } }).count()

// Check status distribution
db.rooms.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Check completed rooms with duration
db.rooms.find({ 
  status: 'completed', 
  duration: { $gt: 0 } 
}).count()

// Sample a few rooms to verify data
db.rooms.find().limit(5).pretty()
```

## Rollback Plan

If you need to rollback:

```javascript
// Remove new fields
db.rooms.updateMany(
  {},
  { 
    $unset: { 
      duration: "",
      maxParticipants: "",
      scheduledFor: "",
      status: ""
    }
  }
)

// Drop new indexes
db.rooms.dropIndex("status_1_ended_1")
db.rooms.dropIndex("scheduledFor_1")
```

Then restore from backup:
```bash
mongorestore --uri="your_mongodb_uri" ./backup
```

## Post-Migration Checks

### 1. Verify API Endpoints
```bash
# Test stats endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/rooms/user/stats

# Test active rooms
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/rooms/
```

### 2. Check Frontend
- Visit Dashboard - should show stats
- Visit Rooms page - should show tabs
- Create a new room - should have status='active'
- End a room - should calculate duration

### 3. Monitor Logs
```bash
# Backend logs
npm run dev

# Watch for any errors related to:
# - Room model validation
# - Missing fields
# - Query errors
```

## Common Issues

### Issue 1: Duration is 0 for old rooms
**Solution:** Old rooms without endedAt won't have duration. This is expected. Only new rooms will track duration properly.

### Issue 2: maxParticipants seems low
**Solution:** This field tracks peak attendance. For old rooms, it's set to current participant count, which may not reflect actual peak.

### Issue 3: Status field missing
**Solution:** Run the migration script again. Ensure all rooms have a status field.

### Issue 4: Scheduled rooms not showing
**Solution:** Only new rooms created with scheduledFor will appear in upcoming. Old rooms won't have this field.

## Data Integrity Checks

Run these queries periodically:

```javascript
// Rooms without status
db.rooms.find({ status: { $exists: false } }).count()
// Should be 0

// Active rooms that are ended
db.rooms.find({ status: 'active', ended: true }).count()
// Should be 0

// Completed rooms without duration
db.rooms.find({ 
  status: 'completed', 
  duration: 0,
  endedAt: { $exists: true }
}).count()
// Should be 0

// Rooms with negative duration
db.rooms.find({ duration: { $lt: 0 } }).count()
// Should be 0
```

## Performance Monitoring

After migration, monitor:

1. **Query Performance**
   ```javascript
   // Check slow queries
   db.setProfilingLevel(2)
   db.system.profile.find({ millis: { $gt: 100 } })
   ```

2. **Index Usage**
   ```javascript
   db.rooms.aggregate([
     { $indexStats: {} }
   ])
   ```

3. **Collection Stats**
   ```javascript
   db.rooms.stats()
   ```

## Maintenance

### Weekly Tasks
- Check for rooms stuck in 'active' status
- Clean up old completed rooms (optional)
- Verify duration calculations

### Monthly Tasks
- Analyze subject distribution
- Review session statistics
- Optimize indexes if needed

## Support

If you encounter issues:
1. Check the logs for error messages
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Review the migration verification steps
5. Check the common issues section

## Summary

✅ Backup database before migration
✅ Run migration scripts
✅ Create indexes
✅ Verify data integrity
✅ Test API endpoints
✅ Monitor performance
✅ Have rollback plan ready

The migration is non-destructive and adds new fields without removing existing data.
