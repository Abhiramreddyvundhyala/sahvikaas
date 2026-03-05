import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../lib/auth'
import { createRoom } from '../../lib/roomApiV2'

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    audio: true,
    video: true,
    scheduledFor: '',
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitedMembers, setInvitedMembers] = useState([])
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [loading, setLoading] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [errorModal, setErrorModal] = useState({ open: false, message: '' })
  const [createdRoomId, setCreatedRoomId] = useState('')
  const [copied, setCopied] = useState(false)

  const handleAddMember = () => {
    const email = inviteEmail.trim()
    if (email && !invitedMembers.includes(email) && email.includes('@')) {
      setInvitedMembers(prev => [...prev, email])
      setInviteEmail('')
    }
  }

  const handleRemoveMember = (email) => {
    setInvitedMembers(prev => prev.filter(e => e !== email))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.subject.trim()) {
      setErrorModal({ open: true, message: 'Please fill in all required fields.' })
      return
    }
    setLoading(true)
    try {
      const result = await createRoom({
        name: formData.name,
        subject: formData.subject,
        privacy: 'public',
        audio: formData.audio,
        video: formData.video,
        scheduledFor: scheduledDate ? `${scheduledDate}T${scheduledTime}` : undefined,
        invitedMembers: invitedMembers.length > 0 ? invitedMembers : undefined,
      })
      setLoading(false)
      setCreatedRoomId(result.room._id)
      setSuccessModal(true)
    } catch (error) {
      setLoading(false)
      setErrorModal({ open: true, message: error.message || 'Failed to create room.' })
    }
  }

  const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || ''
  const roomUrl = `${window.location.origin}${basePath}/#/room/${createdRoomId}`

  const copyUrl = () => {
    navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <i className="ri-arrow-left-line text-xl" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Create a Study Room</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
          <div className="space-y-6">
            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Name *</label>
              <input
                type="text"
                placeholder="Enter room name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
              <input
                type="text"
                placeholder="Enter subject"
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Room Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Room Settings</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Audio Toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <i className="ri-mic-line text-indigo-600 text-lg" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Audio</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, audio: !prev.audio }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${formData.audio ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${formData.audio ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Video Toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <i className="ri-video-chat-line text-indigo-600 text-lg" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Video</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, video: !prev.video }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${formData.video ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${formData.video ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Schedule (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Schedule For (optional)</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {scheduledDate && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const parsed = (() => {
                        if (!scheduledTime) return { hour: 9, minute: 0, period: 'AM' }
                        const [h, m] = scheduledTime.split(':').map(Number)
                        return { hour: h % 12 || 12, minute: isNaN(m) ? 0 : m, period: h >= 12 ? 'PM' : 'AM' }
                      })()
                      const update = (h, m, p) => {
                        let h24 = h % 12
                        if (p === 'PM') h24 += 12
                        setScheduledTime(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
                      }
                      const hours = Array.from({ length: 12 }, (_, i) => i + 1)
                      const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
                      return (
                        <>
                          <select value={parsed.hour} onChange={e => update(Number(e.target.value), parsed.minute, parsed.period)} className="h-12 px-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-center w-16">
                            {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
                          </select>
                          <span className="text-gray-400 font-bold">:</span>
                          <select value={parsed.minute} onChange={e => update(parsed.hour, Number(e.target.value), parsed.period)} className="h-12 px-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-center w-16">
                            {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                          </select>
                          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <button type="button" onClick={() => update(parsed.hour, parsed.minute, 'AM')} className={`px-3 h-12 text-xs font-semibold transition-colors ${parsed.period === 'AM' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>AM</button>
                            <button type="button" onClick={() => update(parsed.hour, parsed.minute, 'PM')} className={`px-3 h-12 text-xs font-semibold transition-colors ${parsed.period === 'PM' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>PM</button>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to start the room immediately</p>
            </div>

            {/* Invite Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Invite Members</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-4 h-12 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
              {invitedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {invitedMembers.map(email => (
                    <span key={email} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                      {email}
                      <button type="button" onClick={() => handleRemoveMember(email)} className="hover:text-indigo-900">
                        <i className="ri-close-line" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <i className="ri-loader-4-line animate-spin" />}
                Create Room
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal isOpen={successModal} onClose={() => setSuccessModal(false)}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-3xl text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Room Created Successfully!</h3>
          <p className="text-sm text-gray-500 mb-4">Share this link with others to join.</p>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              readOnly
              value={roomUrl}
              className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm bg-gray-50"
            />
            <button
              onClick={copyUrl}
              className={`px-4 h-10 text-sm font-medium rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSuccessModal(false); navigate('/rooms') }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => navigate(`/room/${createdRoomId}`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Enter Room
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal isOpen={errorModal.open} onClose={() => setErrorModal({ open: false, message: '' })}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-3xl text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
          <p className="text-sm text-gray-500 mb-6">{errorModal.message}</p>
          <button
            onClick={() => setErrorModal({ open: false, message: '' })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}
