import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './PolicyDetailPage.css'

const tabs = [
  { key: 'details', label: 'Details' },
  { key: 'canvas', label: 'Canvas' },
  { key: 'decisions', label: 'Decisions', count: 3 },
  { key: 'parameters', label: 'Parameters' },
  { key: 'traffic', label: 'Traffic' },
  { key: 'monitoring', label: 'Monitoring' },
]

const decisions = [
  {
    id: 'credit-eligibility',
    name: 'credit_eligibility_decision',
    description: 'Validate customer eligibility and base risk rules',
    status: 'Online',
    nodes: ['Start', 'Eligibility Rule', 'Risk Score', 'End'],
  },
  {
    id: 'limit-pricing',
    name: 'limit_pricing_decision',
    description: 'Calculate credit limit, rate and repayment term',
    status: 'Online',
    nodes: ['Start', 'Limit Table', 'Pricing Rule', 'End'],
  },
  {
    id: 'anti-fraud',
    name: 'anti_fraud_decision',
    description: 'Fraud screening before final policy response',
    status: 'Draft',
    nodes: ['Start', 'Fraud Score', 'If-Else Rule', 'End'],
  },
]

const parameters = {
  feature: [
    { name: 'age', type: 'number', component: 'User', key: 'user_id', usedIn: 'Eligibility Rule' },
    { name: 'monthly_income', type: 'number', component: 'User', key: 'user_id', usedIn: 'Risk Score, Limit Table' },
    { name: 'credit_report_score', type: 'number', component: 'Credit Report', key: 'user_id', usedIn: 'Risk Score' },
    { name: 'shop_risk_level', type: 'string', component: 'Shop', key: 'shop_id', usedIn: 'Fraud Score' },
  ],
  local: [
    { name: 'customer_segment', type: 'string', source: 'Eligibility Rule.segment', usedIn: 'Limit Table' },
    { name: 'risk_score', type: 'number', source: 'Risk Score.score', usedIn: 'Pricing Rule' },
    { name: 'base_limit', type: 'number', source: 'Limit Table.limit', usedIn: 'Pricing Rule' },
  ],
  output: [
    { name: 'approved', type: 'boolean', source: 'Eligibility Rule.approved' },
    { name: 'credit_limit', type: 'number', source: 'Pricing Rule.final_limit' },
    { name: 'interest_rate', type: 'number', source: 'Pricing Rule.rate' },
    { name: 'loan_term', type: 'number', source: 'Pricing Rule.term' },
  ],
}

function MiniFlow({ nodes, compact = false }) {
  return (
    <div className={`policy-mini-flow ${compact ? 'compact' : ''}`}>
      {nodes.map((node, index) => (
        <div className="mini-flow-part" key={node}>
          <div className={`mini-flow-node ${index === 0 || index === nodes.length - 1 ? 'terminal' : ''}`}>
            {index > 0 && index < nodes.length - 1 && <span className="mini-node-icon">▤</span>}
            <span>{node}</span>
          </div>
          {index < nodes.length - 1 && <span className="mini-flow-arrow">→</span>}
        </div>
      ))}
    </div>
  )
}

function PolicyDetailPage() {
  const [activeTab, setActiveTab] = useState('canvas')
  const [expandedDecision, setExpandedDecision] = useState(decisions[0].id)
  const [parameterType, setParameterType] = useState('feature')
  const [parameterSearch, setParameterSearch] = useState('')
  const [dateRange, setDateRange] = useState('Today')

  const visibleParameters = useMemo(() => {
    const query = parameterSearch.trim().toLowerCase()
    if (!query) return parameters[parameterType]
    return parameters[parameterType].filter((item) => (
      item.name.toLowerCase().includes(query)
      || Object.values(item).some((value) => String(value).toLowerCase().includes(query))
    ))
  }, [parameterSearch, parameterType])

  return (
    <div className="policy-detail-page">
      <div className="policy-breadcrumb"><Link to="/policy">Policy</Link><span>/</span><span>kwai_disburse_policy</span></div>

      <div className="policy-title-row">
        <Link className="policy-back" to="/policy" aria-label="Back to Policy">‹</Link>
        <h1>kwai_disburse_policy</h1>
        <span className="policy-online"><i />Online</span>
        <button className="version-selector">V1.0.3 <span>• Active</span>⌄</button>
      </div>

      <div className="policy-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <section className="policy-panel detail-grid">
          <div><span>Policy Name</span><strong>kwai_disburse_policy</strong></div>
          <div><span>Status</span><strong className="green-text">Online</strong></div>
          <div><span>Category</span><strong>AE · Credit</strong></div>
          <div><span>Owner</span><strong>gaochaoxiang.gcx</strong></div>
          <div><span>Created At</span><strong>Jul 7, 2026</strong></div>
          <div><span>Last Modified</span><strong>Jul 21, 2026</strong></div>
          <div className="wide"><span>Description</span><strong>Kwai real-time credit eligibility, limit and pricing policy.</strong></div>
        </section>
      )}

      {activeTab === 'canvas' && (
        <section className="policy-canvas-panel">
          <div className="panel-heading">
            <div><h2>Policy Canvas</h2><p>End-to-end execution logic for the active version</p></div>
            <div className="canvas-actions"><button>−</button><button>100%</button><button>+</button><button>Fit</button></div>
          </div>
          <div className="policy-canvas">
            <div className="canvas-lane-label">Main flow</div>
            <MiniFlow nodes={['Start', 'credit_eligibility_decision', 'limit_pricing_decision', 'anti_fraud_decision', 'End']} />
            <div className="canvas-context">
              <span><b>User</b> · user_id</span>
              <span><b>Shop</b> · shop_id</span>
              <span>4 outputs</span>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'decisions' && (
        <section className="decision-overview">
          <div className="panel-heading">
            <div><h2>Decisions</h2><p>All decision components referenced by this policy</p></div>
            <label className="inline-search"><span>⌕</span><input placeholder="Search decision" /></label>
          </div>
          <div className="decision-cards">
            {decisions.map((decision) => {
              const expanded = expandedDecision === decision.id
              return (
                <article className={`decision-card ${expanded ? 'expanded' : ''}`} key={decision.id}>
                  <button
                    className="decision-card-header"
                    aria-expanded={expanded}
                    onClick={() => setExpandedDecision(expanded ? '' : decision.id)}
                  >
                    <span className="decision-caret">{expanded ? '⌄' : '›'}</span>
                    <span className="decision-symbol">◇</span>
                    <span className="decision-copy"><strong>{decision.name}</strong><small>{decision.description}</small></span>
                    <span className={`decision-status ${decision.status.toLowerCase()}`}>{decision.status}</span>
                    <span className="decision-node-count">{decision.nodes.length} nodes</span>
                  </button>
                  {expanded && (
                    <div className="decision-expanded">
                      <MiniFlow nodes={decision.nodes} compact />
                      <Link to="/decision/1/edit">Open full canvas →</Link>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      {activeTab === 'parameters' && (
        <section className="parameter-panel">
          <div className="panel-heading">
            <div><h2>Parameters</h2><p>Variables available in this policy. Inputs are resolved through each feature’s component key.</p></div>
            <label className="inline-search"><span>⌕</span><input value={parameterSearch} onChange={(event) => setParameterSearch(event.target.value)} placeholder="Search parameter" /></label>
          </div>
          <div className="parameter-tabs">
            {[
              { key: 'feature', label: 'Feature', count: parameters.feature.length },
              { key: 'local', label: 'Local', count: parameters.local.length },
              { key: 'output', label: 'Output', count: parameters.output.length },
            ].map((item) => (
              <button key={item.key} className={parameterType === item.key ? 'active' : ''} onClick={() => setParameterType(item.key)}>
                {item.label}<span>{item.count}</span>
              </button>
            ))}
          </div>
          <div className="parameter-table-wrap">
            <table className="parameter-table">
              <thead>
                <tr>
                  <th>Name</th><th>Type</th>
                  {parameterType === 'feature' && <><th>Component</th><th>Lookup Key</th></>}
                  {parameterType !== 'feature' && <th>Source</th>}
                  <th>{parameterType === 'output' ? 'Returned By' : 'Used In'}</th>
                </tr>
              </thead>
              <tbody>
                {visibleParameters.map((item) => (
                  <tr key={item.name}>
                    <td><span className={`parameter-dot ${parameterType}`} />{item.name}</td>
                    <td><code>{item.type}</code></td>
                    {parameterType === 'feature' && <><td>{item.component}</td><td><code>{item.key}</code></td></>}
                    {parameterType !== 'feature' && <td>{item.source}</td>}
                    <td>{item.usedIn || item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(activeTab === 'traffic' || activeTab === 'monitoring') && (
        <section className="monitor-panel">
          <div className="monitor-toolbar">
            <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
              <option>Today</option><option>Last 7 days</option><option>Last 30 days</option>
            </select>
            <span>07 / 21 / 2026&nbsp;&nbsp; – &nbsp;&nbsp;07 / 21 / 2026</span>
          </div>
          <div className="metric-grid">
            <div><span>Success Rate</span><strong>—</strong></div>
            <div className="blue"><span>Total Requests</span><strong>0</strong></div>
            <div className="green"><span>Success</span><strong>0</strong></div>
            <div className="violet"><span>Failed</span><strong>0</strong></div>
          </div>
          <div className="empty-monitor">
            <h3>{activeTab === 'traffic' ? 'Traffic Overview' : 'Request Overview'}</h3>
            <span>⌕</span><strong>No data available</strong><p>Requests for the selected period will appear here.</p>
          </div>
        </section>
      )}
    </div>
  )
}

export default PolicyDetailPage
