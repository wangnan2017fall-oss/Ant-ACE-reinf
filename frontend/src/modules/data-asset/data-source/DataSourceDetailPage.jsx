import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import './DataSourceDetailPage.css'

const dataSources = [
  { id: 1, name: 'Antom A卡分数', productName: 'Antom A卡分数', description: 'Antom A Card Data --- Antom A卡分数', connectionType: 'Marketplace', activatedAt: '2026-07-15 16:19:03', dataCaching: '0 Days' },
  { id: 2, name: 'BR BNPL Credit Pay Whitelist Data', productName: 'BR BNPL Credit Pay Whitelist Data', description: '', connectionType: 'Marketplace', activatedAt: '2026-07-15 16:19:03', dataCaching: '0 Days' },
  { id: 3, name: 'BoaVista batch data', productName: 'BoaVista batch data', description: '', connectionType: 'Marketplace', activatedAt: '2026-07-15 16:19:03', dataCaching: '0 Days' },
  { id: 4, name: 'AE-DS', productName: 'AE-DS', description: 'AE 策略经营信息查询', connectionType: 'Marketplace', activatedAt: '2026-07-14 09:20:03', dataCaching: '1 Day' },
  { id: 5, name: 'CERC-DS', productName: 'CERC Credit History', description: 'CERC征信数据历史记录数据', connectionType: 'Marketplace', activatedAt: '2026-07-13 10:15:00', dataCaching: '7 Days' },
  { id: 6, name: 'CERC-DS', productName: 'CERC Income Estimate', description: 'CERC征信数据收入预估数据', connectionType: 'Marketplace', activatedAt: '2026-07-13 10:16:00', dataCaching: '7 Days' },
  { id: 7, name: 'DockOne', productName: 'Dock Feature', description: 'Dock Feature', connectionType: 'Marketplace', activatedAt: '2026-07-12 14:05:00', dataCaching: '0 Days' },
  { id: 8, name: 'KWAI-DS', productName: 'Kwai Buyer Data', description: 'Kwai Buyer Data', connectionType: 'Marketplace', activatedAt: '2026-07-11 08:42:00', dataCaching: '1 Day' },
  { id: 9, name: 'LX-DS', productName: 'AE User Intermediate Information', description: 'AE User Intermediate Information', connectionType: 'Marketplace', activatedAt: '2026-07-10 11:30:00', dataCaching: '1 Day' },
  { id: 10, name: 'Kwai User Profile API', productName: 'Kwai User Profile API', description: 'Real-time customer profile endpoint', connectionType: 'HTTP', activatedAt: '2026-07-20 12:10:00', dataCaching: '0 Days' },
  { id: 11, name: 'BNPL Risk Model v5', productName: 'BNPL Risk Model v5', description: 'PMML scoring model', connectionType: 'PMML', activatedAt: '2026-07-19 16:12:00', dataCaching: '0 Days' },
  { id: 12, name: 'Credit Bureau Daily File', productName: 'Credit Bureau Daily File', description: 'Daily encrypted credit report file', connectionType: 'FILE', activatedAt: '2026-07-18 06:00:00', dataCaching: '30 Days' },
  { id: 13, name: 'Anti-fraud RPC Service', productName: 'Anti-fraud RPC Service', description: 'Real-time fraud result query', connectionType: 'RPC', activatedAt: '2026-07-17 13:45:00', dataCaching: '0 Days' },
  { id: 14, name: 'AE Credit Warehouse', productName: 'AE Credit Warehouse', description: 'Customer and loan feature tables', connectionType: 'MySQL', activatedAt: '2026-07-16 09:00:00', dataCaching: '1 Day' },
]

const tabs = [
  { key: 'details', label: 'Details' },
  { key: 'monitoring', label: 'Monitoring' },
  { key: 'lineage', label: 'Lineage' },
]

function DataSourceDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('details')
  const ds = dataSources.find((d) => d.id === Number(id)) || dataSources[0]

  return (
    <div className="data-source-detail-page">
      <div className="breadcrumb">
        <Link to="/data-source">Data Source</Link>
        <span>/</span>
      </div>

      <div className="detail-header">
        <div className="detail-header-left">
          <Link to="/data-source" className="back-btn">‹</Link>
          <h1 className="detail-title">{ds.name}</h1>
          <StatusBadge status="Activated" />
        </div>
        <button className="offline-btn">Offline</button>
      </div>

      <div className="detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`detail-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="detail-content">
          <div className="info-card">
            <h3 className="info-card-title">Basic Information</h3>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Name</span>
                <span className="info-value">{ds.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Product Name</span>
                <span className="info-value">{ds.productName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Description</span>
                <span className="info-value">{ds.description || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Connection Type</span>
                <span className="info-value">{ds.connectionType}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Activated At</span>
                <span className="info-value">{ds.activatedAt}</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <h3 className="info-card-title">Configuration</h3>
              <button className="edit-link">✎ Edit</button>
            </div>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Data Caching</span>
                <span className="info-value">{ds.dataCaching}</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">Parameter</h3>
            <table className="parameter-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Data Type</th>
                  <th>Requirement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="4" className="empty-cell">No parameters</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="detail-content">
          <div className="monitoring-header">
            <h3 className="info-card-title">Data Source Monitoring</h3>
            <div className="date-picker">
              <span>Yesterday</span>
              <span>07 / 14 / 2026 - 07 / 14 / 2026</span>
              <span>▾</span>
            </div>
          </div>

          <div className="metric-cards">
            <div className="metric-card">
              <span className="metric-card-label">Success Rate</span>
              <span className="metric-card-value">-</span>
            </div>
            <div className="metric-card blue">
              <span className="metric-card-label">Total Requests</span>
              <span className="metric-card-value">0</span>
            </div>
            <div className="metric-card green">
              <span className="metric-card-label">Success</span>
              <span className="metric-card-value">0</span>
            </div>
            <div className="metric-card red">
              <span className="metric-card-label">Failed</span>
              <span className="metric-card-value">0</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <h3 className="info-card-title">Request Overview</h3>
              <select className="time-granularity">
                <option>Minute</option>
                <option>Hour</option>
                <option>Day</option>
              </select>
            </div>
            <div className="chart-placeholder">
              <div className="chart-line" />
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">Failed Request Analysis</h3>
            <div className="empty-chart">No failed requests</div>
          </div>
        </div>
      )}

      {activeTab === 'lineage' && (
        <div className="detail-content">
          <div className="lineage-canvas">
            <div className="lineage-node current">
              <div className="node-tags">
                <span className="node-tag type">Data Source</span>
                <span className="node-tag current">Current</span>
                <StatusBadge status="Activated" />
              </div>
              <div className="node-name">{ds.name}</div>
            </div>
            <div className="lineage-arrow">→</div>
            <div className="lineage-node connector">
              <div className="node-tags">
                <span className="node-tag connector">Data Connector</span>
                <StatusBadge status="Active" />
              </div>
              <div className="node-name">antom_credit_score_connector</div>
              <div className="lineage-meta">HTTP · Real-time</div>
            </div>
            <div className="lineage-arrow">→</div>
            <div className="lineage-node feature">
              <div className="node-tags">
                <span className="node-tag feature">Feature</span>
                <StatusBadge status="Active" />
              </div>
              <div className="node-name">antom_credit_score</div>
              <div className="lineage-meta">number · Used in 4 policies</div>
            </div>
          </div>
          <div className="lineage-controls">
            <button>✎</button>
            <button>⛶</button>
            <button>−</button>
            <span>100%</span>
            <button>+</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataSourceDetailPage
