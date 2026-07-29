import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import './PolicyDetailPage.css'

const tabs = [
  { key: 'details', label: 'Details' },
  { key: 'canvas', label: 'Canvas' },
  { key: 'decisions', label: 'Decisions', count: 3 },
  { key: 'parameters', label: 'Parameters' },
  { key: 'ab-testing', label: 'A/B Testing' },
  { key: 'case-tracker', label: 'Case Tracker' },
  { key: 'records', label: 'Records' },
  { key: 'approval', label: 'Approval' },
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
  },
  {
    id: 'limit-pricing',
    name: 'limit_pricing_decision',
    description: 'Calculate credit limit, rate and repayment term',
    versions: ['V1.4.2', 'V1.4.1', 'V1.3.6'],
    nodes: ['Start', 'Limit Table', 'Pricing Rule', 'End'],
  },
  {
    id: 'anti-fraud',
    name: 'anti_fraud_decision',
    description: 'Fraud screening before final policy response',
    versions: ['V0.9.0', 'V0.8.4', 'V0.8.1'],
    nodes: ['Start', 'Fraud Score', 'If-Else Rule', 'End'],
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

const policyExperiments = [
  { name: 'limit_strategy_champion_challenger', versions: 'V1.0.3 / V1.0.4', traffic: '80% / 20%', metric: 'Approval Rate', status: 'Running', started: 'Jul 25, 2026' },
  { name: 'pricing_rate_validation', versions: 'V1.0.2 / V1.0.3', traffic: '50% / 50%', metric: 'Default Rate', status: 'Completed', started: 'Jul 10, 2026' },
]

const policyCases = [
  { id: 'CASE-2026-0727-018', request: 'REQ-8K21V4', decision: 'Approved', version: 'V1.0.3', owner: 'luke.wn', created: 'Jul 27, 2026 10:42' },
  { id: 'CASE-2026-0727-011', request: 'REQ-8K20P9', decision: 'Rejected', version: 'V1.0.3', owner: 'risk.ops', created: 'Jul 27, 2026 09:31' },
  { id: 'CASE-2026-0726-096', request: 'REQ-8J91M2', decision: 'Manual Review', version: 'V1.0.2', owner: 'chenyu.cy', created: 'Jul 26, 2026 18:05' },
]

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

const policyApprovalTasks = [
  { id: 'APR-20260728-017', change: 'Publish version V1.0.4', submittedBy: 'luke.wn', submittedAt: 'Jul 28, 2026 10:18', status: 'Pending' },
  { id: 'APR-20260727-032', change: 'Publish version V1.0.3', submittedBy: 'gaochaoxiang.gcx', submittedAt: 'Jul 27, 2026 16:42', status: 'Pending' },
]

const initialVersions = [
  { id: 'V1.0.3', status: 'Active' },
  { id: 'V1.0.2', status: 'Offline' },
  { id: 'V1.0.1', status: 'Archived' },
]

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

function PolicyDetailPage() {
  const { id = '1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(() => (
    tabs.some((tab) => tab.key === requestedTab) ? requestedTab : 'canvas'
  ))
  const [expandedDecision, setExpandedDecision] = useState(decisions[0].id)
  const [inspectedDecisionNode, setInspectedDecisionNode] = useState('')
  const [recordsView, setRecordsView] = useState('records')
  const [diffVersion, setDiffVersion] = useState('V1.0.4')
  const [parameterType, setParameterType] = useState('feature')
  const [parameterSearch, setParameterSearch] = useState('')
  const [dateRange, setDateRange] = useState('Today')
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
          <div className="policy-canvas">
            <div className="canvas-lane-label">Main flow</div>
            <MiniFlow
              nodes={['Start', 'credit_eligibility_decision', 'limit_pricing_decision', 'anti_fraud_decision', 'End']}
              onNodeClick={setSelectedPolicyDecision}
              selectedNode={selectedPolicyDecision}
            />
            <div className="canvas-context">
              <span><b>User</b> · user_id</span>
              <span><b>Shop</b> · shop_id</span>
              <span>4 outputs</span>
            </div>
            {selectedDecision && (
              <aside className="canvas-node-inspector">
                <button className="inspector-close" onClick={() => setSelectedPolicyDecision('')} aria-label="Close node details">×</button>
                <span className="inspector-type">Decision</span>
                <h3>{selectedDecision.name}</h3>
                <p>{selectedDecision.description}</p>
                <dl>
                  <div><dt>Decision Version</dt><dd>{activeDecisionReferences[selectedDecision.id]}</dd></div>
                  <div><dt>Policy Version</dt><dd>{activeVersion}</dd></div>
                  <div><dt>Nodes</dt><dd>{selectedDecision.nodes.length}</dd></div>
                </dl>
                <Link to={`/decision/${selectedDecision.id}/edit?version=${activeDecisionReferences[selectedDecision.id]}&from=policy&policy=${id}&returnTab=canvas`}>Open Decision Canvas →</Link>
              </aside>
            )}
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
                  <div className="decision-card-header">
                    <button
                      type="button"
                      className="decision-card-toggle"
                      aria-expanded={expanded}
                      onClick={() => {
                        setExpandedDecision(expanded ? '' : decision.id)
                        setInspectedDecisionNode('')
                      }}
                    >
                      <span className="decision-caret">{expanded ? '⌄' : '›'}</span>
                      <span className="decision-symbol">◇</span>
                      <span className="decision-copy"><strong>{decision.name}</strong><small>{decision.description}</small></span>
                    </button>
                    <select
                      className="decision-version-select"
                      aria-label={`${decision.name} version`}
                      value={activeDecisionReferences[decision.id]}
                      onChange={(event) => updateDecisionReference(decision.id, event.target.value)}
                    >
                      {decision.versions.map((version) => <option key={version}>{version}</option>)}
                    </select>
                    <span className="decision-node-count">{decision.nodes.length} nodes</span>
                  </div>
                  {expanded && (
                    <div className="decision-expanded">
                      <div className="decision-node-list-heading">
                        <div><strong>Nodes</strong><span>{decision.nodes.length} nodes in this version</span></div>
                        <Link to={`/decision/${decision.id}/edit?version=${activeDecisionReferences[decision.id]}&from=policy&policy=${id}&returnTab=decisions`}>Open full canvas →</Link>
                      </div>
                      <div className="decision-node-list">
                        {decision.nodes.map((node, index) => {
                          const details = decisionNodeDetails[decision.id][node]
                          const nodeKey = `${decision.id}:${node}`
                          const selected = inspectedDecisionNode === nodeKey
                          return (
                            <div className={`decision-node-row ${selected ? 'selected' : ''}`} key={node}>
                              <button type="button" onClick={() => setInspectedDecisionNode(selected ? '' : nodeKey)}>
                                <span className="decision-node-order">{index + 1}</span>
                                <span className="decision-node-list-icon">{details.type === 'Start' || details.type === 'End' ? '●' : '▤'}</span>
                                <span className="decision-node-main"><strong>{node}</strong><small>{details.type}</small></span>
                                <span className="decision-node-io">{details.inputs}</span>
                                <span className="decision-node-open">{selected ? '⌃' : '⌄'}</span>
                              </button>
                              {selected && (
                                <div className="decision-node-details">
                                  <p>{details.description}</p>
                                  <dl>
                                    <div><dt>Inputs</dt><dd>{details.inputs}</dd></div>
                                    <div><dt>Outputs</dt><dd>{details.outputs}</dd></div>
                                  </dl>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
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

      {activeTab === 'ab-testing' && (
        <section className="policy-workspace-panel">
          <div className="panel-heading">
            <div><h2>A/B Testing</h2><p>Compare Policy versions by traffic allocation and business outcome.</p></div>
            <button className="panel-primary-action">＋ Create Test</button>
          </div>
          <div className="workspace-summary">
            <div><span>Running Tests</span><strong>1</strong></div>
            <div><span>Total Traffic</span><strong>100%</strong></div>
            <div><span>Primary Metric</span><strong>Approval Rate</strong></div>
          </div>
          <div className="workspace-table-wrap">
            <table className="workspace-table">
              <thead><tr><th>Test Name</th><th>Versions</th><th>Traffic Split</th><th>Primary Metric</th><th>Status</th><th>Started At</th><th /></tr></thead>
              <tbody>
                {policyExperiments.map((test) => (
                  <tr key={test.name}>
                    <td><strong>{test.name}</strong></td><td>{test.versions}</td><td>{test.traffic}</td><td>{test.metric}</td>
                    <td><span className={`workspace-status ${test.status.toLowerCase()}`}>{test.status}</span></td><td>{test.started}</td><td><button>Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'case-tracker' && (
        <section className="policy-workspace-panel">
          <div className="panel-heading">
            <div><h2>Case Tracker</h2><p>Trace individual requests and review the result produced by this Policy.</p></div>
            <label className="inline-search"><span>⌕</span><input placeholder="Search case or request ID" /></label>
          </div>
          <div className="workspace-filters">
            <button className="active">All Cases</button><button>Approved</button><button>Rejected</button><button>Manual Review</button>
          </div>
          <div className="workspace-table-wrap">
            <table className="workspace-table">
              <thead><tr><th>Case ID</th><th>Request ID</th><th>Decision</th><th>Policy Version</th><th>Owner</th><th>Created At</th><th /></tr></thead>
              <tbody>
                {policyCases.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td><td><code>{item.request}</code></td>
                    <td><span className={`case-result ${item.decision.toLowerCase().replace(' ', '-')}`}>{item.decision}</span></td>
                    <td>{item.version}</td><td>{item.owner}</td><td>{item.created}</td><td><button>Open</button></td>
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

      {activeTab === 'approval' && (
        <section className="policy-workspace-panel">
          <div className="panel-heading">
            <div><h2>My Task</h2><p>Policy changes waiting for your approval.</p></div>
            <label className="inline-search"><span>⌕</span><input placeholder="Search task ID or change" /></label>
          </div>
          <div className="workspace-table-wrap">
            <table className="workspace-table">
              <thead>
                <tr><th>Task ID</th><th>Change</th><th>Submitted By</th><th>Submitted At</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {policyApprovalTasks.map((task) => (
                  <tr key={task.id}>
                    <td><strong>{task.id}</strong></td>
                    <td>{task.change}</td>
                    <td>{task.submittedBy}</td>
                    <td>{task.submittedAt}</td>
                    <td><span className="workspace-status running">{task.status}</span></td>
                    <td><button>Review</button></td>
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
