import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'ri-dashboard-line' },
  { path: '/rooms', label: 'Study Rooms', icon: 'ri-video-chat-line' },
  { path: '/resources', label: 'Resources', icon: 'ri-folder-line' },
  { path: '/ai-tools', label: 'AI Tools', icon: 'ri-robot-line' },
  { path: '/schedule', label: 'Schedule', icon: 'ri-calendar-line' },
  { path: '/achievements', label: 'Achievements', icon: 'ri-trophy-line' },
]

export default function DashboardLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6">
          <h1
            className="logo-font text-2xl text-indigo-500 cursor-pointer"
            onClick={() => navigate('/')}
          >
            StudyHub
          </h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <i className={`${item.icon} text-lg`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <i className="ri-user-line text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Computer Science</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors relative">
              <i className="ri-notification-3-line text-xl text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
              <i className="ri-settings-3-line text-xl text-gray-600" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
