import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../shared/components/ProductHub.css'

const tabs = [
  { key: 'source', label: 'Data Source' },
  { key: 'connector', label: 'Data Connector' },
  { key: 'feature', label: 'Feature' },
]

const content = {
  source: {
    title: 'Data Source',
    description: 'Marketplace and external data access methods',
    link: '/data-source',
    columns: ['Name', 'Source Type', 'Owner', 'Status'],
    rows: [
      ['credit_bureau_marketplace', 'Marketplace', 'Risk Data', 'Active'],
      ['user_profile_mysql', 'MySQL', 'Credit Platform', 'Active'],
      ['device_risk_rpc', 'RPC', 'Anti-Fraud', 'Active'],
    ],
  },
  connector: {
    title: 'Data Connector',
    description: 'Configured connections between policies and data sources',
    link: '/data-connector',
    columns: ['Name', 'Marketplace', 'Protocol', 'Status'],
    rows: [
      ['credit_report_connector', 'Credit Bureau', 'HTTP', 'Active'],
      ['user_profile_connector', 'User Profile', 'MySQL', 'Active'],
      ['shop_risk_connector', 'Shop Risk', 'RPC', 'Active'],
    ],
  },
  feature: {
    title: 'Feature',
    description: 'Reusable variables prepared for decision strategies',
    link: '/feature',
    columns: ['Name', 'Category', 'Processing Time', 'Used In'],
    rows: [
      ['monthly_income', 'Credit', '18 ms', '12'],
      ['credit_report_score', 'Risk', '42 ms', '8'],
      ['shop_risk_level', 'Fraud', '27 ms', '5'],
    ],
  },
}

function DataAssetHubPage() {
  const [activeTab, setActiveTab] = useState('source')
  const current = content[activeTab]

  return (
    <div className="product-hub">
      <div className="product-hub-header">
        <div><h1>Data Asset</h1><p>Manage data access, connections and reusable features.</p></div>
        <button>＋ Create {current.title}</button>
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
                {row.map((value, index) => <td key={`${row[0]}-${index}`}>{value === 'Active' ? <span className="hub-status">Active</span> : value}</td>)}
                <td><Link to={current.link}>Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default DataAssetHubPage
