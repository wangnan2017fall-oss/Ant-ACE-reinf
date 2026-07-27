import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import './DataConnectorDetailPage.css'

const connectors = {
  1: { name: 'antom_score_connector', type: 'Http', source: 'Antom A卡分数', endpoint: 'GET /v1/credit-score', feature: 'antom_credit_score', status: 'Active' },
  2: { name: 'user_profile_mysql', type: 'MYSQL', source: 'AE Credit Warehouse', endpoint: 'feature_info.customer_profile', feature: 'monthly_income', status: 'Active' },
  3: { name: 'bnpl_whitelist_rpc', type: 'RPC', source: 'BR BNPL Credit Pay Whitelist Data', endpoint: 'WhitelistService.query', feature: 'credit_pay_whitelist', status: 'Draft' },
}

function DataConnectorDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('details')
  const connector = connectors[id] || connectors[1]

  return (
    <div className="connector-detail-page">
      <div className="breadcrumb"><Link to="/data-connector">Data Connector</Link><span>/</span><span>{connector.name}</span></div>
      <div className="connector-detail-header">
        <div><Link to="/data-connector" aria-label="Back to Data Connector">‹</Link><h1>{connector.name}</h1><StatusBadge status={connector.status} /></div>
        <button>Edit</button>
      </div>
      <div className="detail-tabs">
        <button className={activeTab === 'details' ? 'detail-tab active' : 'detail-tab'} onClick={() => setActiveTab('details')}>Details</button>
        <button className={activeTab === 'lineage' ? 'detail-tab active' : 'detail-tab'} onClick={() => setActiveTab('lineage')}>Lineage</button>
      </div>

      {activeTab === 'details' && (
        <section className="connector-info-card">
          <h2>Basic Information</h2>
          <dl>
            <div><dt>Name</dt><dd>{connector.name}</dd></div>
            <div><dt>Type</dt><dd>{connector.type}</dd></div>
            <div><dt>Data Source</dt><dd>{connector.source}</dd></div>
            <div><dt>Configuration</dt><dd><code>{connector.endpoint}</code></dd></div>
            <div><dt>Output Feature</dt><dd>{connector.feature}</dd></div>
          </dl>
        </section>
      )}

      {activeTab === 'lineage' && (
        <section className="connector-lineage">
          <div><span>Data Source</span><strong>{connector.source}</strong></div>
          <b>→</b>
          <div className="current"><span>Data Connector · Current</span><strong>{connector.name}</strong></div>
          <b>→</b>
          <div><span>Feature</span><strong>{connector.feature}</strong></div>
        </section>
      )}
    </div>
  )
}

export default DataConnectorDetailPage
