import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './PolicyCanvasEditorPage.css'

const policyDecisions = [
  {
    id: 'credit-eligibility',
    name: 'credit_eligibility_decision',
    description: 'Validate customer eligibility and base risk rules',
    status: 'Online',
    inputs: ['age', 'monthly_income', 'credit_report_score'],
    outputs: ['approved', 'customer_segment', 'risk_score'],
    x: 350,
    y: 310,
  },
  {
    id: 'limit-pricing',
    name: 'limit_pricing_decision',
    description: 'Calculate credit limit, interest rate and repayment term',
    status: 'Online',
    inputs: ['monthly_income', 'customer_segment', 'risk_score'],
    outputs: ['credit_limit', 'interest_rate', 'loan_term'],
    x: 690,
    y: 310,
  },
  {
    id: 'anti-fraud',
    name: 'anti_fraud_decision',
    description: 'Fraud screening before the policy returns its result',
    status: 'Draft',
    inputs: ['shop_risk_level', 'user_id', 'shop_id'],
    outputs: ['fraud_passed'],
    x: 1030,
    y: 310,
  },
]

const editorVersions = ['V1.0.4 · Draft', 'V1.0.3 · Active', 'V1.0.2 · Offline', 'V1.0.1 · Archived']

function PolicyCanvasEditorPage() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const canvasRef = useRef(null)
  const dragRef = useRef(null)
  const [nodes, setNodes] = useState(policyDecisions)
  const [selectedNodeId, setSelectedNodeId] = useState(policyDecisions[0].id)
  const [zoom, setZoom] = useState(1)
  const [showLibrary, setShowLibrary] = useState(false)
  const requestedVersion = searchParams.get('version') || 'V1.0.3'
  const [activeVersion, setActiveVersion] = useState(requestedVersion)

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId],
  )

  const changeVersion = (value) => {
    const version = value.split(' · ')[0]
    setActiveVersion(version)
    setSearchParams({ version }, { replace: true })
  }

  const startDrag = (event, nodeId) => {
    event.stopPropagation()
    const node = nodes.find((item) => item.id === nodeId)
    dragRef.current = {
      nodeId,
      startX: event.clientX,
      startY: event.clientY,
      nodeX: node.x,
      nodeY: node.y,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setSelectedNodeId(nodeId)
  }

  const moveNode = (event) => {
    if (!dragRef.current) return
    const drag = dragRef.current
    const nextX = drag.nodeX + (event.clientX - drag.startX) / zoom
    const nextY = drag.nodeY + (event.clientY - drag.startY) / zoom
    setNodes((current) => current.map((node) => (
      node.id === drag.nodeId
        ? { ...node, x: Math.max(240, nextX), y: Math.max(120, nextY) }
        : node
    )))
  }

  const stopDrag = () => {
    dragRef.current = null
  }

  const fitCanvas = () => setZoom(0.82)
  const zoomTo = (value) => setZoom(Math.min(1.5, Math.max(0.55, value)))

  return (
    <div className="policy-editor">
      <header className="policy-editor-topbar">
        <button className="policy-editor-close" onClick={() => navigate(`/policy/${id}?tab=canvas&version=${activeVersion}`)} aria-label="Close Policy Canvas">×</button>
        <div className="policy-editor-title">
          <strong>kwai_disburse_policy</strong>
          <span>{activeVersion} · Autosaved just now</span>
        </div>
        <span className="policy-editor-draft">● Unsubmitted changes</span>
        <div className="policy-editor-top-actions">
          <select aria-label="Policy Canvas version" value={editorVersions.find((item) => item.startsWith(activeVersion)) || editorVersions[1]} onChange={(event) => changeVersion(event.target.value)}>
            {editorVersions.map((version) => <option key={version}>{version}</option>)}
          </select>
          <button onClick={() => changeVersion('V1.0.4 · Draft')}>＋ New Version</button>
          <button className="publish-policy">Publish</button>
        </div>
      </header>

      <aside className="policy-editor-library">
        <div className="policy-editor-library-title"><strong>Policy Nodes</strong><span>⌕</span></div>
        <button className="policy-library-node"><span>▤</span><div><strong>Decision</strong><small>Reference a Decision component</small></div></button>
        <button className="policy-library-node"><span>⇥</span><div><strong>Output</strong><small>Return the final policy result</small></div></button>
        <div className="policy-library-help">
          <strong>Canvas tips</strong>
          <span>Scroll to zoom</span>
          <span>Drag nodes to arrange</span>
          <span>Click a node to inspect</span>
        </div>
      </aside>

      <main className="policy-editor-stage">
        <div
          ref={canvasRef}
          className="policy-editor-canvas"
          onPointerMove={moveNode}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onWheel={(event) => {
            event.preventDefault()
            zoomTo(zoom + (event.deltaY < 0 ? 0.08 : -0.08))
          }}
          onClick={() => setSelectedNodeId('')}
        >
          <div className="policy-editor-transform" style={{ transform: `scale(${zoom})` }}>
            <svg className="policy-editor-edges" width="1500" height="760" aria-hidden="true">
              <path d={`M 230 355 C 275 355, 300 355, ${nodes[0].x} 355`} />
              <path d={`M ${nodes[0].x + 260} ${nodes[0].y + 45} C ${nodes[0].x + 300} ${nodes[0].y + 45}, ${nodes[1].x - 40} ${nodes[1].y + 45}, ${nodes[1].x} ${nodes[1].y + 45}`} />
              <path d={`M ${nodes[1].x + 260} ${nodes[1].y + 45} C ${nodes[1].x + 300} ${nodes[1].y + 45}, ${nodes[2].x - 40} ${nodes[2].y + 45}, ${nodes[2].x} ${nodes[2].y + 45}`} />
              <path d={`M ${nodes[2].x + 260} ${nodes[2].y + 45} C ${nodes[2].x + 300} ${nodes[2].y + 45}, 1370 355, 1410 355`} />
            </svg>

            <div className="policy-terminal start" style={{ left: 110, top: 325 }}><strong>Start</strong><span>user_id · shop_id</span></div>

            {nodes.map((node) => (
              <button
                key={node.id}
                className={`policy-editor-node ${selectedNodeId === node.id ? 'selected' : ''}`}
                style={{ left: node.x, top: node.y }}
                onPointerDown={(event) => startDrag(event, node.id)}
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedNodeId(node.id)
                }}
              >
                <span className="policy-editor-node-icon">▤</span>
                <span className="policy-editor-node-copy"><small>Decision</small><strong>{node.name}</strong></span>
                <span className={`policy-node-status ${node.status.toLowerCase()}`}>{node.status === 'Online' ? '✓' : '!'}</span>
                <span className="policy-editor-node-io"><b>Input</b>{node.inputs.slice(0, 2).join(' · ')}</span>
                <span className="policy-editor-node-io"><b>Output</b>{node.outputs.slice(0, 2).join(' · ')}</span>
              </button>
            ))}

            <div className="policy-terminal end" style={{ left: 1410, top: 325 }}><strong>End</strong><span>4 outputs</span></div>
          </div>
        </div>

        <div className="policy-editor-toolbar">
          <button onClick={() => setShowLibrary((current) => !current)}>＋ Add Decision</button>
          <button onClick={fitCanvas}>Fit</button>
          <button onClick={() => zoomTo(zoom - 0.1)} aria-label="Zoom out">−</button>
          <strong>{Math.round(zoom * 100)}%</strong>
          <button onClick={() => zoomTo(zoom + 0.1)} aria-label="Zoom in">＋</button>
        </div>

        {showLibrary && (
          <div className="quick-decision-picker">
            <strong>Add Decision</strong>
            <input placeholder="Search decisions" />
            <button>customer_tier_decision<span>Online</span></button>
            <button>merchant_risk_decision<span>Online</span></button>
            <button onClick={() => setShowLibrary(false)}>Cancel</button>
          </div>
        )}
      </main>

      <aside className={`policy-node-panel ${selectedNode ? 'open' : ''}`}>
        {selectedNode ? (
          <>
            <div className="policy-node-panel-header">
              <span>▤</span><div><small>Decision</small><strong>{selectedNode.name}</strong></div>
              <button onClick={() => setSelectedNodeId('')} aria-label="Close node panel">×</button>
            </div>
            <p>{selectedNode.description}</p>
            <section>
              <h3>Node Information</h3>
              <dl>
                <div><dt>Status</dt><dd>{selectedNode.status}</dd></div>
                <div><dt>Policy Version</dt><dd>{activeVersion}</dd></div>
                <div><dt>Execution</dt><dd>Real-time</dd></div>
              </dl>
            </section>
            <section>
              <h3>Inputs</h3>
              {selectedNode.inputs.map((item) => <span className="policy-variable" key={item}>{item}<code>feature</code></span>)}
            </section>
            <section>
              <h3>Outputs</h3>
              {selectedNode.outputs.map((item) => <span className="policy-variable" key={item}>{item}<code>local</code></span>)}
            </section>
            <Link
              className="open-decision-editor"
              to={`/decision/1/edit?from=policy-canvas&policy=${id}&version=${activeVersion}`}
            >
              Open Decision Canvas →
            </Link>
          </>
        ) : (
          <div className="policy-node-panel-empty"><span>◇</span><strong>Select a Decision node</strong><p>Click a node on the canvas to inspect its inputs, outputs and configuration.</p></div>
        )}
      </aside>
    </div>
  )
}

export default PolicyCanvasEditorPage
