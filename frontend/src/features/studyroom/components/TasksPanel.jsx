import { useState, useEffect } from 'react'
import Modal from '../../../components/ui/Modal'
import { getSocket } from '../../../lib/socket'

export default function TasksPanel({ roomId }) {
  const [tasks, setTasks] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTask, setNewTask] = useState({ text: '', dueDate: '', dueTime: '09:00' })

  // Subscribe to real-time task events
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleRoomState = (state) => {
      if (state.tasks) setTasks(state.tasks)
    }

    const handleTasksUpdated = (updatedTasks) => {
      setTasks(updatedTasks)
    }

    socket.on('room-state', handleRoomState)
    socket.on('tasks-updated', handleTasksUpdated)

    return () => {
      socket.off('room-state', handleRoomState)
      socket.off('tasks-updated', handleTasksUpdated)
    }
  }, [])

  const addTask = () => {
    if (!newTask.text.trim()) return
    const socket = getSocket()
    if (socket?.connected && roomId) {
      socket.emit('task-add', {
        meetingId: roomId,
        task: { text: newTask.text.trim(), dueDate: newTask.dueDate ? `${newTask.dueDate}T${newTask.dueTime || '09:00'}` : '' },
      })
    }
    setNewTask({ text: '', dueDate: '', dueTime: '09:00' })
    setShowAddModal(false)
  }

  const toggleTask = (id) => {
    const socket = getSocket()
    if (socket?.connected && roomId) {
      socket.emit('task-toggle', { meetingId: roomId, taskId: id })
    }
  }

  const deleteTask = (id) => {
    const socket = getSocket()
    if (socket?.connected && roomId) {
      socket.emit('task-delete', { meetingId: roomId, taskId: id })
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700">
          Study Tasks
          <span className="ml-2 text-[10px] font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Shared</span>
        </h4>
        <button onClick={() => setShowAddModal(true)} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          + Add Task
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {tasks.map(task => (
          <div key={task.id} className="flex items-start gap-2 p-2 group">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.text}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.dueDate && (
                  <p className="text-xs text-gray-400">{formatDate(task.dueDate)}</p>
                )}
                {task.createdBy && (
                  <span className="text-[10px] text-gray-400">by {task.createdBy}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
            >
              <i className="ri-delete-bin-line text-sm" />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <i className="ri-task-line text-3xl" />
            <p className="text-sm mt-2">No tasks yet</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Add Task</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task name"
              value={newTask.text}
              onChange={e => setNewTask(prev => ({ ...prev, text: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
            {newTask.dueDate && (() => {
              const t = newTask.dueTime || '09:00'
              const [h, m] = t.split(':').map(Number)
              const parsed = { hour: h % 12 || 12, minute: isNaN(m) ? 0 : m, period: h >= 12 ? 'PM' : 'AM' }
              const update = (hr, mn, p) => {
                let h24 = hr % 12; if (p === 'PM') h24 += 12
                setNewTask(prev => ({ ...prev, dueTime: `${String(h24).padStart(2, '0')}:${String(mn).padStart(2, '0')}` }))
              }
              return (
                <div className="flex items-center gap-2">
                  <select value={parsed.hour} onChange={e => update(Number(e.target.value), parsed.minute, parsed.period)} className="h-10 px-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 bg-white text-center w-16">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
                  </select>
                  <span className="text-gray-400 font-bold">:</span>
                  <select value={parsed.minute} onChange={e => update(parsed.hour, Number(e.target.value), parsed.period)} className="h-10 px-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 bg-white text-center w-16">
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                  </select>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button type="button" onClick={() => update(parsed.hour, parsed.minute, 'AM')} className={`px-2.5 h-10 text-xs font-semibold transition-colors ${parsed.period === 'AM' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>AM</button>
                    <button type="button" onClick={() => update(parsed.hour, parsed.minute, 'PM')} className={`px-2.5 h-10 text-xs font-semibold transition-colors ${parsed.period === 'PM' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>PM</button>
                  </div>
                </div>
              )
            })()}
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={() => setShowAddModal(false)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={addTask} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
