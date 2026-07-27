import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../shared/components/ProductHub.css'

const tabs = [
  { key: 'adjustment', label: 'Credit Adjustment' },
  { key: 'blockage', label: 'Blockage Handling' },
  { key: 'ai', label: 'AI Decision' },
]

const content = {
  adjustment: {
    title: 'Credit Adjustment',
    description: 'Credit limit adjustment requests and results',
    link: '/credit-adjustment',
    columns: ['Request ID', 'Customer', 'Adjustment', 'Status'],
    rows: [['ADJ-001', 'user_123', '+5,000', 'Approved'], ['ADJ-002', 'user_456', '-2,000', 'Pending']],
  },
  blockage: {
    title: 'Blockage Handling',
    description: 'Operational blocks and exception handling',
    link: '/blockage',
    columns: ['Case ID', 'Business Type', 'Reason', 'Status'],
    rows: [['BLK-1042', 'Disbursement', 'Risk review', 'Processing'], ['BLK-1038', 'Credit', 'Document issue', 'Resolved']],
  },
  ai: {
    title: 'AI Decision',
    description: 'AI models used by decision workflows',
    link: '/ai-decision',
    columns: ['Model', 'Type', 'Accuracy', 'Status'],
    rows: [['credit_risk_model_v2', 'XGBoost', '94.5%', 'Online'], ['fraud_detection_nn', 'Neural Network', '96.2%', 'Training']],
  },
}

function BusinessHubPage() {
  const [activeTab, setActiveTab] = useState('adjustment')
  const current = content[activeTab]

  return (
    <div className="product-hub">
      <div className="product-hub-header">
        <div><h1>Business</h1><p>Operate credit interventions, exceptions and AI decisions.</p></div>
      </div>
      <div className="product-hub-tabs" role="tablist">
        {tabs.map((tab) => (
          <button key={tab.key} role="tab" aria-selected={activeTab === tab.key} className={activeTab === tab.key ? 'active' : ''} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>
      <section className="product-hub-panel">
        <div className="product-hub-toolbar">
          <div><strong>{current.title}</strong><span>{current.description}</span></div>
          <span className="product-hub-search">⌕&nbsp;&nbsp;Search {current.title}</span>
        </div>
        <table className="product-hub-table">
          <thead><tr>{current.columns.map((column) => <th key={column}>{column}</th>)}<th>Actions</th></tr></thead>
          <tbody>
            {current.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((value, index) => <td key={`${row[0]}-${index}`}>{value}</td>)}
                <td><Link to={current.link}>Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default BusinessHubPage
