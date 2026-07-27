import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import './DataSourcePage.css'

const dataSources = [
  { id: 1, type: 'Marketplace', name: 'Antom A卡分数', subtitle: '', status: 'Activated' },
  { id: 2, type: 'Marketplace', name: 'BR BNPL Credit Pay Whitelist Data', subtitle: '', status: 'Activated' },
  { id: 3, type: 'Marketplace', name: 'BoaVista batch data', subtitle: '', status: 'Activated' },
  { id: 4, type: 'Marketplace', name: 'AE-DS', subtitle: 'AE 策略经营信息查询', status: 'Activated' },
  { id: 5, type: 'Marketplace', name: 'CERC-DS', subtitle: 'CERC征信数据历史记录数据', status: 'Activated' },
  { id: 6, type: 'Marketplace', name: 'CERC-DS', subtitle: 'CERC征信数据收入预估数据', status: 'Activated' },
  { id: 7, type: 'Marketplace', name: 'DockOne', subtitle: 'Dock Feature', status: 'Activated' },
  { id: 8, type: 'Marketplace', name: 'KWAI-DS', subtitle: 'Kwai Buyer Data', status: 'Activated' },
  { id: 9, type: 'Marketplace', name: 'LX-DS', subtitle: 'AE User Intermediate Information', status: 'Activated' },
  { id: 10, type: 'HTTP', name: 'Kwai User Profile API', subtitle: 'Real-time customer profile endpoint', status: 'Activated' },
  { id: 11, type: 'PMML', name: 'BNPL Risk Model v5', subtitle: 'PMML scoring model', status: 'Activated' },
  { id: 12, type: 'FILE', name: 'Credit Bureau Daily File', subtitle: 'Daily encrypted credit report file', status: 'Activated' },
  { id: 13, type: 'RPC', name: 'Anti-fraud RPC Service', subtitle: 'Real-time fraud result query', status: 'Activated' },
  { id: 14, type: 'MySQL', name: 'AE Credit Warehouse', subtitle: 'Customer and loan feature tables', status: 'Activated' },
]

function DataSourcePage() {
  const [searchValue, setSearchValue] = useState('')
  const [activeType, setActiveType] = useState('Marketplace')

  const filtered = dataSources.filter((ds) =>
    ds.type === activeType && ds.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <div className="data-source-page">
      <div className="page-header-simple">
        <h1 className="page-title">Data Source</h1>
        <p className="page-subtitle">Activated data source will be shared across all domains.</p>
      </div>

      <div className="tabs-simple">
        {['Marketplace', 'HTTP', 'PMML', 'FILE', 'RPC', 'MySQL'].map((type) => (
          <button
            key={type}
            className={`tab-simple ${activeType === type ? 'active' : ''}`}
            onClick={() => {
              setActiveType(type)
              setSearchValue('')
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="search-row">
        <div className="search-box light">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search Data Source"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="data-source-grid">
          {filtered.map((ds) => (
            <div key={ds.id} className="data-source-card">
              <div className="card-header">
                <div className="card-icon">{ds.type === 'Marketplace' ? '▦' : '⌁'}</div>
                <StatusBadge status={ds.status} />
              </div>
              <span className="source-type-label">{ds.type}</span>
              <h3 className="card-title">{ds.name}</h3>
              {ds.subtitle && <p className="card-subtitle">{ds.subtitle}</p>}
              <div className="card-metrics">
                <div className="metric">
                  <span className="metric-label">Success Rate</span>
                  <span className="metric-value">-</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Requested</span>
                  <span className="metric-value">-</span>
                </div>
              </div>
              <span className="metric-time">Yesterday</span>
              <Link to={`/data-source/${ds.id}`} className="card-details-btn">
                Details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-result">
          <div className="empty-icon">🔍</div>
          <p>No Result found</p>
        </div>
      )}
    </div>
  )
}

export default DataSourcePage
