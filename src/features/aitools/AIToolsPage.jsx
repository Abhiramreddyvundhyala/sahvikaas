import { useState, useRef } from 'react'
import { sendAIMessage } from '../../lib/api'

// ─── AI Tools Data ───
const aiTools = [
  {
    id: 'assistant',
    name: 'Study Assistant',
    desc: 'Get instant help with any topic. Ask questions, get explanations, and learn concepts faster.',
    icon: 'ri-chat-smile-2-line',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    action: 'Start Conversation',
    category: 'learn',
  },
  {
    id: 'quiz',
    name: 'Quiz Generator',
    desc: 'Create custom practice tests from any topic. Choose difficulty, number of questions, and format.',
    icon: 'ri-question-answer-line',
    color: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    action: 'Generate Quiz',
    category: 'practice',
  },
  {
    id: 'planner',
    name: 'Study Plan Creator',
    desc: 'AI generates a personalized weekly study plan based on your exams and available hours.',
    icon: 'ri-calendar-todo-line',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    action: 'Create Plan',
    category: 'organize',
  },
  {
    id: 'summarizer',
    name: 'Notes Summarizer',
    desc: 'Paste or upload your notes and get a concise summary with highlighted key terms.',
    icon: 'ri-file-text-line',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    action: 'Summarize Notes',
    category: 'learn',
  },
  {
    id: 'flashcards',
    name: 'Flashcard Generator',
    desc: 'Auto-create flashcards from any content. Flip-card UI with spaced repetition learning.',
    icon: 'ri-stack-line',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    action: 'Create Flashcards',
    category: 'practice',
  },
  {
    id: 'doubts',
    name: 'Doubt Solver',
    desc: 'Ask any academic doubt and get step-by-step solutions with visual explanations.',
    icon: 'ri-lightbulb-line',
    color: 'from-yellow-500 to-amber-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    action: 'Ask Doubt',
    category: 'learn',
  },
  {
    id: 'predictor',
    name: 'Exam Predictor',
    desc: 'Predict important questions from past papers using AI pattern analysis.',
    icon: 'ri-bar-chart-grouped-line',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    action: 'Predict Questions',
    category: 'practice',
  },
  {
    id: 'essay',
    name: 'Assignment Helper',
    desc: 'Structure and draft assignments with AI. Outline → Draft → Review workflow.',
    icon: 'ri-edit-2-line',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    action: 'Start Writing',
    category: 'create',
  },
  {
    id: 'eli5',
    name: 'Explain Like I\'m 5',
    desc: 'Simplify complex topics into easy language. Adjust the complexity level with a slider.',
    icon: 'ri-emotion-happy-line',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    action: 'Simplify Topic',
    category: 'learn',
  },
  {
    id: 'formulas',
    name: 'Formula Sheet Generator',
    desc: 'Generate comprehensive formula sheets for any subject. Printable & downloadable.',
    icon: 'ri-functions',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    action: 'Generate Sheet',
    category: 'create',
  },
  {
    id: 'voice',
    name: 'Voice Notes to Text',
    desc: 'Convert recorded lectures to formatted text notes. Upload audio and get organized notes.',
    icon: 'ri-mic-line',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    action: 'Convert Audio',
    category: 'create',
  },
  {
    id: 'lab',
    name: 'Lab Report Writer',
    desc: 'Generate lab report templates with AI. Pre-filled structure per experiment type.',
    icon: 'ri-test-tube-line',
    color: 'from-slate-500 to-gray-600',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    action: 'Write Report',
    category: 'create',
  },
]

const categories = [
  { id: 'all', label: 'All Tools', icon: 'ri-apps-line' },
  { id: 'learn', label: 'Learn', icon: 'ri-book-read-line' },
  { id: 'practice', label: 'Practice', icon: 'ri-pencil-ruler-2-line' },
  { id: 'create', label: 'Create', icon: 'ri-magic-line' },
  { id: 'organize', label: 'Organize', icon: 'ri-layout-grid-line' },
]

// ─── Chat Modal ───
function ChatModal({ tool, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi! I'm your ${tool.name}. How can I help you today?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)

    try {
      const res = await sendAIMessage(userMsg)
      const aiText = res?.reply || res?.response || 'Sorry, I could not generate a response. Please try again.'
      setMessages(prev => [...prev, { role: 'ai', text: aiText }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again later.' }])
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg h-[70vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 border-b border-gray-200 bg-gradient-to-r ${tool.color} rounded-t-2xl`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <i className={`${tool.icon} text-xl text-white`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{tool.name}</h3>
            <p className="text-xs text-white/80">AI-powered assistant</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <i className="ri-close-line text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={`Ask ${tool.name} anything...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <i className="ri-send-plane-fill" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tool Card ───
function ToolCard({ tool, onLaunch }) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <i className={`${tool.icon} text-2xl text-white`} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{tool.desc}</p>
      <button
        onClick={() => onLaunch(tool)}
        className={`w-full py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r ${tool.color} text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
      >
        <i className="ri-play-circle-line" />
        {tool.action}
      </button>
    </div>
  )
}

// ─── Main Page ───
export default function AIToolsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTool, setActiveTool] = useState(null)
  const [search, setSearch] = useState('')

  const filteredTools = aiTools.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                          tool.desc.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI Tools</h1>
        <p className="text-sm text-gray-500 mt-1">Your AI-powered study toolkit for smarter learning</p>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <h2 className="text-lg sm:text-2xl font-bold mb-2">Supercharge Your Studies with AI</h2>
          <p className="text-sm sm:text-base text-white/80 max-w-lg">
            12 powerful AI tools designed to help you learn faster, practice smarter, and create better study materials.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/5" />
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Choose a Tool', desc: 'Pick from 12 AI-powered tools', icon: 'ri-cursor-line', color: 'from-indigo-500 to-purple-500' },
            { step: '2', title: 'Provide Input', desc: 'Enter your topic, question, or content', icon: 'ri-keyboard-line', color: 'from-teal-500 to-emerald-500' },
            { step: '3', title: 'Get Results', desc: 'Receive AI-generated study materials', icon: 'ri-sparkle-line', color: 'from-amber-500 to-orange-500' },
          ].map(s => (
            <div key={s.step} className="flex flex-col items-center text-center p-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <i className={`${s.icon} text-xl text-white`} />
              </div>
              <div className="text-xs font-bold text-indigo-600 mb-1">STEP {s.step}</div>
              <h4 className="font-semibold text-gray-900 text-sm">{s.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search AI tools..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto study-feature-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                activeCategory === cat.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className={cat.icon} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} onLaunch={setActiveTool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-search-line text-4xl text-gray-300" />
          <p className="text-gray-500 mt-2">No tools found matching your search.</p>
        </div>
      )}

      {/* Chat Modal */}
      {activeTool && <ChatModal tool={activeTool} onClose={() => setActiveTool(null)} />}
    </div>
  )
}
