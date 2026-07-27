import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import Avatar from '../../../shared/components/common/Avatar'
import './DecisionDetailPage.css'

const tabs = [
  { key: 'details', label: 'Details' },
  { key: 'monitoring', label: 'Monitoring' },
]

const decisionData = {
  id: 1,
  name: 'test_luke1',
  status: 'Draft',
  description: '1',
  category: 'AE',
}

const versions = [
  {
    versionNo: 'V1.0.0',
    lastUpdatedBy: 'luke.wn',
    lastUpdatedAt: '2026-07-15 15:45',
    status: 'Draft',
  },
]

function DecisionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('details')
  const [versionTab, setVersionTab] = useState('online')

  return (
    <div className="decision-detail-page">
      <div className="breadcrumb">
        <Link to="/decision">Decision</Link>
        <span>/</span>
        <span>{decisionData.name}</span>
      </div>

      <div className="detail-header">
        <div className="detail-header-left">
          <Link to="/decision" className="back-btn">‹</Link>
          <h1 className="detail-title">{decisionData.name}</h1>
          <StatusBadge status={decisionData.status} />
        </div>
        <button
          className="new-version-btn"
          onClick={() => navigate(`/decision/${id}/edit`)}
        >
          + New Version
        </button>
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
                <span className="info-value editable">
                  {decisionData.name}
                  <span className="edit-icon">✎</span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Description</span>
                <span className="info-value editable">
                  {decisionData.description}
                  <span className="edit-icon">✎</span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Category</span>
                <span className="info-value">
                  <select className="category-select" defaultValue={decisionData.category}>
                    <option value="AE">AE</option>
                    <option value="BR">BR</option>
                    <option value="MX">MX</option>
                  </select>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label" />
                <span className="info-value">
                  <button className="show-all-link">Show All ▾</button>
                </span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">Versions</h3>
            <div className="version-tabs">
              <button
                className={`version-tab ${versionTab === 'online' ? 'active' : ''}`}
                onClick={() => setVersionTab('online')}
              >
                Online
              </button>
              <button
                className={`version-tab ${versionTab === 'offline' ? 'active' : ''}`}
                onClick={() => setVersionTab('offline')}
              >
                Offline
              </button>
            </div>
            <table className="version-table">
              <thead>
                <tr>
                  <th>Version No.</th>
                  <th>Last Updated By</th>
                  <th>Last Updated At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v, index) => (
                  <tr key={index}>
                    <td>{v.versionNo}</td>
                    <td>
                      <div className="creator-cell">
                        <Avatar name={v.lastUpdatedBy} />
                        <span>{v.lastUpdatedBy}</span>
                      </div>
                    </td>
                    <td>{v.lastUpdatedAt}</td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td>
                      <button
                        className="edit-link"
                        onClick={() => navigate(`/decision/${id}/edit`)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="info-card">
          <h3 className="info-card-title">Monitoring</h3>
          <p className="placeholder-text">No monitoring data available.</p>
        </div>
      )}
    </div>
  )
}

export default DecisionDetailPage
