import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './PolicyCanvasEditorPage.css'

const customInputs = [
  ['personSignId', 'Personal identity token'],
  ['buyerAdminSeq', 'Buyer ID'],
  ['credit_user_id', 'Credit user ID'],
  ['cpf', 'CPF number'],
  ['name', 'Customer name'],
  ['ipAddress', 'Client IP address'],
  ['sessionId', 'Session ID'],
  ['creditGrantNo', 'Credit grant number'],
  ['nationality', 'Nationality'],
]

const featureInputs = [
  ['creditRequestDate', 'Credit request time'],
  ['instanceId', 'Application instance ID'],
  ['rawText', 'Original request payload'],
  ['creditAccessToken', 'Credit access token'],
  ['callbackSystem', 'Callback system'],
  ['monthly_income', 'Monthly income'],
  ['credit_report_score', 'Credit report score'],
]

const decisionOutputs = ['approved', 'customer_segment', 'risk_score', 'reject_reason']

function ParameterRows({ rows }) {
  return (
    <div className="policy-mapping-list">
      {rows.map(([name, description]) => (
        <div className="policy-mapping-row" key={name}>
          <span><strong>{name}</strong><small>{description}</small></span>
          <select defaultValue=""><option value="" disabled>Select</option><option>Policy input · user_id</option><option>Policy input · shop_id</option><option>Upstream output</option></select>
        </div>
      ))}
    </div>
  )
}

function PolicyCanvasEditorPage() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeVersion = searchParams.get('version') || 'V1.0.0'
  const [selectedNode, setSelectedNode] = useState('')
  const [drawer, setDrawer] = useState('')
  const [zoom, setZoom] = useState(1)
  const [showSearch, setShowSearch] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const drawerTitle = useMemo(() => {
    if (drawer === 'history') return 'History'
    if (drawer === 'parameters') return 'Policy parameter management'
    if (selectedNode === 'decision') return 'app_credit_new_customer_decision'
    if (selectedNode === 'ab-test') return 'A/B Testing 1'
    return ''
  }, [drawer, selectedNode])

  const openNode = (node) => {
    setDrawer('node')
    setSelectedNode(node)
  }

  const closeDrawer = () => {
    setDrawer('')
    setSelectedNode('')
  }

  return (
    <div className="policy-flow-editor">
      <aside className="policy-flow-library">
        <div className="policy-flow-side-head">
          <button onClick={() => navigate(`/policy/${id}`)} aria-label="Close">×</button>
          <button aria-label="Collapse sidebar">◫</button>
        </div>
        <div className="policy-flow-meta"><strong>kwai_disburse_policy</strong><span>{activeVersion}</span></div>
        <div className="policy-flow-library-title"><strong>Node</strong><button onClick={() => setShowSearch((value) => !value)}>⌕</button></div>
        {showSearch && <input className="policy-flow-search" autoFocus placeholder="Search node" />}
        <button className="policy-flow-library-item branch"><i>♧</i><span>Branch</span></button>
        <button className="policy-flow-library-item decision"><i>♧</i><span>Decision</span></button>
        <button className="policy-flow-library-item test"><i>⌘</i><span>A/B Test</span></button>
      </aside>

      <main className="policy-flow-stage" onClick={() => !drawer && setSelectedNode('')}>
        <div className="policy-flow-top-actions">
          <button title="History" onClick={() => { setDrawer('history'); setSelectedNode('') }}>↶</button>
          <button title="Policy parameter management" onClick={() => { setDrawer('parameters'); setSelectedNode('') }}>〔T〕</button>
          <button title="Guide">▣</button>
          <button className="submit" onClick={() => setSubmitted(true)}>Submit</button>
        </div>

        <div className="policy-flow-viewport" style={{ transform: `scale(${zoom})` }}>
          <div className="policy-flow-terminal input"><span>⇩</span><strong>Input</strong></div>
          <span className="policy-flow-line top" />
          <button className={`policy-flow-card decision ${selectedNode === 'decision' ? 'selected' : ''}`} onClick={(event) => { event.stopPropagation(); openNode('decision') }}>
            <i>♧</i><span><small>decision</small><strong>app_credit_new_customer_decision</strong></span><em>V1.0.0</em>
          </button>
          <span className="policy-flow-line middle" />
          <button className={`policy-flow-card test ${selectedNode === 'ab-test' ? 'selected' : ''}`} onClick={(event) => { event.stopPropagation(); openNode('ab-test') }}>
            <i>⌘</i><span><small>ab_test</small><strong>A/B Testing 1</strong></span>
          </button>
          <span className="policy-flow-line bottom" />
          <div className="policy-flow-terminal output"><span>↪</span><strong>Output</strong></div>
        </div>

        <div className="policy-flow-zoom">
          <button title="Arrange">⌘</button><button title="Ruler">⌁</button><button onClick={() => setZoom(1)} title="Fit">⛶</button>
          <button onClick={() => setZoom((value) => Math.max(.6, value - .1))}>−</button><strong>{Math.round(zoom * 100)}%</strong><button onClick={() => setZoom((value) => Math.min(1.5, value + .1))}>＋</button>
        </div>
      </main>

      {drawer && <button className="policy-flow-scrim" onClick={closeDrawer} aria-label="Close panel" />}
      <aside className={`policy-flow-drawer ${drawer ? 'open' : ''}`}>
        <header><button onClick={closeDrawer}>×</button><strong>{drawerTitle}</strong>{selectedNode === 'decision' && <><small>V1.0.0</small><Link to={`/decision/1/edit?from=policy-canvas&policy=${id}`}>Go to Decision ↗</Link></>}</header>

        {drawer === 'history' && (
          <div className="policy-history-panel">
            <div className="history-event"><i /><strong>04-Aug-2026 14:05:12</strong><p><b>luke.wn</b> updated Decision input mappings</p></div>
            <div className="history-event"><i /><strong>04-Aug-2026 13:48:26</strong><p><b>luke.wn</b> added A/B Testing 1</p></div>
            <div className="history-event"><i /><strong>16-Jul-2026 14:50:53</strong><p><b>luke.wn</b> created a new Policy development version</p></div>
          </div>
        )}

        {drawer === 'parameters' && (
          <div className="policy-parameter-panel">
            <section><div><strong>Input Parameter</strong><button>＋</button></div><p>Name <span>Description</span><span>Type</span></p><div className="policy-empty"><b>⌕</b><strong>No data</strong></div></section>
            <section><div><strong>Output Parameter</strong><button>＋</button></div><p>Name <span>Description</span><span>Type</span></p><div className="policy-empty"><b>⌕</b><strong>No data</strong></div></section>
          </div>
        )}

        {drawer === 'node' && selectedNode === 'decision' && (
          <div className="policy-node-config">
            <h3>Decision Input</h3>
            <h4><span>Custom variable</span><span>Input Parameter Mapping</span></h4>
            <ParameterRows rows={customInputs} />
            <h4><span>Feature Input</span><span>Input Parameter Mapping</span></h4>
            <ParameterRows rows={featureInputs} />
            <h3>Decision Output</h3>
            <div className="policy-output-head"><span>Output Variable</span><span>Use as Policy Output</span><span>Assign to Temporary</span></div>
            {decisionOutputs.map((output) => <div className="policy-output-row" key={output}><strong>{output}</strong><input type="checkbox" /><select defaultValue=""><option value="">Select</option><option>{output}</option></select></div>)}
          </div>
        )}

        {drawer === 'node' && selectedNode === 'ab-test' && (
          <div className="policy-node-config ab-config">
            <div className="ab-group"><strong><span>Control</span> Group 1</strong><em>Default Traffic 100%</em></div>
            <select className="ab-decision-select" defaultValue="credit"><option value="credit">bnpl_credit_new_ae_user_decision · V1.0.3</option></select>
            <h3>Decision Input</h3>
            <h4><span>Custom variable</span><span>Input Parameter Mapping</span></h4>
            <ParameterRows rows={customInputs.slice(0, 6)} />
            <h4><span>Feature Input</span><span>Input Parameter Mapping</span></h4>
            <ParameterRows rows={featureInputs.slice(0, 5)} />
            <h3>Decision Output</h3>
            <div className="policy-output-head"><span>Output Variable</span><span>Use as Policy Output</span><span>Assign to Temporary</span></div>
            {decisionOutputs.slice(0, 3).map((output) => <div className="policy-output-row" key={output}><strong>{output}</strong><input type="checkbox" /><select defaultValue=""><option value="">Select</option><option>{output}</option></select></div>)}
          </div>
        )}
      </aside>

      {submitted && (
        <div className="policy-submit-overlay" onClick={() => setSubmitted(false)}>
          <div><span /><strong>Validating Policy configuration…</strong><small>Click anywhere to close</small></div>
        </div>
      )}
    </div>
  )
}

export default PolicyCanvasEditorPage
