import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import './PolicyOverviewPage.css'
import '../detail/PolicyDetailPage.css'

const policyTabs = [
  { key: 'details', label: 'Details' },
  { key: 'parameters', label: 'Parameters' },
  { key: 'records', label: 'Records' },
  { key: 'traffic', label: 'Traffic' },
  { key: 'monitoring', label: 'Monitoring' },
]

const parameters = {
  customer: [
    { name: 'user_id', type: 'string', description: 'Unique customer identifier passed by the calling system.', defaultValue: '—' },
    { name: 'shop_id', type: 'string', description: 'Shop identifier passed by the calling system.', defaultValue: '—' },
  ],
  feature: [
    { name: 'age', type: 'number', description: 'Customer age returned by the User data component.' },
    { name: 'monthly_income', type: 'number', description: 'Verified monthly income returned by the User data component.' },
    { name: 'credit_report_score', type: 'number', description: 'Credit score returned by the Credit Report component.' },
    { name: 'shop_risk_level', type: 'string', description: 'Risk level returned by the Shop data component.' },
  ],
  output: [
    { name: 'approved', type: 'boolean', source: 'Eligibility Rule.approved', returnedBy: 'Policy End' },
    { name: 'credit_limit', type: 'number', source: 'Pricing Rule.final_limit', returnedBy: 'Policy End' },
    { name: 'interest_rate', type: 'number', source: 'Pricing Rule.rate', returnedBy: 'Policy End' },
    { name: 'loan_term', type: 'number', source: 'Pricing Rule.term', returnedBy: 'Policy End' },
  ],
}

const decisionParameterConfigs = [
  { key: 'policy-parameter-management', label: 'Policy Parameter Management' },
  {
    key: 'credit_eligibility_decision',
    label: 'credit_eligibility_decision',
    version: 'V2.1.0',
    custom: [
      ['user_id', 'Unique customer identifier'],
      ['shop_id', 'Shop identifier'],
      ['requested_amount', 'Requested credit amount'],
    ],
    feature: [
      ['age', 'Customer age'],
      ['credit_report_score', 'Credit report score'],
      ['monthly_income', 'Verified monthly income'],
    ],
    outputs: ['approved', 'customer_tier', 'risk_score'],
  },
  {
    key: 'limit_pricing_decision',
    label: 'limit_pricing_decision',
    version: 'V1.4.2',
    custom: [['user_id', 'Unique customer identifier'], ['requested_amount', 'Requested credit amount']],
    feature: [['monthly_income', 'Verified monthly income'], ['credit_report_score', 'Credit report score']],
    outputs: ['credit_limit', 'interest_rate', 'loan_term'],
  },
  {
    key: 'anti_fraud_decision',
    label: 'anti_fraud_decision',
    version: 'V0.9.0',
    custom: [['user_id', 'Unique customer identifier'], ['application_channel', 'Application channel']],
    feature: [['shop_risk_level', 'Shop risk level'], ['credit_report_score', 'Credit report score']],
    outputs: ['fraud_score', 'fraud_reason'],
  },
]

const policyAvailableInputs = [
  'Custom · user_id',
  'Custom · shop_id',
  'Custom · requested_amount',
  'Custom · application_channel',
  'Feature · age',
  'Feature · monthly_income',
  'Feature · credit_report_score',
  'Feature · shop_risk_level',
]

const policyOutputTargets = [
  'approved',
  'credit_limit',
  'interest_rate',
  'loan_term',
  'risk_score',
  'fraud_score',
  'reject_reason',
]

const initialPolicyInputParameters = [
  { name: 'buyerAdminSeq', description: 'Buyer admin sequence', type: 'string' },
  { name: 'DVGPS001_RES', description: 'DVGPS001 response', type: 'string' },
  { name: 'simulationMark', description: 'Simulation mark', type: 'string' },
  { name: 'dataReqId', description: 'Data request ID', type: 'string' },
  { name: 'personSignId', description: 'Person sign ID', type: 'string' },
  { name: 'creditGrantNo', description: 'Credit grant number', type: 'string' },
]

const policyRecords = [
  { actor: 'luke.wn', action: 'Created', target: 'Policy version V1.0.4', detail: 'Copied from V1.0.3', time: 'Jul 27, 2026 11:26' },
  { actor: 'gaochaoxiang.gcx', action: 'Added', target: 'anti_fraud_decision', detail: 'Added Decision node to Policy Canvas', time: 'Jul 27, 2026 10:18' },
  { actor: 'luke.wn', action: 'Updated', target: 'credit_eligibility_decision', detail: 'Changed input binding: credit_report_score', time: 'Jul 27, 2026 09:47' },
  { actor: 'risk.admin', action: 'Deleted', target: 'legacy_limit_decision', detail: 'Removed Decision node from V1.0.3 draft', time: 'Jul 26, 2026 17:32' },
  { actor: 'luke.wn', action: 'Published', target: 'Policy version V1.0.3', detail: 'Promoted version to Active', time: 'Jul 25, 2026 16:09' },
]

const policyVersionDiffs = {
  'V1.0.4': { base: 'V1.0.3', status: 'Draft', changes: [
    { type: 'added', scope: 'Decision', target: 'anti_fraud_decision', detail: 'Added to the Policy Canvas', after: 'Decision V0.9.0' },
    { type: 'updated', scope: 'Decision version', target: 'credit_eligibility_decision', detail: 'Changed the referenced Decision version', before: 'V2.0.3', after: 'V2.1.0' },
  ] },
  'V1.0.3': { base: 'V1.0.2', status: 'Active', changes: [
    { type: 'added', scope: 'Decision', target: 'limit_pricing_decision', detail: 'Added pricing calculation to the Policy Canvas', after: 'Decision V1.4.1' },
    { type: 'updated', scope: 'Output', target: 'interest_rate', detail: 'Changed the output source', before: 'base_rate', after: 'Pricing Rule.rate' },
  ] },
}

const policyProfiles = {
  '1': {
    name: 'kwai_disburse_policy',
    description: 'Kwai real-time credit eligibility, limit and pricing policy.',
    category: 'AE',
    createdBy: 'gaochaoxiang.gcx',
    createdAt: '2025-10-20 14:13:47',
    code: 'code_1760940824695',
  },
  '2': {
    name: 'bnpl_credit_policy',
    description: 'BNPL credit policy for customer eligibility, limit and pricing.',
    category: 'AE',
    createdBy: 'hushoufu.hsf',
    createdAt: '2025-10-20 14:13:47',
    code: 'code_1760940824702',
  },
}

const initialVersions = [
  { version: 'V1.0.3', updatedBy: 'gaochaoxiang.gcx', updatedAt: '2026-08-11 14:22', status: 'Active', online: true, traffic: 70 },
  { version: 'V1.0.2', updatedBy: 'gaochaoxiang.gcx', updatedAt: '2026-08-10 11:22', status: 'Active', online: true, traffic: 30 },
  { version: 'V1.0.1', updatedBy: 'luke.wn', updatedAt: '2026-08-04 15:06', status: 'Offline', online: false, traffic: 0 },
]

function ParameterMappingGroup({ title, rows, groupKey, mappings, onChange }) {
  return (
    <div className="decision-input-group">
      <div className="decision-input-group-header"><strong>{title}</strong><span>Input Parameter Mapping</span></div>
      <div className="decision-input-mapping-list">
        {rows.map(([name, description]) => {
          const field = `${groupKey}-${name}`
          return <label className="decision-input-mapping-row" key={field}>
            <span><b>{name}</b><small>{description}</small></span>
            <select value={mappings[field] || ''} onChange={(event) => onChange(field, event.target.value)}>
              <option value="">Select</option>
              {policyAvailableInputs.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        })}
      </div>
    </div>
  )
}

function PolicyOverviewPage() {
  const { id = '1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(policyTabs.some((tab) => tab.key === requestedTab) ? requestedTab : 'details')
  const [versionView, setVersionView] = useState('online')
  const [versions, setVersions] = useState(initialVersions)
  const [showMore, setShowMore] = useState(true)
  const [trafficEnvironment, setTrafficEnvironment] = useState('production')
  const [parameterType, setParameterType] = useState('input')
  const [parameterSearch, setParameterSearch] = useState('')
  const [selectedDecisionParameter, setSelectedDecisionParameter] = useState(decisionParameterConfigs[1].key)
  const [parameterMappings, setParameterMappings] = useState({})
  const [policyOutputMappings, setPolicyOutputMappings] = useState({})
  const [policyInputParameters, setPolicyInputParameters] = useState(initialPolicyInputParameters)
  const [parameterPolicyVersion, setParameterPolicyVersion] = useState('V1.0.3')
  const [recordsView, setRecordsView] = useState('records')
  const [diffVersion, setDiffVersion] = useState('V1.0.4')
  const profile = policyProfiles[id] || policyProfiles['1']

  const visibleVersions = useMemo(() => versions.filter((item) => versionView === 'online' ? item.online : !item.online), [versionView, versions])
  const visibleParameters = useMemo(() => {
    const query = parameterSearch.trim().toLowerCase()
    const source = parameterType === 'input'
      ? [
          ...parameters.customer.map((item) => ({ ...item, inputType: 'custom' })),
          ...parameters.feature.map((item) => ({ ...item, inputType: 'feature' })),
        ]
      : parameters.output
    if (!query) return source
    return source.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(query)))
  }, [parameterSearch, parameterType])
  const activeVersionDiff = policyVersionDiffs[diffVersion]
  const activeDecisionParameter = decisionParameterConfigs.find((item) => item.key === selectedDecisionParameter) || decisionParameterConfigs[1]

  const setParameterMapping = (field, value) => {
    setParameterMappings((current) => ({ ...current, [field]: value }))
  }

  const setOutputMapping = (field, value) => {
    setPolicyOutputMappings((current) => ({ ...current, [field]: { ...current[field], ...value } }))
  }

  const updatePolicyInput = (index, field, value) => {
    setPolicyInputParameters((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const addPolicyInput = () => {
    setPolicyInputParameters((current) => [...current, { name: '', description: '', type: 'string' }])
  }

  const changeTab = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'details' ? {} : { tab }, { replace: true })
  }

  const createVersion = () => {
    const nextPatch = Math.max(...versions.map((item) => Number(item.version.split('.').at(-1)))) + 1
    setVersions((current) => [{ version: `V1.0.${nextPatch}`, updatedBy: 'luke.wn', updatedAt: '2026-08-16 10:30', status: 'Draft', online: true, traffic: 0 }, ...current])
    setVersionView('online')
  }

  return (
    <div className="policy-overview-page">
      <div className="policy-overview-breadcrumb"><Link to="/policy">Policy</Link><span>/</span><span>{profile.name}</span></div>

      <div className="policy-overview-title">
        <Link to="/policy" aria-label="Back to Policy">‹</Link>
        <h1>{profile.name}</h1>
        <span className="policy-overview-status"><i />Online</span>
        <button onClick={createVersion}>＋ New Version</button>
      </div>

      <div className="policy-overview-tabs" role="tablist">
        {policyTabs.map((tab) => (
          <button key={tab.key} role="tab" aria-selected={activeTab === tab.key} className={activeTab === tab.key ? 'active' : ''} onClick={() => changeTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <>
          <section className="policy-overview-card basic-information-card">
            <h2>Basic Information</h2>
            <dl>
              <div><dt>Name</dt><dd>{profile.name}<button aria-label="Edit policy name">⌕</button></dd></div>
              <div><dt>Description</dt><dd>{profile.description}<button aria-label="Edit description">⌕</button></dd></div>
              <div><dt>Category</dt><dd><select defaultValue={profile.category}><option>AE</option><option>BR</option><option>MX</option></select></dd></div>
              {showMore && <>
                <div><dt>Created By</dt><dd>{profile.createdBy}</dd></div>
                <div><dt>Created At</dt><dd>{profile.createdAt}</dd></div>
                <div><dt>Code</dt><dd>{profile.code}</dd></div>
              </>}
            </dl>
            <button className="policy-information-toggle" onClick={() => setShowMore((current) => !current)}>{showMore ? 'Collapse⌃' : 'Show All⌄'}</button>
          </section>

          <section className="policy-overview-card versions-card">
            <h2>Versions</h2>
            <div className="version-state-tabs" role="tablist">
              <button role="tab" aria-selected={versionView === 'online'} className={versionView === 'online' ? 'active' : ''} onClick={() => setVersionView('online')}>Online</button>
              <button role="tab" aria-selected={versionView === 'offline'} className={versionView === 'offline' ? 'active' : ''} onClick={() => setVersionView('offline')}>Offline</button>
            </div>
            <div className="policy-version-table-wrap">
              <table className="policy-version-table">
                <thead><tr><th>Version No.</th><th>Last Updated By</th><th>Last Updated At</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {visibleVersions.map((item) => (
                    <tr key={item.version}>
                      <td><span className="policy-version-pill">{item.version}</span></td>
                      <td><span className="policy-version-user"><i>{item.updatedBy[0].toUpperCase()}</i>{item.updatedBy}</span></td>
                      <td>{item.updatedAt}</td>
                      <td><span className={`policy-version-status ${item.status.toLowerCase()}`}><i />{item.status}</span></td>
                      <td>
                        <div className="policy-version-actions">
                          <Link to={`/policy/${id}/edit?version=${item.version}`}>Details</Link>
                          <button onClick={() => changeTab('traffic')}>Adjust Traffic</button>
                          <button className="more" aria-label={`More actions for ${item.version}`}>•••</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === 'parameters' && (
        <section className="parameter-panel decision-parameter-panel">
          <div className="parameter-version-toolbar">
            <span>Policy Version</span>
            <select value={parameterPolicyVersion} onChange={(event) => setParameterPolicyVersion(event.target.value)} aria-label="Policy version">
              <option value="V1.0.3">V1.0.3 · Active</option>
              <option value="V1.0.2">V1.0.2 · Active</option>
              <option value="V1.0.1">V1.0.1 · Offline</option>
            </select>
          </div>
          <div className="decision-parameter-tabs" role="tablist" aria-label="Decision parameter configuration">
            {decisionParameterConfigs.map((item) => (
              <button key={item.key} role="tab" aria-selected={selectedDecisionParameter === item.key} className={selectedDecisionParameter === item.key ? 'active' : ''} onClick={() => setSelectedDecisionParameter(item.key)}>
                <span>{item.label}</span>{item.version && <small>{item.version}</small>}
              </button>
            ))}
          </div>
          {selectedDecisionParameter === 'policy-parameter-management' ? (
            <div className="policy-parameter-management">
              <div className="policy-parameter-management-title"><h3>Input Parameter</h3><button onClick={addPolicyInput} aria-label="Add input parameter">＋</button></div>
              <div className="policy-parameter-management-head"><span>Name</span><span>Description</span><span>Type</span><span /></div>
              <div className="policy-parameter-management-list">
                {policyInputParameters.map((item, index) => (
                  <div className="policy-parameter-management-row" key={`${item.name}-${index}`}>
                    <input value={item.name} placeholder="Parameter name" onChange={(event) => updatePolicyInput(index, 'name', event.target.value)} />
                    <input value={item.description} placeholder="Description" onChange={(event) => updatePolicyInput(index, 'description', event.target.value)} />
                    <select value={item.type} onChange={(event) => updatePolicyInput(index, 'type', event.target.value)}><option>string</option><option>number</option><option>boolean</option><option>time</option></select>
                    <button onClick={() => setPolicyInputParameters((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Delete ${item.name || 'input parameter'}`}>⌫</button>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="decision-parameter-content">
            <div className="decision-parameter-title"><span className="decision-parameter-icon">◇</span><div><h3>{activeDecisionParameter.label}</h3><p>Decision version {activeDecisionParameter.version}</p></div></div>

            <section className="decision-parameter-section">
              <h3>Decision Input</h3>
              <ParameterMappingGroup title="Custom variable" rows={activeDecisionParameter.custom} groupKey={`${activeDecisionParameter.key}-custom`} mappings={parameterMappings} onChange={setParameterMapping} />
              <ParameterMappingGroup title="Feature Input" rows={activeDecisionParameter.feature} groupKey={`${activeDecisionParameter.key}-feature`} mappings={parameterMappings} onChange={setParameterMapping} />
            </section>

            <section className="decision-parameter-section decision-output-section">
              <h3>Decision Output</h3>
              <div className="decision-output-header"><span>Output Variable</span><span>Use as Policy Output</span><span>Assign to Temporary</span></div>
              {activeDecisionParameter.outputs.map((output) => {
                const field = `${activeDecisionParameter.key}-${output}`
                const mapping = policyOutputMappings[field] || {}
                return <div className="decision-output-config-row" key={field}>
                  <div><i>O</i><strong>{output}</strong></div>
                  <select value={mapping.policyOutput || 'excluded'} onChange={(event) => setOutputMapping(field, { policyOutput: event.target.value })} aria-label={`Policy output mapping for ${output}`}>
                    <option value="excluded">Excluded</option>
                    {policyOutputTargets.map((target) => <option key={target} value={target}>{target}</option>)}
                  </select>
                  <select value={mapping.temporary || ''} onChange={(event) => setOutputMapping(field, { temporary: event.target.value })}><option value="">Select</option><option>{output}</option><option>{`${output}_result`}</option></select>
                </div>
              })}
            </section>
          </div>}
        </section>
      )}

      {activeTab === 'records' && (
        <section className="policy-workspace-panel">
          <div className="panel-heading">
            <div><h2>{recordsView === 'records' ? 'Records' : 'Version Diff'}</h2><p>{recordsView === 'records' ? 'Complete audit history of additions, updates, deletions and version operations.' : 'Compare a Policy version with the base version it was created from.'}</p></div>
            {recordsView === 'records' && <div className="records-actions"><button>Filter</button><button>Export</button></div>}
          </div>
          <div className="records-subtabs" role="tablist"><button className={recordsView === 'records' ? 'active' : ''} onClick={() => setRecordsView('records')}>Activity Records</button><button className={recordsView === 'diff' ? 'active' : ''} onClick={() => setRecordsView('diff')}>Version Diff</button></div>
          {recordsView === 'records' ? <div className="records-timeline">{policyRecords.map((record, index) => <article className="record-item" key={`${record.time}-${record.target}`}><div className={`record-icon ${record.action.toLowerCase()}`}>{record.action === 'Deleted' ? '−' : record.action === 'Updated' ? '↻' : '+'}</div><div className="record-line" /><div className="record-copy"><div><strong>{record.actor}</strong><span className={`record-action ${record.action.toLowerCase()}`}>{record.action}</span><b>{record.target}</b></div><p>{record.detail}</p><time>{record.time}</time></div>{index === 0 && <span className="latest-record">Latest</span>}</article>)}</div> : (
            <div className="version-diff">
              <div className="version-diff-toolbar"><label><span>Version to compare</span><select value={diffVersion} onChange={(event) => setDiffVersion(event.target.value)}>{Object.keys(policyVersionDiffs).map((version) => <option key={version}>{version}</option>)}</select></label><span className="diff-direction">compared with</span><label><span>Base version</span><select disabled><option>{activeVersionDiff.base}</option></select></label><span className={`diff-status ${activeVersionDiff.status.toLowerCase()}`}>{activeVersionDiff.status}</span></div>
              <div className="diff-summary"><div><strong>{activeVersionDiff.changes.length}</strong><span>Total changes</span></div><div className="added"><strong>{activeVersionDiff.changes.filter((item) => item.type === 'added').length}</strong><span>Added</span></div><div className="updated"><strong>{activeVersionDiff.changes.filter((item) => item.type === 'updated').length}</strong><span>Updated</span></div></div>
              <div className="diff-change-list"><div className="diff-list-header"><span>Change</span><span>Object</span><span>Details</span><span>Before</span><span>After</span></div>{activeVersionDiff.changes.map((change) => <article className="diff-change-row" key={`${diffVersion}-${change.target}`}><span className={`diff-change-type ${change.type}`}>{change.type === 'added' ? '+ Added' : '↻ Updated'}</span><div><small>{change.scope}</small><strong>{change.target}</strong></div><p>{change.detail}</p><code>{change.before || '—'}</code><code>{change.after || '—'}</code></article>)}</div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'traffic' && (
        <section className="policy-overview-card overview-traffic-card">
          <div className="overview-traffic-heading"><h2>Traffic Configuration</h2><div><button>Adjustment History</button><button>Adjust Production Traffic</button></div></div>
          <div className="overview-environment-tabs">
            <button className={trafficEnvironment === 'production' ? 'active' : ''} onClick={() => setTrafficEnvironment('production')}>Production</button>
            <button className={trafficEnvironment === 'pre-production' ? 'active' : ''} onClick={() => setTrafficEnvironment('pre-production')}>Pre-Production</button>
          </div>
          <table className="overview-traffic-table">
            <thead><tr><th>Version No.</th><th>Traffic Configuration</th><th>Fallback Traffic</th></tr></thead>
            <tbody>
              {(trafficEnvironment === 'production' ? versions.filter((item) => item.online) : versions.slice(0, 2)).map((item, index) => (
                <tr key={item.version}><td><span>{item.version}</span></td><td>{trafficEnvironment === 'production' ? item.traffic : index === 0 ? 100 : 0}%</td><td>{trafficEnvironment === 'pre-production' && index === 0 ? versions[1]?.version : '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'monitoring' && (
        <section className="policy-overview-card overview-monitor-card">
          <div className="overview-monitor-toolbar"><button>Today</button><span>08 / 16 / 2026&nbsp;&nbsp;–&nbsp;&nbsp;08 / 16 / 2026</span></div>
          <div className="overview-metrics"><div><span>Success Rate</span><strong>—</strong></div><div className="blue"><span>Total Requests</span><strong>0</strong></div><div className="green"><span>Success</span><strong>0</strong></div><div className="violet"><span>Failed</span><strong>0</strong></div></div>
          <div className="overview-monitor-empty"><h3>Request Overview</h3><span>⌕</span><strong>No data available</strong><p>Requests for the selected period will appear here.</p></div>
        </section>
      )}
    </div>
  )
}

export default PolicyOverviewPage
