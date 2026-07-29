import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './Sidebar.css'

const groupedItems = [
  {
    id: 'business',
    icon: 'business',
    label: 'Business',
    children: [
      { path: '/ticket', label: 'Ticket' },
      { path: '/credit-adjustment', label: 'Credit Adjustment' },
      { path: '/blockage', label: 'Blockage Handling' },
      { path: '/ai-decision', label: 'AI Decision' },
    ],
  },
  {
    id: 'data-asset',
    icon: 'data',
    label: 'Data Asset',
    children: [
      { path: '/data-source', label: 'Data Source' },
      { path: '/data-connector', label: 'Data Connector' },
      { path: '/feature', label: 'Feature' },
    ],
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
  const isActive = (path) => (
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  )
  const isChildActive = (path) => (
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  )
  const activeGroup = groupedItems.find((group) => group.children.some((child) => isChildActive(child.path)))
  const [expanded, setExpanded] = useState(() => ({
    'data-asset': activeGroup?.id === 'data-asset',
    business: activeGroup?.id === 'business',
  }))

  useEffect(() => {
    if (!activeGroup) return
    setExpanded((current) => ({ ...current, [activeGroup.id]: true }))
  }, [activeGroup?.id])

  const toggleGroup = (groupId) => {
    setExpanded((current) => ({ ...current, [groupId]: !current[groupId] }))
  }

  const policyActive = ['/policy', '/decision', '/testing', '/case-tracker'].some(isActive)

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1 className="brand-name">Bettr</h1>
        <span className="brand-subtitle">Credit Engine</span>
      </div>

      <nav className="sidebar-nav" aria-label="Product navigation">
        <Link to="/policy/1" className={`primary-nav-item ${policyActive ? 'active' : ''}`}>
          <span className="nav-icon"><NavigationIcon name="policy" /></span>
          <span className="nav-label">Policy</span>
        </Link>

        {groupedItems.map((group) => {
          const groupActive = group.children.some((child) => isChildActive(child.path))
          return (
            <section className={`nav-group ${groupActive ? 'active' : ''}`} key={group.id}>
              <button
                className="nav-group-trigger"
                aria-expanded={Boolean(expanded[group.id])}
                onClick={() => toggleGroup(group.id)}
              >
                <span className="nav-icon"><NavigationIcon name={group.icon} /></span>
                <span className="nav-label">{group.label}</span>
                <span className={`nav-arrow ${expanded[group.id] ? 'expanded' : ''}`}>⌄</span>
              </button>
              {expanded[group.id] && (
                <div className="submenu">
                  {group.children.map((child) => (
                    <Link key={child.path} to={child.path} className={`submenu-item ${isChildActive(child.path) ? 'active' : ''}`}>
                      <span className="submenu-marker" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        {bottomItems.map((item) => (
          <Link key={item.path} to={item.path} className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}>
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
