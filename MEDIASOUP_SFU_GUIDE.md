# Mediasoup SFU Implementation Guide

## What Changed

### Architecture Transformation

**Before (Mesh/P2P):**
```
User A ←→ User B
  ↓  ×  ↙
User C

- Each user connects to every other user
- 3 users = 3 connections
- 10 users = 45 connections
- High bandwidth per user
- Connection failures common
```

**After (SFU with Mediasoup):**
```
User A → SFU Server → User B
User C → SFU Server ↗

- Each user connects to server once
- 3 users = 3 connections
- 10 users = 10 connections
- Low bandwidth per user
- Reliable connections
```

## Benefits of SFU

### 1. Scalability
- **Mesh**: 10 users = 45 peer connections (fails)
- **SFU**: 10 users = 10 server connections (works)
- **SFU**: 100 users = 100 server connections (still works!)

### 2. Reliability
- No P2P connection failures
- No TURN server issues
- Server has public IP
- Works behind firewalls

### 3. Bandwidth
- **Mesh**: Upload bandwidth × (n-1) users
- **SFU**: Upload bandwidth × 1 (to server)
- Example: 10 users, 2 Mbps stream
  - Mesh: 18 Mbps upload needed
  - SFU: 2 Mbps upload needed

### 4. Quality Control
- Server can adjust quality per user
- Simulcast support (multiple qualities)
- Bandwidth adaptation
- Better for mobile users

## Files Created/Modified

### Backend

**New Files:**
- `backend/mediasoup-server.js` - Mediasoup SFU logic
  - Worker management
  - Router creation
  - Transport handling
  - Producer/Consumer management

**Modified:**
- `backend/server.js`
  - Import Mediasoup server
  - Initialize on startup
  - Add socket handlers for SFU
  - Cleanup on disconnect

**New Socket Events:**
- `getRouterRtpCapabilities` - Get codec capabilities
- `createWebRtcTransport` - Create send/recv transport
- `connectTransport` - Connect transport with DTLS
- `produce` - Send media to server
- `consume` - Receive media from server
- `resumeConsumer` - Resume paused consumer
- `pauseConsumer` - Pause consumer
- `closeProducer` - Close producer
- `getProducers` - Get existing producers

### Frontend

**New Files:**
- `src/features/studyroom/components/VideoPanelSFU.jsx` - SFU client
  - Mediasoup Device initialization
  - Transport creation
  - Producer/Consumer management
  - Stream handling

**Modified:**
- `src/features/studyroom/StudyRoomPage.jsx`
  - Import VideoPanelSFU instead of VideoPanel
  - Use SFU component

## How It Works

### 1. Connection Flow

```
1. User joins room
   ↓
2. Get router RTP capabilities from server
   ↓
3. Load Mediasoup Device with capabilities
   ↓
4. Create send transport (for uploading)
   ↓
5. Create receive transport (for downloading)
   ↓
6. Produce local video/audio tracks
   ↓
7. Get list of existing producers
   ↓
8. Consume each existing producer
   ↓
9. Listen for new producers joining
```

### 2. Media Flow

**Sending (Producing):**
```
User's Camera/Mic
  ↓
MediaStream
  ↓
Send Transport
  ↓
Server Router
  ↓
(Forwarded to all consumers)
```

**Receiving (Consuming):**
```
Server Router
  ↓
Receive Transport
  ↓
Consumer
  ↓
MediaStream
  ↓
Video Element
```

### 3. Transport Types

**Send Transport:**
- One per user
- Uploads video/audio to server
- Multiple producers (video + audio)

**Receive Transport:**
- One per user
- Downloads video/audio from server
- Multiple consumers (one per remote track)

## Deployment

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install mediasoup@3

# Frontend
cd ..
npm install mediasoup-client@3
```

### 2. Configure Mediasoup

**Environment Variables (Render):**

```
# Required for production
MEDIASOUP_ANNOUNCED_IP=your-server-public-ip

# Optional
MEDIASOUP_WORKERS=2
```

**Get your server IP:**
```bash
curl ifconfig.me
```

### 3. Port Configuration

**Render.com:**
- HTTP/HTTPS: Automatic
- WebRTC ports: 40000-49999 UDP

**Important:** Render may not support UDP ports. For production, use:
- AWS EC2
- DigitalOcean Droplet
- Google Cloud Compute
- Dedicated server

### 4. Deploy

```bash
git add .
git commit -m "Implement Mediasoup SFU architecture"
git push origin main
```

## Testing

### 1. Local Testing

```bash
# Backend
cd backend
npm start

# Frontend (new terminal)
npm run dev
```

Open multiple browser tabs to test.

### 2. Production Testing

1. Deploy to Render
2. Wait for deployment
3. Clear browser cache
4. Open room in multiple tabs/devices
5. Check console for SFU logs

### Expected Console Output

**User 1 (First to join):**
```
🎬 [SFU] Connecting to room abc123...
📹 Requesting camera and microphone...
✅ Media stream acquired
🔌 Connecting socket...
✅ Socket connected: xyz
🎬 Initializing Mediasoup device...
✅ Got router RTP capabilities
✅ Device loaded
📤 Creating send transport...
✅ Send transport created
📥 Creating receive transport...
✅ Receive transport created
📤 Producing local tracks...
✅ Producing video track: prod-123
✅ Producing audio track: prod-456
📥 Getting existing producers...
✅ Found 0 existing producers
✅ Successfully connected to SFU room
```

**User 2 (Joins existing room):**
```
🎬 [SFU] Connecting to room abc123...
... (same as above) ...
📥 Getting existing producers...
✅ Found 2 existing producers
📥 Consuming producer prod-123 from peer xyz
✅ Consuming video from peer xyz
📥 Consuming producer prod-456 from peer xyz
✅ Consuming audio from peer xyz
✅ Successfully connected to SFU room
```

**User 1 (Receives new peer):**
```
🆕 New producer video from peer abc
📥 Consuming producer prod-789 from peer abc
✅ Consuming video from peer abc
🆕 New producer audio from peer abc
📥 Consuming producer prod-012 from peer abc
✅ Consuming audio from peer abc
```

## Troubleshooting

### Issue: "Unsupported engine" warning

**Cause:** Mediasoup requires Node.js 22+

**Solution:**
```bash
# Update Node.js
nvm install 22
nvm use 22
```

Or ignore the warning - it should still work on Node 21.

### Issue: Connection fails on Render

**Cause:** Render doesn't support UDP ports for WebRTC

**Solutions:**

1. **Use TCP transport** (add to mediasoup config):
```javascript
webRtcTransport: {
  enableUdp: false,
  enableTcp: true,
  preferTcp: true,
}
```

2. **Use different hosting:**
- AWS EC2 (best for WebRTC)
- DigitalOcean Droplet
- Google Cloud Compute
- Dedicated server

### Issue: "Router not found"

**Cause:** Room was cleaned up or server restarted

**Solution:** Refresh page and rejoin room

### Issue: No video/audio

**Check:**
1. Console for errors
2. Camera/mic permissions
3. Server logs on Render
4. Network connectivity

## Performance Tuning

### 1. Worker Configuration

```javascript
// Use multiple workers for load balancing
MEDIASOUP_WORKERS=4  // Number of CPU cores
```

### 2. Codec Configuration

```javascript
// Prefer VP8 for compatibility
// VP9 for better quality
// H.264 for hardware encoding
```

### 3. Bitrate Limits

```javascript
maxIncomingBitrate: 1500000,  // 1.5 Mbps
initialAvailableOutgoingBitrate: 1000000,  // 1 Mbps
```

### 4. Simulcast (Advanced)

Enable multiple quality layers:
```javascript
const producer = await transport.produce({
  track,
  encodings: [
    { maxBitrate: 100000 },  // Low quality
    { maxBitrate: 300000 },  // Medium quality
    { maxBitrate: 900000 },  // High quality
  ],
})
```

## Scaling Further

### For 100+ Users

**Option 1: Vertical Scaling**
- Bigger server (more CPU/RAM)
- Multiple workers
- Can handle ~100-200 users

**Option 2: Horizontal Scaling**
- Multiple Mediasoup servers
- Load balancer
- Redis for state sharing
- Can handle 1000+ users

**Option 3: Use Managed Service**
- LiveKit (open source SFU)
- Janus Gateway
- Jitsi
- Commercial: Twilio, Agora, Daily.co

## Comparison

### Mesh vs SFU vs MCU

| Feature | Mesh (P2P) | SFU | MCU |
|---------|-----------|-----|-----|
| Max users | 4-6 | 100+ | 1000+ |
| Bandwidth | High | Medium | Low |
| CPU (client) | High | Low | Low |
| CPU (server) | None | Medium | High |
| Latency | Low | Low | Medium |
| Quality | Variable | Good | Best |
| Cost | Free | Low | High |

**Recommendation:**
- 2-6 users: Mesh (P2P)
- 6-100 users: SFU (Mediasoup)
- 100+ users: MCU or managed service

## Next Steps

1. **Deploy and test** with multiple users
2. **Monitor performance** (CPU, bandwidth, latency)
3. **Add simulcast** for better quality adaptation
4. **Implement recording** (optional)
5. **Add screen sharing** via SFU
6. **Consider managed service** for production

## Resources

- Mediasoup docs: https://mediasoup.org/documentation/
- Mediasoup client: https://mediasoup.org/documentation/v3/mediasoup-client/
- WebRTC basics: https://webrtc.org/
- SFU architecture: https://webrtcglossary.com/sfu/

## Support

If you encounter issues:
1. Check console logs (both client and server)
2. Verify Node.js version (22+)
3. Check network connectivity
4. Review Mediasoup documentation
5. Consider using managed service for production
