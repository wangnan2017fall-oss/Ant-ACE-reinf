import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

const primaryItems = [
  {
    path: '/policy/1',
    icon: 'policy',
    label: 'Policy',
    match: ['/policy', '/decision', '/testing', '/case-tracker'],
  },
  {
    path: '/data-asset',
    icon: 'data',
    label: 'Data Asset',
    match: ['/data-asset', '/data-source', '/data-connector', '/feature'],
  },
  {
    path: '/business',
    icon: 'business',
    label: 'Business',
    match: ['/business', '/credit-adjustment', '/blockage', '/ai-decision'],
  },
  {
    path: '/approval',
    icon: 'approval',
    label: 'Approval Center',
    match: ['/approval'],
  },
]

const bottomItems = [
  { path: '/br-business', icon: 'workspace', label: 'BR Business' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
]

function NavigationIcon({ name }) {
  if (name === 'policy') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" />
        <path d="M8.3 7.1 10.8 15M15.7 7.1 13.2 15M8.5 6h7" />
      </svg>
    )
  }
  if (name === 'data') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="5.5" rx="7.5" ry="3" /><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
      </svg>
    )
  }
  if (name === 'business') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="7.5" width="17" height="12" rx="2" /><path d="M8.5 7.5V5.3c0-.9.7-1.6 1.6-1.6h3.8c.9 0 1.6.7 1.6 1.6v2.2M3.5 12h17M10 12v2h4v-2" />
      </svg>
    )
  }
  if (name === 'approval') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5 19 6v5.4c0 4.4-2.9 7.7-7 9.1-4.1-1.4-7-4.7-7-9.1V6l7-2.5Z" /><path d="m8.5 12 2.2 2.2 4.8-5" />
      </svg>
    )
  }
  if (name === 'settings') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" /><path d="M19 13.5v-3l-2-.7-.5-1.2.9-1.9-2.1-2.1-1.9.9-1.2-.5-.7-2h-3l-.7 2-1.2.5-1.9-.9-2.1 2.1.9 1.9-.5 1.2-2 .7v3l2 .7.5 1.2-.9 1.9 2.1 2.1 1.9-.9 1.2.5.7 2h3l.7-2 1.2-.5 1.9.9 2.1-2.1-.9-1.9.5-1.2 2-.7Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2.4 2.2 3.5 4.9 3.5 8S14.4 17.8 12 20c-2.4-2.2-3.5-4.9-3.5-8S9.6 6.2 12 4Z" />
    </svg>
  )
}

function Sidebar() {
  const location = useLocation()
  const matches = (paths) => paths.some((path) => (
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  ))

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1 className="brand-name">Bettr</h1>
        <span className="brand-subtitle">Credit Engine</span>
      </div>

      <nav className="sidebar-nav" aria-label="Product navigation">
        {primaryItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`primary-nav-item ${matches(item.match) ? 'active' : ''}`}
          >
            <span className="nav-icon"><NavigationIcon name={item.icon} /></span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${matches([item.path]) ? 'active' : ''}`}
          >
            <span className="nav-icon"><NavigationIcon name={item.icon} /></span>
            <span className="nav-label">{item.label}</span>
            {item.icon === 'workspace' && <span className="workspace-switch">⇄</span>}
          </Link>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
