import './PageHeader.css'

function PageHeader({ title, tabs, activeTab, onTabChange, actionLabel, onAction, icon }) {
  return (
    <div className="page-header">
      <div className="header-left">
        <h1 className="page-title">{icon && <span className="title-icon">{icon}</span>}{title}</h1>
        {tabs && (
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => onTabChange && onTabChange(tab.key)}
              >
                {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {actionLabel && (
        <button className="create-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default PageHeader
