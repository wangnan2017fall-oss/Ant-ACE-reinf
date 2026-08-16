import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './PolicyDetailPage.css'

const tabs = [
  { key: 'details', label: 'Details' },
  { key: 'canvas', label: 'Canvas' },
  { key: 'parameters', label: 'Parameters' },
  { key: 'records', label: 'Records' },
  { key: 'traffic', label: 'Traffic' },
  { key: 'monitoring', label: 'Monitoring' },
]

const decisions = [
  {
    id: 'credit-eligibility',
    name: 'credit_eligibility_decision',
    description: 'Validate customer eligibility and base risk rules',
    versions: ['V2.1.0', 'V2.0.3', 'V1.9.8'],
    nodes: ['Start', 'Eligibility Rule', 'Risk Score', 'End'],
    inputs: [
      { name: 'user_id', type: 'String' },
      { name: 'shop_id', type: 'String' },
      { name: 'age', type: 'Number' },
      { name: 'nationality', type: 'String' },
      { name: 'credit_report_score', type: 'Number' },
      { name: 'monthly_income', type: 'Number' },
    ],
    outputs: [
      { name: 'eligible', type: 'Boolean' },
      { name: 'risk_score', type: 'Number' },
    ],
  },
  {
    id: 'limit-pricing',
    name: 'limit_pricing_decision',
    description: 'Calculate credit limit, rate and repayment term',
    versions: ['V1.4.2', 'V1.4.1', 'V1.3.6'],
    nodes: ['Start', 'Limit Table', 'Pricing Rule', 'End'],
    inputs: [
      { name: 'user_id', type: 'String' },
      { name: 'eligible', type: 'Boolean' },
      { name: 'monthly_income', type: 'Number' },
      { name: 'customer_segment', type: 'String' },
      { name: 'risk_score', type: 'Number' },
    ],
    outputs: [
      { name: 'credit_limit', type: 'Number' },
      { name: 'interest_rate', type: 'Number' },
      { name: 'loan_term', type: 'Integer' },
    ],
  },
  {
    id: 'anti-fraud',
    name: 'anti_fraud_decision',
    description: 'Fraud screening before final policy response',
    versions: ['V0.9.0', 'V0.8.4', 'V0.8.1'],
    nodes: ['Start', 'Fraud Score', 'If-Else Rule', 'End'],
    inputs: [
      { name: 'user_id', type: 'String' },
      { name: 'shop_id', type: 'String' },
      { name: 'shop_risk_level', type: 'String' },
      { name: 'device_risk_score', type: 'Number' },
    ],
    outputs: [
      { name: 'fraud_result', type: 'String' },
    ],
  },
]

const decisionNodeDetails = {
  'credit-eligibility': {
    Start: { type: 'Start', description: 'Receives entity keys for this Decision.', inputs: 'user_id, shop_id', outputs: 'user_id, shop_id' },
    'Eligibility Rule': { type: 'If-Else', description: 'Checks the base eligibility conditions.', inputs: 'age, nationality', outputs: 'eligible' },
    'Risk Score': { type: 'Action', description: 'Calculates the customer risk score.', inputs: 'credit_report_score, monthly_income', outputs: 'risk_score' },
    End: { type: 'End', description: 'Returns the Decision result to the Policy.', inputs: 'eligible, risk_score', outputs: 'eligible, risk_score' },
  },
  'limit-pricing': {
    Start: { type: 'Start', description: 'Receives the upstream eligibility result.', inputs: 'user_id, eligible', outputs: 'user_id, eligible' },
    'Limit Table': { type: 'Decision Table', description: 'Matches the base credit limit.', inputs: 'monthly_income, customer_segment', outputs: 'base_limit' },
    'Pricing Rule': { type: 'Action', description: 'Calculates the final rate and repayment term.', inputs: 'base_limit, risk_score', outputs: 'credit_limit, interest_rate, loan_term' },
    End: { type: 'End', description: 'Returns pricing results to the Policy.', inputs: 'credit_limit, interest_rate, loan_term', outputs: 'credit_limit, interest_rate, loan_term' },
  },
  'anti-fraud': {
    Start: { type: 'Start', description: 'Receives customer and shop entity keys.', inputs: 'user_id, shop_id', outputs: 'user_id, shop_id' },
    'Fraud Score': { type: 'Action', description: 'Calculates a consolidated fraud score.', inputs: 'shop_risk_level, device_risk_score', outputs: 'fraud_score' },
    'If-Else Rule': { type: 'If-Else', description: 'Routes requests by fraud risk level.', inputs: 'fraud_score', outputs: 'pass, reject' },
    End: { type: 'End', description: 'Returns the anti-fraud result to the Policy.', inputs: 'pass, reject', outputs: 'fraud_result' },
  },
}

const parameters = {
  customer: [
    { name: 'user_id', type: 'string', source: 'Policy request', usedIn: 'User and Credit Report features' },
    { name: 'shop_id', type: 'string', source: 'Policy request', usedIn: 'Shop features' },
  ],
  feature: [
    { name: 'age', type: 'number', component: 'User', key: 'user_id', usedIn: 'Eligibility Rule' },
    { name: 'monthly_income', type: 'number', component: 'User', key: 'user_id', usedIn: 'Risk Score, Limit Table' },
    { name: 'credit_report_score', type: 'number', component: 'Credit Report', key: 'user_id', usedIn: 'Risk Score' },
    { name: 'shop_risk_level', type: 'string', component: 'Shop', key: 'shop_id', usedIn: 'Fraud Score' },
  ],
  output: [
    { name: 'approved', type: 'boolean', source: 'Eligibility Rule.approved', returnedBy: 'Policy End' },
    { name: 'credit_limit', type: 'number', source: 'Pricing Rule.final_limit', returnedBy: 'Policy End' },
    { name: 'interest_rate', type: 'number', source: 'Pricing Rule.rate', returnedBy: 'Policy End' },
    { name: 'loan_term', type: 'number', source: 'Pricing Rule.term', returnedBy: 'Policy End' },
  ],
}

const policyRecords = [
  { actor: 'luke.wn', action: 'Created', target: 'Policy version V1.0.4', detail: 'Copied from V1.0.3', time: 'Jul 27, 2026 11:26' },
  { actor: 'gaochaoxiang.gcx', action: 'Added', target: 'anti_fraud_decision', detail: 'Added Decision node to Policy Canvas', time: 'Jul 27, 2026 10:18' },
  { actor: 'luke.wn', action: 'Updated', target: 'credit_eligibility_decision', detail: 'Changed input binding: credit_report_score', time: 'Jul 27, 2026 09:47' },
  { actor: 'risk.admin', action: 'Deleted', target: 'legacy_limit_decision', detail: 'Removed Decision node from V1.0.3 draft', time: 'Jul 26, 2026 17:32' },
  { actor: 'luke.wn', action: 'Published', target: 'Policy version V1.0.3', detail: 'Promoted version to Active', time: 'Jul 25, 2026 16:09' },
]

const policyVersionDiffs = {
  'V1.0.4': {
    base: 'V1.0.3',
    status: 'Draft',
    createdBy: 'luke.wn',
    createdAt: 'Jul 27, 2026 11:26',
    changes: [
      { type: 'added', scope: 'Decision', target: 'anti_fraud_decision', detail: 'Added to the Policy Canvas', after: 'Decision V0.9.0' },
      { type: 'updated', scope: 'Decision version', target: 'credit_eligibility_decision', detail: 'Changed the referenced Decision version', before: 'V2.0.3', after: 'V2.1.0' },
      { type: 'updated', scope: 'Parameter', target: 'credit_report_score', detail: 'Updated the input binding', before: 'credit_report.score', after: 'bureau_report.score' },
      { type: 'removed', scope: 'Decision', target: 'legacy_limit_decision', detail: 'Removed from the Policy Canvas', before: 'Decision V1.2.0' },
    ],
  },
  'V1.0.3': {
    base: 'V1.0.2',
    status: 'Active',
    createdBy: 'gaochaoxiang.gcx',
    createdAt: 'Jul 25, 2026 16:09',
    changes: [
      { type: 'added', scope: 'Decision', target: 'limit_pricing_decision', detail: 'Added pricing calculation to the Policy Canvas', after: 'Decision V1.4.1' },
      { type: 'updated', scope: 'Output', target: 'interest_rate', detail: 'Changed the output source', before: 'base_rate', after: 'Pricing Rule.rate' },
      { type: 'updated', scope: 'Parameter', target: 'monthly_income', detail: 'Changed the Feature component binding', before: 'Applicant', after: 'User' },
    ],
  },
  'V1.0.2': {
    base: 'V1.0.1',
    status: 'Offline',
    createdBy: 'luke.wn',
    createdAt: 'Jul 18, 2026 14:20',
    changes: [
      { type: 'added', scope: 'Output', target: 'loan_term', detail: 'Added a new Policy output', after: 'Number' },
      { type: 'updated', scope: 'Decision version', target: 'credit_eligibility_decision', detail: 'Changed the referenced Decision version', before: 'V1.9.8', after: 'V2.0.3' },
    ],
  },
}

const initialVersions = [
  { id: 'V1.0.3', status: 'Active' },
  { id: 'V1.0.2', status: 'Offline' },
  { id: 'V1.0.1', status: 'Archived' },
]

const initialTrafficConfiguration = {
  production: [
    { version: 'V1.0.3', traffic: 70, fallback: '—' },
    { version: 'V1.0.2', traffic: 30, fallback: '—' },
    { version: 'V1.0.1', traffic: 0, fallback: '—' },
  ],
  'pre-production': [
    { version: 'V1.0.4', traffic: 100, fallback: 'V1.0.3' },
    { version: 'V1.0.3', traffic: 0, fallback: '—' },
  ],
}

const defaultDecisionReferences = {
  'credit-eligibility': 'V2.1.0',
  'limit-pricing': 'V1.4.2',
  'anti-fraud': 'V0.9.0',
}

const initialDecisionReferences = {
  'V1.0.3': defaultDecisionReferences,
  'V1.0.2': {
    'credit-eligibility': 'V2.0.3',
    'limit-pricing': 'V1.4.1',
    'anti-fraud': 'V0.8.4',
  },
  'V1.0.1': {
    'credit-eligibility': 'V1.9.8',
    'limit-pricing': 'V1.3.6',
    'anti-fraud': 'V0.8.1',
  },
}

function MiniFlow({ nodes, compact = false, onNodeClick, selectedNode = '' }) {
  return (
    <div className={`policy-mini-flow ${compact ? 'compact' : ''}`}>
      {nodes.map((node, index) => (
        <div className="mini-flow-part" key={node}>
          <button
            type="button"
            className={`mini-flow-node ${index === 0 || index === nodes.length - 1 ? 'terminal' : ''} ${selectedNode === node ? 'selected' : ''}`}
            onClick={() => onNodeClick?.(node)}
            disabled={!onNodeClick || index === 0 || index === nodes.length - 1}
          >
            {index > 0 && index < nodes.length - 1 && <span className="mini-node-icon">▤</span>}
            <span>{node}</span>
          </button>
          {index < nodes.length - 1 && <span className="mini-flow-arrow">→</span>}
        </div>
      ))}
    </div>
  )
}

function PolicyCanvasPreview({ onDecisionClick, onAbTestingClick, selected = false }) {
  return (
    <div className="policy-canvas-preview" aria-label="Policy flow preview">
      <div className="policy-preview-terminal input"><span>⇩</span><strong>Input</strong></div>
      <span className="policy-preview-connector">↓</span>
      <button
        className={`policy-preview-card decision ${selected ? 'selected' : ''}`}
        onClick={onDecisionClick}
        type="button"
      >
        <i>♧</i>
        <span><small>Decision</small><strong>app_credit_new_ae_user_decision</strong></span>
        <em>V1.0.0</em>
      </button>
      <span className="policy-preview-connector long">↓</span>
      <button className="policy-preview-card testing" onClick={onAbTestingClick} type="button">
        <i>⌘</i>
        <span><small>ab_test</small><strong>A/B Testing</strong></span>
      </button>
      <span className="policy-preview-connector">↓</span>
      <div className="policy-preview-terminal output"><span>↪</span><strong>Output</strong></div>
    </div>
  )
}

function PolicyDetailPage() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(() => (
    tabs.some((tab) => tab.key === requestedTab) ? requestedTab : 'canvas'
  ))
  const [expandedDecision, setExpandedDecision] = useState(decisions[0].id)
  const [inspectedDecisionNode, setInspectedDecisionNode] = useState('')
  const [recordsView, setRecordsView] = useState('records')
  const [diffVersion, setDiffVersion] = useState('V1.0.4')
  const [parameterType, setParameterType] = useState('customer')
  const [parameterSearch, setParameterSearch] = useState('')
  const [dateRange, setDateRange] = useState('Today')
  const [trafficEnvironment, setTrafficEnvironment] = useState('production')
  const [trafficConfiguration, setTrafficConfiguration] = useState(initialTrafficConfiguration)
  const [trafficDraft, setTrafficDraft] = useState(initialTrafficConfiguration.production)
  const [showTrafficHistory, setShowTrafficHistory] = useState(false)
  const [showTrafficAdjustment, setShowTrafficAdjustment] = useState(false)
  const requestedVersion = searchParams.get('version') || initialVersions[0].id
  const [versions, setVersions] = useState(() => (
    initialVersions.some((version) => version.id === requestedVersion)
      ? initialVersions
      : [{ id: requestedVersion, status: 'Draft' }, ...initialVersions]
  ))
  const [policyName, setPolicyName] = useState('kwai_disburse_policy')
  const [policyStatus, setPolicyStatus] = useState('Online')
  const [activeVersion, setActiveVersion] = useState(requestedVersion)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showNewVersion, setShowNewVersion] = useState(false)
  const [showCopyPolicy, setShowCopyPolicy] = useState(false)
  const [newVersionBase, setNewVersionBase] = useState(requestedVersion)
  const [copySourceVersion, setCopySourceVersion] = useState(requestedVersion)
  const [copyPolicyName, setCopyPolicyName] = useState('kwai_disburse_policy_copy')
  const [copyPolicyDescription, setCopyPolicyDescription] = useState('Copied policy for a new strategy iteration')
  const [copyNotice, setCopyNotice] = useState('')
  const [selectedPolicyDecision, setSelectedPolicyDecision] = useState('')
  const [decisionReferences, setDecisionReferences] = useState(() => ({
    ...initialDecisionReferences,
    ...(initialDecisionReferences[requestedVersion] ? {} : { [requestedVersion]: { ...defaultDecisionReferences } }),
  }))

  const visibleParameters = useMemo(() => {
    const query = parameterSearch.trim().toLowerCase()
    if (!query) return parameters[parameterType]
    return parameters[parameterType].filter((item) => (
      item.name.toLowerCase().includes(query)
      || Object.values(item).some((value) => String(value).toLowerCase().includes(query))
    ))
  }, [parameterSearch, parameterType])

  const changeTab = (tabKey) => {
    setActiveTab(tabKey)
    const next = {}
    if (tabKey !== 'canvas') next.tab = tabKey
    if (activeVersion !== initialVersions[0].id) next.version = activeVersion
    setSearchParams(next, { replace: true })
  }

  const switchVersion = (version) => {
    setActiveVersion(version)
    const next = {}
    if (activeTab !== 'canvas') next.tab = activeTab
    if (version !== initialVersions[0].id) next.version = version
    setSearchParams(next, { replace: true })
  }

  const createVersion = () => {
    const highestPatch = Math.max(...versions.map((version) => Number(version.id.split('.').at(-1))))
    const nextVersion = `V1.0.${highestPatch + 1}`
    setVersions((current) => [
      { id: nextVersion, status: 'Draft' },
      ...current.map((version) => version.status === 'Active' ? { ...version, status: 'Online' } : version),
    ])
    setDecisionReferences((current) => ({
      ...current,
      [nextVersion]: { ...(current[newVersionBase] || defaultDecisionReferences) },
    }))
    switchVersion(nextVersion)
    setShowNewVersion(false)
  }

  const copyAsNewPolicy = () => {
    const nextName = copyPolicyName.trim()
    if (!nextName) return
    const copiedReferences = { ...(decisionReferences[copySourceVersion] || defaultDecisionReferences) }
    setPolicyName(nextName)
    setPolicyStatus('Draft')
    setVersions([{ id: 'V1.0.1', status: 'Draft' }])
    setActiveVersion('V1.0.1')
    setDecisionReferences({ 'V1.0.1': copiedReferences })
    setSearchParams(activeTab === 'canvas' ? {} : { tab: activeTab }, { replace: true })
    setCopyNotice(`${nextName} was created from ${policyName} · ${copySourceVersion}`)
    setShowCopyPolicy(false)
  }

  const selectedDecision = decisions.find((decision) => decision.name === selectedPolicyDecision)
  const activeDecisionReferences = decisionReferences[activeVersion] || defaultDecisionReferences
  const activeVersionDiff = policyVersionDiffs[diffVersion]

  const updateDecisionReference = (decisionId, version) => {
    setDecisionReferences((current) => ({
      ...current,
      [activeVersion]: {
        ...(current[activeVersion] || defaultDecisionReferences),
        [decisionId]: version,
      },
    }))
  }

  const openTrafficAdjustment = () => {
    setTrafficDraft(trafficConfiguration.production.map((item) => ({ ...item })))
    setShowTrafficAdjustment(true)
  }

  const saveTrafficAdjustment = () => {
    setTrafficConfiguration((current) => ({ ...current, production: trafficDraft }))
    setShowTrafficAdjustment(false)
  }

  return (
    <div className="policy-detail-page">
      <div className="policy-breadcrumb"><Link to="/policy">Policy</Link><span>/</span><span>{policyName}</span></div>

      <div className="policy-title-row">
        <Link className="policy-back" to="/policy" aria-label="Back to Policy">‹</Link>
        <h1>{policyName}</h1>
        <span className={`policy-online ${policyStatus.toLowerCase()}`}><i />{policyStatus}</span>
        <div className="policy-version-actions">
          <select
            className="version-selector"
            aria-label="Policy version"
            value={activeVersion}
            onChange={(event) => switchVersion(event.target.value)}
          >
            {versions.map((version) => (
              <option key={version.id} value={version.id}>{version.id} · {version.status}</option>
            ))}
          </select>
          <div className="new-policy-menu-wrap">
            <button
              className="new-version-button"
              aria-haspopup="menu"
              aria-expanded={showCreateMenu}
              onClick={() => setShowCreateMenu((current) => !current)}
            >＋ New Version <span>⌄</span></button>
            {showCreateMenu && (
              <div className="new-policy-menu" role="menu">
                <button
                  role="menuitem"
                  onClick={() => {
                    setNewVersionBase(activeVersion)
                    setShowCreateMenu(false)
                    setShowNewVersion(true)
                  }}
                >
                  <span className="new-policy-menu-icon">↻</span>
                  <span><strong>Create new version</strong><small>Continue iterating within this Policy</small></span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setCopySourceVersion(activeVersion)
                    setCopyPolicyName(`${policyName}_copy`)
                    setShowCreateMenu(false)
                    setShowCopyPolicy(true)
                  }}
                >
                  <span className="new-policy-menu-icon copy">⧉</span>
                  <span><strong>Copy as a new policy</strong><small>Create an independent Policy from this one</small></span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {copyNotice && <div className="policy-copy-notice"><span>✓</span><strong>New policy created</strong><p>{copyNotice}</p><button onClick={() => setCopyNotice('')} aria-label="Dismiss copy notification">×</button></div>}

      <div className="policy-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => changeTab(tab.key)}
          >
            {tab.label}
            {tab.count && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <section className="policy-panel detail-grid">
          <div><span>Policy Name</span><strong>{policyName}</strong></div>
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
            <div className="canvas-actions">
              <button>−</button><button>100%</button><button>+</button><button>Fit</button>
              <Link className="expand-canvas-button" to={`/policy/${id}/edit?version=${activeVersion}`} aria-label="Open full Policy Canvas">⛶ Expand</Link>
            </div>
          </div>
          <div className="policy-canvas policy-canvas-with-preview">
            <div className="canvas-lane-label">Main flow</div>
            <PolicyCanvasPreview
              onDecisionClick={() => setSelectedPolicyDecision('credit_eligibility_decision')}
              onAbTestingClick={() => navigate('/testing')}
              selected={selectedPolicyDecision === 'credit_eligibility_decision'}
            />
            {selectedDecision && (
              <aside className="canvas-node-inspector">
                <button className="inspector-close" onClick={() => setSelectedPolicyDecision('')} aria-label="Close node details">×</button>
                <span className="inspector-type">Decision</span>
                <h3>{selectedDecision.name}</h3>
                <p>{selectedDecision.description}</p>
                <dl>
                  <div><dt>Decision Version</dt><dd>{activeDecisionReferences[selectedDecision.id]}</dd></div>
                </dl>
                <div className="inspector-parameters">
                  <section>
                    <strong>Inputs <span>{selectedDecision.inputs.length}</span></strong>
                    <div>
                      {selectedDecision.inputs.map((parameter) => (
                        <code key={parameter.name}><b>{parameter.name}</b><small>{parameter.type}</small></code>
                      ))}
                    </div>
                  </section>
                  <section>
                    <strong>Outputs <span>{selectedDecision.outputs.length}</span></strong>
                    <div>
                      {selectedDecision.outputs.map((parameter) => (
                        <code key={parameter.name}><b>{parameter.name}</b><small>{parameter.type}</small></code>
                      ))}
                    </div>
                  </section>
                </div>
                <Link to={`/decision/${selectedDecision.id}/edit?version=${activeDecisionReferences[selectedDecision.id]}&from=policy&policy=${id}&returnTab=canvas`}>Open Decision Canvas →</Link>
              </aside>
            )}
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
              { key: 'customer', label: 'Customer', count: parameters.customer.length },
              { key: 'feature', label: 'Feature', count: parameters.feature.length },
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
                  <th>{parameterType === 'output' ? 'Returned By' : parameterType === 'customer' ? 'Resolves' : 'Used In'}</th>
                </tr>
              </thead>
              <tbody>
                {visibleParameters.map((item) => (
                  <tr key={item.name}>
                    <td><span className={`parameter-dot ${parameterType}`} />{item.name}</td>
                    <td><code>{item.type}</code></td>
                    {parameterType === 'feature' && <><td>{item.component}</td><td><code>{item.key}</code></td></>}
                    {parameterType !== 'feature' && <td>{item.source}</td>}
                    <td>{parameterType === 'output' ? item.returnedBy : item.usedIn || item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'records' && (
        <section className="policy-workspace-panel">
          <div className="panel-heading">
            <div>
              <h2>{recordsView === 'records' ? 'Records' : 'Version Diff'}</h2>
              <p>{recordsView === 'records'
                ? 'Complete audit history of additions, updates, deletions and version operations.'
                : 'Compare a Policy version with the base version it was created from.'}</p>
            </div>
            {recordsView === 'records' && <div className="records-actions"><button>Filter</button><button>Export</button></div>}
          </div>
          <div className="records-subtabs" role="tablist" aria-label="Record views">
            <button role="tab" aria-selected={recordsView === 'records'} className={recordsView === 'records' ? 'active' : ''} onClick={() => setRecordsView('records')}>Activity Records</button>
            <button role="tab" aria-selected={recordsView === 'diff'} className={recordsView === 'diff' ? 'active' : ''} onClick={() => setRecordsView('diff')}>Version Diff</button>
          </div>
          {recordsView === 'records' ? (
            <div className="records-timeline">
              {policyRecords.map((record, index) => (
                <article className="record-item" key={`${record.time}-${record.target}`}>
                  <div className={`record-icon ${record.action.toLowerCase()}`}>{record.action === 'Deleted' ? '−' : record.action === 'Updated' ? '↻' : '+'}</div>
                  <div className="record-line" aria-hidden="true" />
                  <div className="record-copy">
                    <div><strong>{record.actor}</strong><span className={`record-action ${record.action.toLowerCase()}`}>{record.action}</span><b>{record.target}</b></div>
                    <p>{record.detail}</p><time>{record.time}</time>
                  </div>
                  {index === 0 && <span className="latest-record">Latest</span>}
                </article>
              ))}
            </div>
          ) : (
            <div className="version-diff">
              <div className="version-diff-toolbar">
                <label>
                  <span>Version to compare</span>
                  <select value={diffVersion} onChange={(event) => setDiffVersion(event.target.value)}>
                    {Object.keys(policyVersionDiffs).map((version) => <option key={version}>{version}</option>)}
                  </select>
                </label>
                <span className="diff-direction">compared with</span>
                <label>
                  <span>Base version</span>
                  <select value={activeVersionDiff.base} disabled><option>{activeVersionDiff.base}</option></select>
                </label>
                <div className="diff-version-meta">
                  <span className={`diff-status ${activeVersionDiff.status.toLowerCase()}`}>{activeVersionDiff.status}</span>
                  <small>Created by {activeVersionDiff.createdBy} · {activeVersionDiff.createdAt}</small>
                </div>
              </div>
              <div className="diff-summary">
                <div><strong>{activeVersionDiff.changes.length}</strong><span>Total changes</span></div>
                <div className="added"><strong>{activeVersionDiff.changes.filter((item) => item.type === 'added').length}</strong><span>Added</span></div>
                <div className="updated"><strong>{activeVersionDiff.changes.filter((item) => item.type === 'updated').length}</strong><span>Updated</span></div>
                <div className="removed"><strong>{activeVersionDiff.changes.filter((item) => item.type === 'removed').length}</strong><span>Removed</span></div>
              </div>
              <div className="diff-change-list">
                <div className="diff-list-header"><span>Change</span><span>Object</span><span>Details</span><span>Before</span><span>After</span></div>
                {activeVersionDiff.changes.map((change) => (
                  <article className="diff-change-row" key={`${diffVersion}-${change.type}-${change.target}`}>
                    <span className={`diff-change-type ${change.type}`}>{change.type === 'added' ? '+ Added' : change.type === 'removed' ? '− Removed' : '↻ Updated'}</span>
                    <div><small>{change.scope}</small><strong>{change.target}</strong></div>
                    <p>{change.detail}</p>
                    <code className={!change.before ? 'empty' : ''}>{change.before || '—'}</code>
                    <code className={!change.after ? 'empty' : ''}>{change.after || '—'}</code>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'traffic' && (
        <section className="traffic-config-panel">
          <div className="traffic-config-heading">
            <h2>Traffic Configuration</h2>
            <div>
              <button className="traffic-history-button" onClick={() => setShowTrafficHistory(true)}>Adjustment History</button>
              <button className="traffic-adjust-button" onClick={openTrafficAdjustment}>Adjust Production Traffic</button>
            </div>
          </div>
          <div className="traffic-environment-tabs" role="tablist" aria-label="Traffic environment">
            <button role="tab" aria-selected={trafficEnvironment === 'production'} className={trafficEnvironment === 'production' ? 'active' : ''} onClick={() => setTrafficEnvironment('production')}>Production</button>
            <button role="tab" aria-selected={trafficEnvironment === 'pre-production'} className={trafficEnvironment === 'pre-production' ? 'active' : ''} onClick={() => setTrafficEnvironment('pre-production')}>Pre-Production</button>
          </div>
          <div className="traffic-table-wrap">
            <table className="traffic-table">
              <thead><tr><th>Version No.</th><th>Traffic Configuration</th><th>Fallback Traffic</th></tr></thead>
              <tbody>
                {trafficConfiguration[trafficEnvironment].map((item) => (
                  <tr key={`${trafficEnvironment}-${item.version}`}>
                    <td><span>{item.version}</span></td>
                    <td><strong>{item.traffic}%</strong></td>
                    <td>{item.fallback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'monitoring' && (
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
            <h3>Request Overview</h3>
            <span>⌕</span><strong>No data available</strong><p>Requests for the selected period will appear here.</p>
          </div>
        </section>
      )}

      {showTrafficHistory && (
        <div className="version-modal-backdrop" role="presentation" onMouseDown={() => setShowTrafficHistory(false)}>
          <section className="version-modal traffic-modal" role="dialog" aria-modal="true" aria-labelledby="traffic-history-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="version-modal-close" onClick={() => setShowTrafficHistory(false)} aria-label="Close adjustment history">×</button>
            <h2 id="traffic-history-title">Adjustment History</h2>
            <p>Production traffic changes for this Policy.</p>
            <div className="traffic-history-list">
              <article><strong>V1.0.3: 70% · V1.0.2: 30%</strong><span>Adjusted by luke.wn</span><time>Jul 27, 2026 11:26</time></article>
              <article><strong>V1.0.3: 100%</strong><span>Adjusted by gaochaoxiang.gcx</span><time>Jul 25, 2026 16:09</time></article>
            </div>
          </section>
        </div>
      )}

      {showTrafficAdjustment && (
        <div className="version-modal-backdrop" role="presentation" onMouseDown={() => setShowTrafficAdjustment(false)}>
          <section className="version-modal traffic-modal" role="dialog" aria-modal="true" aria-labelledby="traffic-adjust-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="version-modal-close" onClick={() => setShowTrafficAdjustment(false)} aria-label="Close traffic adjustment">×</button>
            <h2 id="traffic-adjust-title">Adjust Production Traffic</h2>
            <p>Allocate production traffic across Policy versions. The total must equal 100%.</p>
            <div className="traffic-adjust-list">
              {trafficDraft.map((item, index) => (
                <label key={item.version}><span>{item.version}</span><input type="number" min="0" max="100" value={item.traffic} onChange={(event) => setTrafficDraft((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, traffic: Number(event.target.value) } : entry))} /><em>%</em></label>
              ))}
            </div>
            <div className={`traffic-total ${trafficDraft.reduce((sum, item) => sum + item.traffic, 0) === 100 ? 'valid' : ''}`}><span>Total</span><strong>{trafficDraft.reduce((sum, item) => sum + item.traffic, 0)}%</strong></div>
            <div className="version-modal-actions"><button className="modal-secondary" onClick={() => setShowTrafficAdjustment(false)}>Cancel</button><button className="modal-primary" disabled={trafficDraft.reduce((sum, item) => sum + item.traffic, 0) !== 100} onClick={saveTrafficAdjustment}>Save Traffic</button></div>
          </section>
        </div>
      )}

      {showNewVersion && (
        <div className="version-modal-backdrop" role="presentation" onMouseDown={() => setShowNewVersion(false)}>
          <section className="version-modal" role="dialog" aria-modal="true" aria-labelledby="new-version-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="version-modal-close" onClick={() => setShowNewVersion(false)} aria-label="Close new version dialog">×</button>
            <h2 id="new-version-title">Create New Version</h2>
            <p>A new draft will copy the Policy canvas, parameters, and all Decision version references from {newVersionBase}.</p>
            <label>Based on<select value={newVersionBase} onChange={(event) => setNewVersionBase(event.target.value)}>{versions.map((version) => <option key={version.id}>{version.id}</option>)}</select></label>
            <label>Description<textarea defaultValue="Update policy execution flow" /></label>
            <div className="version-modal-actions"><button className="modal-secondary" onClick={() => setShowNewVersion(false)}>Cancel</button><button className="modal-primary" onClick={createVersion}>Create Version</button></div>
          </section>
        </div>
      )}

      {showCopyPolicy && (
        <div className="version-modal-backdrop" role="presentation" onMouseDown={() => setShowCopyPolicy(false)}>
          <section className="version-modal copy-policy-modal" role="dialog" aria-modal="true" aria-labelledby="copy-policy-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="version-modal-close" onClick={() => setShowCopyPolicy(false)} aria-label="Close copy policy dialog">×</button>
            <h2 id="copy-policy-title">Copy as a New Policy</h2>
            <p>Create an independent Policy using the selected version as a starting point. The original Policy will not be changed.</p>
            <div className="copy-source-summary">
              <span>Source Policy</span><strong>{policyName}</strong>
              <span>Copies</span><strong>Canvas · Decision versions · Parameters · Outputs</strong>
            </div>
            <label>Source version<select value={copySourceVersion} onChange={(event) => setCopySourceVersion(event.target.value)}>{versions.map((version) => <option key={version.id}>{version.id}</option>)}</select></label>
            <label>New Policy name<input autoFocus value={copyPolicyName} onChange={(event) => setCopyPolicyName(event.target.value)} placeholder="Enter a unique Policy name" /></label>
            <div className="copy-policy-fields">
              <label>Category<select defaultValue="AE · Credit"><option>AE · Credit</option><option>AE · Risk</option><option>BNPL · Credit</option></select></label>
              <label>Workspace<select defaultValue="BR Business"><option>BR Business</option><option>Global Risk</option></select></label>
            </div>
            <label>Description<textarea value={copyPolicyDescription} onChange={(event) => setCopyPolicyDescription(event.target.value)} /></label>
            <div className="copy-policy-note"><span>i</span><p>Traffic, monitoring data, records, and approval tasks will not be copied.</p></div>
            <div className="version-modal-actions"><button className="modal-secondary" onClick={() => setShowCopyPolicy(false)}>Cancel</button><button className="modal-primary" disabled={!copyPolicyName.trim()} onClick={copyAsNewPolicy}>Copy Policy</button></div>
          </section>
        </div>
      )}
    </div>
  )
}

export default PolicyDetailPage
