import { io } from 'socket.io-client'

// Use environment variable for production, fallback to deployed backend
const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://sahvikaas.onrender.com'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect()
  }
}
