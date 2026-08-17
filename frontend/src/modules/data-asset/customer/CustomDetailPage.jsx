import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import { customerVariables } from './CustomerPage'
import '../feature/FeatureDetailPage.css'
import './CustomDetailPage.css'

const tabs = [
  { key: 'information', label: 'Information' },
  { key: 'verification', label: 'Verification Records' },
  { key: 'lineage', label: 'Lineage' },
]

function CustomDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('information')
  const customVariable = useMemo(
    () => customerVariables.find((item) => String(item.id) === String(id)) || customerVariables[0],
    [id],
  )

  return (
    <div className="feature-detail-page custom-detail-page">
      <div className="breadcrumb">
        <Link to="/custom">Custom</Link>
        <span>/</span>
        <span>{customVariable.name}</span>
      </div>

      <div className="detail-header">
        <div className="detail-header-left">
          <Link to="/custom" className="custom-back-btn" aria-label="Back to Custom list">‹</Link>
          <h1 className="detail-title">{customVariable.name}</h1>
          <StatusBadge status={customVariable.status} />
        </div>
        <div className="custom-detail-actions">
          <button className="history-btn" aria-label="View change history" title="Change history">↶</button>
          <button className="offline-btn">Take Offline</button>
        </div>
      </div>

      <div className="detail-tabs">
        {tabs.map((tab) => (
          <button key={tab.key} className={`detail-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'information' && (
        <div className="detail-content">
          <section className="info-card">
            <h3 className="info-card-title">Basic Information</h3>
            <div className="info-list">
              <div className="info-row"><span className="info-label">Created By</span><span className="info-value">{customVariable.createdBy}</span></div>
              <div className="info-row"><span className="info-label">Creation Type</span><span className="info-value">Custom</span></div>
              <div className="info-row"><span className="info-label">Created At</span><span className="info-value">{customVariable.createdAt}</span></div>
            </div>
          </section>

          <section className="info-card custom-variable-card">
            <h3 className="info-card-title">Custom Variable</h3>
            <div className="custom-table-scroll">
              <table className="parameter-table">
                <thead><tr><th>Name</th><th>Description</th><th>Type</th><th>Source</th><th>Default Value</th></tr></thead>
                <tbody><tr><td>{customVariable.name}</td><td>{customVariable.description}</td><td>{customVariable.type.toUpperCase()}</td><td>{customVariable.source}</td><td>{customVariable.defaultValue || 'Empty Object'}</td></tr></tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'verification' && (
        <section className="info-card">
          <div className="custom-section-heading"><div><h3 className="info-card-title">Verification Records</h3><p>Validation results recorded for this Custom variable.</p></div></div>
          <table className="parameter-table"><thead><tr><th>Verified At</th><th>Verified By</th><th>Result</th></tr></thead><tbody><tr><td>{customVariable.lastUpdatedAt}</td><td>{customVariable.createdBy}</td><td><StatusBadge status="Passed" /></td></tr></tbody></table>
        </section>
      )}

      {activeTab === 'lineage' && (
        <section className="info-card">
          <div className="custom-section-heading"><div><h3 className="info-card-title">Lineage</h3><p>Where this variable comes from and where it is used.</p></div></div>
          <div className="custom-lineage">
            <div className="lineage-node"><small>Source</small><strong>{customVariable.source}</strong></div><span>→</span>
            <div className="lineage-node current"><small>Custom</small><strong>{customVariable.name}</strong></div><span>→</span>
            <div className="lineage-node"><small>Used In</small><strong>{customVariable.usedIn} references</strong></div>
          </div>
        </section>
      )}
    </div>
  )
}

export default CustomDetailPage
