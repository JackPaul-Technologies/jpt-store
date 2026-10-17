import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Smartphone, Monitor, Globe, FileText, Settings } from 'lucide-react'

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Android Apps', path: '/category/android', icon: Smartphone },
  { name: 'Windows Apps', path: '/category/windows', icon: Monitor },
  { name: 'Web Apps', path: '/category/web', icon: Globe },
  { name: 'Articles', path: '/category/articles', icon: FileText }
]

export const Sidebar: React.FC = () => {
  return (
    <aside className="glass-panel w-60 border-r flex flex-col justify-between py-4 select-none shrink-0">
      <div className="px-3 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </div>

      <div className="px-3 space-y-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}
