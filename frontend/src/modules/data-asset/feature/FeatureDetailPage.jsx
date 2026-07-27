import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import './FeatureDetailPage.css'

const tabs = [
  { key: 'information', label: 'Information' },
  { key: 'verification', label: 'Verification Records' },
  { key: 'lineage', label: 'Lineage' },
]

const featureData = {
  id: 1,
  name: 'utcToday',
  status: 'Active',
  createdBy: 'xuyangzhang.zxy',
  creationType: 'Data Connector',
  createdAt: '2026-07-15 15:19:55',
  featureName: 'utcToday',
  featureDescription: '当前零时区时间，格式yyyy-MM-dd',
  featureType: 'STRING',
  outliers: 'Empty Object',
  defaultValue: 'Empty Object',
  inputName: 'tempLimitStartDate',
  inputDescription: '临时额度生效时间，零时区，格式...',
  inputType: 'STRING',
  dataSource: {
    data: 'overdue_temp_limit_date',
    outputName: 'utcToday',
  },
}

function FeatureDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('information')

  return (
    <div className="feature-detail-page">
      <div className="breadcrumb">
        <Link to="/feature">Feature</Link>
        <span>/</span>
        <span>{featureData.name}</span>
      </div>

      <div className="detail-header">
        <div className="detail-header-left">
          <Link to="/feature" className="back-btn">‹</Link>
          <h1 className="detail-title">{featureData.name}</h1>
          <StatusBadge status={featureData.status} />
        </div>
        <button className="offline-btn">Take Offline</button>
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

      {activeTab === 'information' && (
        <div className="detail-content">
          <div className="info-card">
            <h3 className="info-card-title">Basic Information</h3>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Created By</span>
                <span className="info-value">{featureData.createdBy}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Creation Type</span>
                <span className="info-value">{featureData.creationType}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Created At</span>
                <span className="info-value">{featureData.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">Feature</h3>
            <table className="parameter-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Outliers</th>
                  <th>Default Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{featureData.featureName}</td>
                  <td>{featureData.featureDescription}</td>
                  <td>{featureData.featureType}</td>
                  <td>{featureData.outliers}</td>
                  <td>{featureData.defaultValue}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">Feature Input</h3>
            <table className="parameter-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{featureData.inputName}</td>
                  <td>{featureData.inputDescription}</td>
                  <td>{featureData.inputType}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">Data Source</h3>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Data</span>
                <span className="info-value">{featureData.dataSource.data}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Output Name</span>
                <span className="info-value">{featureData.dataSource.outputName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="info-card">
          <h3 className="info-card-title">Verification Records</h3>
          <p className="placeholder-text">No verification records yet.</p>
        </div>
      )}

      {activeTab === 'lineage' && (
        <div className="info-card">
          <h3 className="info-card-title">Lineage</h3>
          <p className="placeholder-text">No lineage data available.</p>
        </div>
      )}
    </div>
  )
}

export default FeatureDetailPage
