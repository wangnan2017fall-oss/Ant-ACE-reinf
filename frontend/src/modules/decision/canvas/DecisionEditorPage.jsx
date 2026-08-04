import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import './DecisionEditorPage.css'

const nodeTypes = [
  { type: 'ifElse', label: 'If-Else', icon: '≷', color: '#d8c6ff', group: 'basic' },
  { type: 'action', label: 'Assignment', icon: '▤', color: '#ffd2c5', group: 'basic' },
  { type: 'block', label: 'Hard Rules', icon: '⊘', color: '#ffc8ce', group: 'business' },
  { type: 'decisionTable', label: 'Decision Table', icon: '▦', color: '#c9ddff', group: 'business' },
  { type: 'cross', label: 'Cross', icon: '⊞', color: '#bfeaf5', group: 'business' },
]

const initialNodes = [
  { id: 'start', type: 'start', label: 'Start', x: 70, y: 155, outputs: ['user_id', 'shop_id'] },
  { id: 'ifElse1', type: 'ifElse', label: 'Eligibility Check', x: 300, y: 215, status: 'success', inputs: ['monthly_income', 'credit_report_score'], outputs: ['approved', 'customer_tier'] },
  { id: 'action1', type: 'action', label: 'Calculate Credit Terms', x: 650, y: 335, status: 'warning', inputs: ['monthly_income', 'customer_tier'], outputs: ['credit_limit', 'interest_rate', 'loan_term'] },
  { id: 'decisionTable1', type: 'decisionTable', label: 'Decision Table 1', x: 650, y: 130, status: 'warning', inputs: ['credit_report_score'], outputs: ['table_result'] },
  { id: 'end', type: 'end', label: 'End', x: 1030, y: 365, inputs: ['approved', 'credit_limit', 'interest_rate', 'loan_term'] },
]

const initialEdges = [
  { id: 'edge-start-ifelse', from: 'start', to: 'ifElse1' },
  { id: 'edge-ifelse-action', from: 'ifElse1', to: 'action1', label: 'IF', sourcePortIndex: 0, sourcePortCount: 2 },
  { id: 'edge-action-end', from: 'action1', to: 'end' },
]

const featureVariables = [
  { name: 'age', type: 'number', component: 'User', key: 'user_id' },
  { name: 'monthly_income', type: 'number', component: 'User', key: 'user_id' },
  { name: 'credit_report_score', type: 'number', component: 'Credit Report', key: 'user_id' },
  { name: 'shop_risk_level', type: 'string', component: 'Shop', key: 'shop_id' },
  { name: 'rating', type: 'string', component: 'User', key: 'user_id' },
  { name: 'profile_tier_grp', type: 'string', component: 'User', key: 'user_id' },
]

const customConditionVariables = [
  { name: 'requested_amount', type: 'number' },
  { name: 'application_channel', type: 'string' },
  { name: 'is_repeat_customer', type: 'boolean' },
]

const localVariables = [
  { name: 'approved', type: 'boolean', source: 'Eligibility Check.approved' },
  { name: 'customer_tier', type: 'string', source: 'Eligibility Check.customer_tier' },
]

const outputVariables = [
  { name: 'credit_limit', type: 'number', source: 'Calculate Credit Terms.credit_limit' },
  { name: 'interest_rate', type: 'number', source: 'Calculate Credit Terms.interest_rate' },
  { name: 'loan_term', type: 'number', source: 'Calculate Credit Terms.loan_term' },
]

const variableTypeOptions = ['String', 'Integer', 'Number', 'Boolean', 'Time', 'Object', 'Array', 'File']

const decisionTablePickerCategories = [
  { id: 'all', label: 'All', icon: '⌘' },
  { id: 'custom', label: 'Custom', icon: 'C' },
  { id: 'feature', label: 'Feature', icon: 'F', badge: 'Real-time' },
  { id: 'upstream', label: 'Upstream Output', icon: 'N' },
  { id: 'function', label: 'Function', icon: 'ƒ' },
  { id: 'operator', label: 'Operator', icon: '±' },
]

const decisionTableFunctions = [
  { name: 'dateDiff', description: 'Calculate time difference', syntax: 'dateDiff(start_time, end_time)' },
  { name: 'getDate', description: 'Get system time', syntax: 'getDate()' },
  { name: 'concat', description: 'String concatenation', syntax: 'concat(value_1, value_2)' },
  { name: 'concat_ws', description: 'Concatenate with separator', syntax: 'concat_ws(separator, value_1, value_2)' },
  { name: 'abs', description: 'Take absolute value', syntax: 'abs(value)' },
  { name: 'get_json_object', description: 'Read a field from JSON', syntax: 'get_json_object(json, path)' },
  { name: 'lpad', description: 'Left pad a string', syntax: 'lpad(value, length, pad)' },
  { name: 'rpad', description: 'Right pad a string', syntax: 'rpad(value, length, pad)' },
]

const decisionTableOperators = [
  { label: '+', detail: 'Add', group: 'Arithmetic' },
  { label: '−', detail: 'Subtract', group: 'Arithmetic' },
  { label: '×', detail: 'Multiply', group: 'Arithmetic' },
  { label: '÷', detail: 'Divide', group: 'Arithmetic' },
  { label: '%', detail: 'Remainder', group: 'Arithmetic' },
  { label: '=', detail: 'Equal', group: 'Comparison' },
  { label: '!=', detail: 'Not equal', group: 'Comparison' },
  { label: '>', detail: 'Greater than', group: 'Comparison' },
  { label: '>=', detail: 'Greater than or equal', group: 'Comparison' },
  { label: '<', detail: 'Less than', group: 'Comparison' },
  { label: '<=', detail: 'Less than or equal', group: 'Comparison' },
  { label: 'AND', detail: 'Both conditions are true', group: 'Logical' },
  { label: 'OR', detail: 'Either condition is true', group: 'Logical' },
  { label: 'NOT', detail: 'Negate a condition', group: 'Logical' },
  { label: '(', detail: 'Open group', group: 'Grouping' },
  { label: ')', detail: 'Close group', group: 'Grouping' },
]

const initialInputBindings = {
  ifElse1: [
    { id: 'if-income', name: 'monthly_income', sourceType: 'feature', sourceId: 'monthly_income', sourceLabel: 'Feature · monthly_income' },
    { id: 'if-score', name: 'credit_score', sourceType: 'feature', sourceId: 'credit_report_score', sourceLabel: 'Feature · credit_report_score' },
  ],
  action1: [
    { id: 'action-income', name: 'income', sourceType: 'feature', sourceId: 'monthly_income', sourceLabel: 'Feature · monthly_income' },
    { id: 'action-tier', name: 'tier', sourceType: 'node', sourceNodeId: 'ifElse1', sourceId: 'customer_tier', sourceLabel: 'Eligibility Check · customer_tier' },
  ],
  end: [
    { id: 'end-approved', name: 'approved', sourceType: 'node', sourceNodeId: 'ifElse1', sourceId: 'approved', sourceLabel: 'Eligibility Check · approved' },
    { id: 'end-limit', name: 'credit_limit', sourceType: 'node', sourceNodeId: 'action1', sourceId: 'credit_limit', sourceLabel: 'Calculate Credit Terms · credit_limit' },
    { id: 'end-rate', name: 'interest_rate', sourceType: 'node', sourceNodeId: 'action1', sourceId: 'interest_rate', sourceLabel: 'Calculate Credit Terms · interest_rate' },
    { id: 'end-term', name: 'loan_term', sourceType: 'node', sourceNodeId: 'action1', sourceId: 'loan_term', sourceLabel: 'Calculate Credit Terms · loan_term' },
  ],
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 2

const decisionVersionCatalog = {
  'credit-eligibility': { name: 'credit_eligibility_decision', versions: ['V2.1.0', 'V2.0.3', 'V1.9.8'] },
  'limit-pricing': { name: 'limit_pricing_decision', versions: ['V1.4.2', 'V1.4.1', 'V1.3.6'] },
  'anti-fraud': { name: 'anti_fraud_decision', versions: ['V0.9.0', 'V0.8.4', 'V0.8.1'] },
  '1': { name: 'test_luke1', versions: ['V1.0.0', 'V0.9.2', 'V0.9.1'] },
}

function nodeSize(node) {
  return node.type === 'start' || node.type === 'end'
    ? { width: 132, height: 84 }
    : node.type === 'ifElse' || node.type === 'block'
      ? { width: 270, height: 154 }
    : node.type === 'decisionTable' || node.type === 'cross'
      ? { width: 270, height: 92 }
    : { width: 270, height: 122 }
}

function connectionGeometry(source, target, edge = {}) {
  const sourceSize = nodeSize(source)
  const targetSize = nodeSize(target)
  const sourceCenterX = source.x + sourceSize.width / 2
  const targetCenterX = target.x + targetSize.width / 2
  const sourceCenterY = source.type === 'ifElse' && Number.isInteger(edge.sourcePortIndex)
    ? source.y + 50 + ((edge.sourcePortIndex + 0.5) / Math.max(1, edge.sourcePortCount || 1)) * (sourceSize.height - 54)
    : source.y + sourceSize.height / 2
  const targetCenterY = target.y + targetSize.height / 2

  if (Math.abs(targetCenterX - sourceCenterX) > Math.abs(targetCenterY - sourceCenterY)) {
    const startX = targetCenterX >= sourceCenterX ? source.x + sourceSize.width : source.x
    const endX = targetCenterX >= sourceCenterX ? target.x : target.x + targetSize.width
    const direction = endX >= startX ? 1 : -1
    const controlOffset = Math.min(180, Math.max(48, Math.abs(endX - startX) * 0.46))
    return {
      path: `M ${startX} ${sourceCenterY} C ${startX + direction * controlOffset} ${sourceCenterY}, ${endX - direction * controlOffset} ${targetCenterY}, ${endX} ${targetCenterY}`,
      endX,
      endY: targetCenterY,
      labelX: (startX + endX) / 2,
      labelY: (sourceCenterY + targetCenterY) / 2,
    }
  }

  const startY = targetCenterY >= sourceCenterY ? source.y + sourceSize.height : source.y
  const endY = targetCenterY >= sourceCenterY ? target.y : target.y + targetSize.height
  const direction = endY >= startY ? 1 : -1
  const controlOffset = Math.min(160, Math.max(44, Math.abs(endY - startY) * 0.46))
  return {
    path: `M ${sourceCenterX} ${startY} C ${sourceCenterX} ${startY + direction * controlOffset}, ${targetCenterX} ${endY - direction * controlOffset}, ${targetCenterX} ${endY}`,
    endX: targetCenterX,
    endY,
    labelX: (sourceCenterX + targetCenterX) / 2,
    labelY: (startY + endY) / 2,
  }
}

function outputPortPosition(node, sourcePort = null) {
  const size = nodeSize(node)
  const y = node.type === 'ifElse' && sourcePort
    ? node.y + 50 + ((sourcePort.index + 0.5) / Math.max(1, sourcePort.count || 1)) * (size.height - 54)
    : node.y + size.height / 2
  return { x: node.x + size.width, y }
}

function draftConnectionPath(start, end) {
  const direction = end.x >= start.x ? 1 : -1
  const controlOffset = Math.min(190, Math.max(54, Math.abs(end.x - start.x) * 0.46))
  return `M ${start.x} ${start.y} C ${start.x + direction * controlOffset} ${start.y}, ${end.x - direction * controlOffset} ${end.y}, ${end.x} ${end.y}`
}

function DecisionEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const decisionMeta = decisionVersionCatalog[id] || decisionVersionCatalog['1']
  const requestedDecisionVersion = new URLSearchParams(location.search).get('version')
  const canvasRef = useRef(null)
  const historyRef = useRef([])
  const panStartRef = useRef(null)
  const paletteDropHandledRef = useRef(false)
  const paletteDragRef = useRef(null)
  const suppressPaletteClickRef = useRef(false)
  const canvasNodeDragRef = useRef(null)
  const marqueeStartRef = useRef(null)
  const clipboardRef = useRef([])
  const actionModuleDragRef = useRef(null)
  const connectionDragRef = useRef(null)
  const suppressConnectionClickRef = useRef(false)
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [connectionDraft, setConnectionDraft] = useState(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState('')
  const [selectedNodeIds, setSelectedNodeIds] = useState([])
  const [marquee, setMarquee] = useState(null)
  const [quickAddNodeId, setQuickAddNodeId] = useState('')
  const [nodeSearch, setNodeSearch] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [panelMode, setPanelMode] = useState('')
  const [variableTab, setVariableTab] = useState('feature')
  const [activeDecisionVersion, setActiveDecisionVersion] = useState(
    decisionMeta.versions.includes(requestedDecisionVersion) ? requestedDecisionVersion : decisionMeta.versions[0],
  )
  const [dragPreview, setDragPreview] = useState(null)
  const [inputBindings, setInputBindings] = useState(initialInputBindings)
  const [bindingPicker, setBindingPicker] = useState(null)
  const [conditionValuePicker, setConditionValuePicker] = useState(null)
  const [conditionExpressionPicker, setConditionExpressionPicker] = useState(null)
  const [startInputTypes, setStartInputTypes] = useState({
    user_id: 'String',
    shop_id: 'String',
  })
  const [conditionRows, setConditionRows] = useState({
    true: [{ id: 1, logic: 'AND', variable: 'Feature · credit_report_score', operator: '>=', expression: '700', rightMode: 'value' }],
  })
  const [conditionBranchOrder, setConditionBranchOrder] = useState(['true'])
  const [actionOperations, setActionOperations] = useState({
    action1: [
      {
        id: 'op-limit',
        target: 'credit_limit',
        dataType: 'Number',
        expression: {
          type: 'formula',
          parts: [
            { kind: 'variable', value: 'Feature · monthly_income' },
            { kind: 'operator', value: '×' },
            { kind: 'literal', value: '5', valueType: 'Number' },
          ],
        },
      },
      {
        id: 'op-rate',
        target: 'interest_rate',
        dataType: 'Number',
        expression: { type: 'formula', parts: [{ kind: 'literal', value: '0.12', valueType: 'Number' }] },
      },
      {
        id: 'op-term',
        target: 'loan_term',
        dataType: 'Integer',
        expression: { type: 'formula', parts: [{ kind: 'literal', value: '12', valueType: 'Number' }] },
      },
    ],
  })
  const [actionExpressionPicker, setActionExpressionPicker] = useState(null)
  const [actionTargetPicker, setActionTargetPicker] = useState(null)
  const [expandedActionDefaults, setExpandedActionDefaults] = useState({})
  const [blockRules, setBlockRules] = useState({})
  const [blockExpressionPicker, setBlockExpressionPicker] = useState(null)
  const [decisionTables, setDecisionTables] = useState({
    decisionTable1: {
      columns: [
        { id: 'A', name: 'Condition Column', kind: 'condition' },
        { id: 'B', name: 'Select Variable', kind: 'result' },
      ],
      rows: [
        {
          id: 'row-1',
          cells: {
            A: null,
            B: {
              kind: 'expression',
              parts: [{ kind: 'function', label: 'get_json_object', detail: 'get_json_object(json, path)' }],
            },
          },
        },
      ],
    },
  })
  const [decisionTablePicker, setDecisionTablePicker] = useState(null)
  const [decisionTableExpanded, setDecisionTableExpanded] = useState(false)
  const [crossTables, setCrossTables] = useState({})

  const visibleNodeTypes = useMemo(() => {
    const query = nodeSearch.trim().toLowerCase()
    return nodeTypes.filter((item) => !query || item.label.toLowerCase().includes(query))
  }, [nodeSearch])

  const selectedNode = nodes.find((node) => node.id === selectedNodeId)

  const switchDecisionVersion = (version) => {
    setActiveDecisionVersion(version)
    const params = new URLSearchParams(location.search)
    params.set('version', version)
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
    selectOnly('')
    setPanelMode('')
  }

  const closeEditor = () => {
    const params = new URLSearchParams(location.search)
    if (params.get('from') === 'policy') {
      const policyId = params.get('policy') || '1'
      const returnTab = params.get('returnTab') || 'decisions'
      navigate(`/policy/${policyId}?tab=${returnTab}`)
      return
    }
    if (params.get('from') === 'policy-canvas') {
      const policyId = params.get('policy') || '1'
      const version = params.get('version') || 'V1.0.3'
      navigate(`/policy/${policyId}/edit?version=${version}`)
      return
    }
    navigate(`/decision/${id}`)
  }

  const selectOnly = (nodeId) => {
    setSelectedEdgeId('')
    setSelectedNodeId(nodeId)
    setSelectedNodeIds(nodeId ? [nodeId] : [])
  }

  const toggleSelection = (nodeId) => {
    setSelectedNodeIds((current) => {
      const next = current.includes(nodeId)
        ? current.filter((idValue) => idValue !== nodeId)
        : [...current, nodeId]
      setSelectedNodeId(next.at(-1) || '')
      return next
    })
  }

  const commitNodes = (updater) => {
    setNodes((current) => {
      historyRef.current = [...historyRef.current.slice(-19), current]
      return typeof updater === 'function' ? updater(current) : updater
    })
  }

  const undo = () => {
    const previous = historyRef.current.at(-1)
    if (!previous) return
    historyRef.current = historyRef.current.slice(0, -1)
    setNodes(previous)
    selectOnly('')
    setPanelMode('')
  }

  const addNode = (definition, point, sourceNodeId = '', sourcePort = null) => {
    const count = nodes.filter((node) => node.type === definition.type).length + 1
    const bounds = canvasRef.current?.getBoundingClientRect()
    const sourceNode = nodes.find((node) => node.id === sourceNodeId)
    const sourceSize = sourceNode ? nodeSize(sourceNode) : null
    const fallbackX = 280 + ((nodes.length * 35) % 300)
    const fallbackY = 120 + ((nodes.length * 55) % 330)
    const x = sourceNode && sourceSize
      ? sourceNode.x + sourceSize.width + 110
      : point && bounds ? (point.x - bounds.left - pan.x) / zoom - 135 : fallbackX
    const newNodeSize = nodeSize({ type: definition.type })
    const sourcePortY = sourceNode?.type === 'ifElse' && sourcePort
      ? sourceNode.y + 50 + ((sourcePort.index + 0.5) / Math.max(1, sourcePort.count)) * (sourceSize.height - 54)
      : null
    const y = sourceNode
      ? sourcePortY == null ? sourceNode.y : sourcePortY - newNodeSize.height / 2
      : point && bounds ? (point.y - bounds.top - pan.y) / zoom - 61 : fallbackY
    const node = {
      id: `${definition.type}-${Date.now()}`,
      type: definition.type,
      label: `${definition.label} ${count}`,
      x,
      y,
      status: 'warning',
      inputs: ['Select input'],
      outputs: [`${definition.type}_result`],
    }
    commitNodes((current) => [...current, node])
    setInputBindings((current) => ({
      ...current,
      [node.id]: [{
        id: `${node.id}-input`,
        name: 'input',
        sourceType: '',
        sourceId: '',
        sourceLabel: '',
      }],
    }))
    if (definition.type === 'action') {
      setActionOperations((current) => ({
        ...current,
        [node.id]: [{
          id: `operation-${Date.now()}`,
          target: '',
          dataType: 'String',
          expression: { type: 'formula', parts: [null] },
        }],
      }))
    }
    if (definition.type === 'block') {
      setBlockRules((current) => ({
        ...current,
        [node.id]: [{
          id: `block-rule-${Date.now()}`,
          conditions: [{
            id: `block-condition-${Date.now()}`,
            logic: 'AND',
            variable: 'Feature · age',
            operator: '<',
            valueType: 'Number',
            expression: '21',
          }],
          assignments: [{
            id: `block-assignment-${Date.now()}`,
            target: 'reject_reason',
            dataType: 'String',
            value: 'AGE_REJECT',
          }],
        }],
      }))
      node.inputs = ['age']
      node.outputs = ['reject_reason']
    }
    if (definition.type === 'decisionTable') {
      setDecisionTables((current) => ({
        ...current,
        [node.id]: {
          columns: [
            { id: 'A', name: 'Condition Column', kind: 'condition' },
            { id: 'B', name: 'Select Variable', kind: 'result' },
          ],
          rows: [{ id: `table-row-${Date.now()}`, cells: { A: null, B: null } }],
        },
      }))
      node.inputs = ['Select condition']
      node.outputs = ['table_result']
    }
    if (definition.type === 'cross') {
      setCrossTables((current) => ({
        ...current,
        [node.id]: {
          rowVariable: 'Feature · rating',
          columnVariable: 'Feature · profile_tier_grp',
          outputVariable: 'profile_coef',
          columns: [
            { id: `cross-column-${Date.now()}-1`, value: 'tier1' },
            { id: `cross-column-${Date.now()}-2`, value: 'tier2' },
            { id: `cross-column-${Date.now()}-3`, value: 'else' },
          ],
          rows: [
            { id: `cross-row-${Date.now()}-1`, value: 'A', results: ['1.6', '1.3', '1'] },
            { id: `cross-row-${Date.now()}-2`, value: 'B', results: ['1.6', '1.3', '1'] },
            { id: `cross-row-${Date.now()}-3`, value: 'else', results: ['1', '1', '1'] },
          ],
        },
      }))
      node.inputs = ['rating', 'profile_tier_grp']
      node.outputs = ['profile_coef']
    }
    if (sourceNodeId) {
      setEdges((current) => [...current, {
        id: `edge-${sourceNodeId}-${node.id}-${Date.now()}`,
        from: sourceNodeId,
        to: node.id,
        ...(sourcePort ? {
          label: sourcePort.label,
          sourcePortIndex: sourcePort.index,
          sourcePortCount: sourcePort.count,
        } : {}),
      }])
    }
    selectOnly(node.id)
    setPanelMode('config')
    setQuickAddNodeId('')
  }

  const deleteSelectedNodes = () => {
    const deletable = selectedNodeIds.filter((nodeId) => !['start', 'end'].includes(nodeId))
    if (!deletable.length) return
    commitNodes((current) => current.filter((node) => !deletable.includes(node.id)))
    setEdges((current) => current.filter((edge) => !deletable.includes(edge.from) && !deletable.includes(edge.to)))
    selectOnly('')
    setPanelMode('')
    setQuickAddNodeId('')
  }

  const deleteEdge = (edgeId) => {
    setEdges((current) => current.filter((edge) => edge.id !== edgeId))
    setSelectedEdgeId((current) => current === edgeId ? '' : current)
  }

  const selectEdge = (edgeId) => {
    setSelectedEdgeId(edgeId)
    setSelectedNodeId('')
    setSelectedNodeIds([])
    setPanelMode('')
    setQuickAddNodeId('')
  }

  const canvasPointFromClient = (clientX, clientY) => {
    const bounds = canvasRef.current?.getBoundingClientRect()
    if (!bounds) return null
    return {
      x: (clientX - bounds.left - pan.x) / zoom,
      y: (clientY - bounds.top - pan.y) / zoom,
    }
  }

  const connectionTargetAt = (clientX, clientY, sourceId) => {
    const port = document.elementFromPoint(clientX, clientY)?.closest?.('[data-node-input-port]')
    const targetId = port?.dataset.nodeInputPort || ''
    return targetId && targetId !== sourceId ? targetId : ''
  }

  const startConnectionDrag = (event, node, sourcePort = null) => {
    if (event.button !== 0 || node.type === 'end') return
    event.preventDefault()
    event.stopPropagation()
    suppressConnectionClickRef.current = false
    connectionDragRef.current = {
      sourceId: node.id,
      sourcePort,
      startClientX: event.clientX,
      startClientY: event.clientY,
      start: outputPortPosition(node, sourcePort),
      moved: false,
    }
    selectOnly(node.id)
    setSelectedEdgeId('')
  }

  const moveConnectionDrag = (event) => {
    const activeDrag = connectionDragRef.current
    if (!activeDrag) return
    if (!activeDrag.moved) {
      activeDrag.moved = Math.hypot(
        event.clientX - activeDrag.startClientX,
        event.clientY - activeDrag.startClientY,
      ) > 4
    }
    if (!activeDrag.moved) return
    const current = canvasPointFromClient(event.clientX, event.clientY)
    if (!current) return
    setConnectionDraft({
      sourceId: activeDrag.sourceId,
      start: activeDrag.start,
      current,
      hoverTargetId: connectionTargetAt(event.clientX, event.clientY, activeDrag.sourceId),
    })
  }

  const stopConnectionDrag = (event) => {
    const activeDrag = connectionDragRef.current
    if (!activeDrag) return
    if (activeDrag.moved) {
      suppressConnectionClickRef.current = true
      const targetId = connectionTargetAt(event.clientX, event.clientY, activeDrag.sourceId)
      if (targetId) {
        const sourcePort = activeDrag.sourcePort
        setEdges((current) => {
          const duplicate = current.some((edge) => (
            edge.from === activeDrag.sourceId
            && edge.to === targetId
            && (edge.sourcePortIndex ?? null) === (sourcePort?.index ?? null)
          ))
          if (duplicate) return current
          return [...current, {
            id: `edge-${activeDrag.sourceId}-${targetId}-${Date.now()}`,
            from: activeDrag.sourceId,
            to: targetId,
            ...(sourcePort ? {
              label: sourcePort.label,
              sourcePortIndex: sourcePort.index,
              sourcePortCount: sourcePort.count,
            } : {}),
          }]
        })
      }
    }
    connectionDragRef.current = null
    setConnectionDraft(null)
  }

  const copySelectedNodes = () => {
    clipboardRef.current = nodes.filter((node) => (
      selectedNodeIds.includes(node.id) && !['start', 'end'].includes(node.id)
    ))
  }

  const pasteNodes = () => {
    if (!clipboardRef.current.length) return
    const stamp = Date.now()
    const pasted = clipboardRef.current.map((node, index) => ({
      ...node,
      id: `${node.type}-copy-${stamp}-${index}`,
      label: `${node.label} Copy`,
      x: node.x + 36,
      y: node.y + 36,
    }))
    commitNodes((current) => [...current, ...pasted])
    setSelectedNodeIds(pasted.map((node) => node.id))
    setSelectedNodeId(pasted.at(-1)?.id || '')
  }

  const duplicateSelectedNodes = () => {
    copySelectedNodes()
    pasteNodes()
  }

  const fitCanvas = () => {
    const bounds = canvasRef.current?.getBoundingClientRect()
    if (!bounds || !nodes.length) return
    const margin = 70
    const minX = Math.min(...nodes.map((node) => node.x))
    const minY = Math.min(...nodes.map((node) => node.y))
    const maxX = Math.max(...nodes.map((node) => node.x + nodeSize(node).width))
    const maxY = Math.max(...nodes.map((node) => node.y + nodeSize(node).height))
    const nextZoom = Math.min(
      1,
      Math.max(MIN_ZOOM, Math.min((bounds.width - margin * 2) / (maxX - minX), (bounds.height - margin * 2) / (maxY - minY))),
    )
    setZoom(nextZoom)
    setPan({
      x: (bounds.width - (maxX - minX) * nextZoom) / 2 - minX * nextZoom,
      y: (bounds.height - (maxY - minY) * nextZoom) / 2 - minY * nextZoom,
    })
  }

  const organizeCanvas = () => {
    const mainIds = ['start', 'ifElse1', 'action1', 'end']
    const mainPositions = {
      start: { x: 500, y: 80 },
      ifElse1: { x: 430, y: 205 },
      action1: { x: 430, y: 360 },
      end: { x: 500, y: 525 },
    }
    commitNodes((current) => {
      const extraIds = current.filter((node) => !mainIds.includes(node.id)).map((node) => node.id)
      return current.map((node) => (
        mainIds.includes(node.id)
          ? { ...node, ...mainPositions[node.id] }
          : { ...node, x: 160, y: 65 + extraIds.indexOf(node.id) * 80 }
      ))
    })
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/x-node-type')
    const definition = nodeTypes.find((item) => item.type === type)
    if (definition) {
      paletteDropHandledRef.current = true
      addNode(definition, { x: event.clientX, y: event.clientY })
    }
  }

  const startPaletteDrag = (event, definition) => {
    if (event.button !== 0) return
    paletteDragRef.current = {
      definition,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    }
  }

  const movePaletteDrag = (event) => {
    const activeDrag = paletteDragRef.current
    if (!activeDrag) return
    const moved = Math.hypot(event.clientX - activeDrag.startX, event.clientY - activeDrag.startY) > 5
    if (!moved && !activeDrag.moved) return
    activeDrag.moved = true
    setDragPreview({ definition: activeDrag.definition, x: event.clientX, y: event.clientY })
  }

  const stopPaletteDrag = (event) => {
    const activeDrag = paletteDragRef.current
    if (!activeDrag) return
    if (activeDrag.moved) {
      const bounds = canvasRef.current?.getBoundingClientRect()
      const insideCanvas = bounds
        && event.clientX >= bounds.left
        && event.clientX <= bounds.right
        && event.clientY >= bounds.top
        && event.clientY <= bounds.bottom
      if (insideCanvas) addNode(activeDrag.definition, { x: event.clientX, y: event.clientY })
      suppressPaletteClickRef.current = true
    }
    paletteDragRef.current = null
    setDragPreview(null)
  }

  const startCanvasNodeDrag = (event, node) => {
    if (event.button !== 0) return
    event.stopPropagation()
    canvasNodeDragRef.current = {
      nodeId: node.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: node.x,
      originY: node.y,
      originalNodes: nodes,
      moved: false,
    }
    if (!event.shiftKey) {
      if (!selectedNodeIds.includes(node.id)) selectOnly(node.id)
      setPanelMode('config')
    }
  }

  const moveCanvasNodeDrag = (event) => {
    const activeDrag = canvasNodeDragRef.current
    if (!activeDrag) return
    const deltaX = (event.clientX - activeDrag.startX) / zoom
    const deltaY = (event.clientY - activeDrag.startY) / zoom
    if (Math.hypot(deltaX, deltaY) > 3) activeDrag.moved = true
    if (!activeDrag.moved) return
    setNodes((current) => current.map((node) => (
      node.id === activeDrag.nodeId
        ? { ...node, x: activeDrag.originX + deltaX, y: activeDrag.originY + deltaY }
        : node
    )))
  }

  const stopCanvasNodeDrag = () => {
    const activeDrag = canvasNodeDragRef.current
    if (!activeDrag) return
    if (activeDrag.moved) {
      historyRef.current = [...historyRef.current.slice(-19), activeDrag.originalNodes]
    }
    canvasNodeDragRef.current = null
  }

  const startPan = (event) => {
    if (event.target.closest?.('.canvas-node') || event.target.closest?.('.canvas-toolbar')) return
    if (event.shiftKey && event.button === 0) {
      const bounds = canvasRef.current?.getBoundingClientRect()
      if (!bounds) return
      const start = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
      marqueeStartRef.current = start
      setMarquee({ ...start, width: 0, height: 0 })
      return
    }
    if (event.button !== 0 && event.button !== 1) return
    selectOnly('')
    panStartRef.current = { clientX: event.clientX, clientY: event.clientY, ...pan }
  }

  const movePan = (event) => {
    if (marqueeStartRef.current) {
      const bounds = canvasRef.current?.getBoundingClientRect()
      if (!bounds) return
      const currentX = event.clientX - bounds.left
      const currentY = event.clientY - bounds.top
      setMarquee({
        x: Math.min(marqueeStartRef.current.x, currentX),
        y: Math.min(marqueeStartRef.current.y, currentY),
        width: Math.abs(currentX - marqueeStartRef.current.x),
        height: Math.abs(currentY - marqueeStartRef.current.y),
      })
      return
    }
    if (!panStartRef.current) return
    setPan({
      x: panStartRef.current.x + event.clientX - panStartRef.current.clientX,
      y: panStartRef.current.y + event.clientY - panStartRef.current.clientY,
    })
  }

  const stopPan = () => {
    if (marqueeStartRef.current && marquee) {
      const ids = nodes.filter((node) => {
        const size = nodeSize(node)
        const left = node.x * zoom + pan.x
        const top = node.y * zoom + pan.y
        const right = left + size.width * zoom
        const bottom = top + size.height * zoom
        return right >= marquee.x
          && left <= marquee.x + marquee.width
          && bottom >= marquee.y
          && top <= marquee.y + marquee.height
      }).map((node) => node.id)
      setSelectedNodeIds(ids)
      setSelectedNodeId(ids.at(-1) || '')
    }
    marqueeStartRef.current = null
    setMarquee(null)
    panStartRef.current = null
  }

  const handleCanvasWheel = (event) => {
    event.preventDefault()
    const bounds = canvasRef.current?.getBoundingClientRect()
    if (!bounds) return

    const zoomFactor = Math.exp(-event.deltaY * 0.0015)
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * zoomFactor))
    if (nextZoom === zoom) return

    const pointerX = event.clientX - bounds.left
    const pointerY = event.clientY - bounds.top
    const canvasX = (pointerX - pan.x) / zoom
    const canvasY = (pointerY - pan.y) / zoom

    setPan({
      x: pointerX - canvasX * nextZoom,
      y: pointerY - canvasY * nextZoom,
    })
    setZoom(nextZoom)
  }

  const openNodePanel = (nodeId) => {
    selectOnly(nodeId)
    setPanelMode('config')
    setBindingPicker(null)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return
      const modifier = event.metaKey || event.ctrlKey
      if (modifier && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        copySelectedNodes()
      } else if (modifier && event.key.toLowerCase() === 'v') {
        event.preventDefault()
        pasteNodes()
      } else if (modifier && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        duplicateSelectedNodes()
      } else if (modifier && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        setSelectedNodeIds(nodes.map((node) => node.id))
        setSelectedNodeId(nodes.at(-1)?.id || '')
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        if (selectedEdgeId) deleteEdge(selectedEdgeId)
        else deleteSelectedNodes()
      } else if (event.key === 'Escape') {
        selectOnly('')
        setPanelMode('')
        setQuickAddNodeId('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  useEffect(() => {
    if (panelMode !== 'config' || !selectedNode || !canvasRef.current) return undefined
    const frame = window.requestAnimationFrame(() => {
      const bounds = canvasRef.current?.getBoundingClientRect()
      if (!bounds) return
      const size = nodeSize(selectedNode)
      const nodeLeft = selectedNode.x * zoom + pan.x
      const nodeRight = nodeLeft + size.width * zoom
      const safeLeft = 42
      const safeRight = bounds.width - 58
      let adjustment = 0
      if (nodeRight > safeRight) adjustment = safeRight - nodeRight
      else if (nodeLeft < safeLeft) adjustment = safeLeft - nodeLeft
      if (adjustment) setPan((current) => ({ ...current, x: current.x + adjustment }))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [panelMode, selectedNodeId, zoom])

  const addCondition = (branch) => {
    setConditionRows((current) => ({
      ...current,
      [branch]: [...current[branch], { id: Date.now(), logic: 'AND', variable: '', operator: '=', expression: '', rightMode: 'value' }],
    }))
  }

  const updateCondition = (branch, rowId, field, value) => {
    setConditionRows((current) => ({
      ...current,
      [branch]: current[branch].map((row) => row.id === rowId ? { ...row, [field]: value } : row),
    }))
  }

  const deleteCondition = (branch, rowId) => {
    setConditionRows((current) => ({
      ...current,
      [branch]: current[branch].length <= 1
        ? current[branch]
        : current[branch].filter((row) => row.id !== rowId),
    }))
  }

  const addConditionBranch = () => {
    const branchId = `branch-${Date.now()}`
    setConditionRows((current) => ({
      ...current,
      [branchId]: [{ id: Date.now(), logic: 'AND', variable: '', operator: '=', expression: '', rightMode: 'value' }],
    }))
    setConditionBranchOrder((current) => [...current, branchId])
  }

  const deleteConditionBranch = (branch) => {
    if (conditionBranchOrder.length <= 1) return
    setConditionBranchOrder((current) => current.filter((item) => item !== branch))
    setConditionRows((current) => {
      const next = { ...current }
      delete next[branch]
      return next
    })
  }

  const updateBlockRulesForNode = (nodeId, updater) => {
    setBlockRules((current) => ({
      ...current,
      [nodeId]: updater(current[nodeId] || []),
    }))
  }

  const addBlockRule = (nodeId) => {
    const stamp = Date.now()
    updateBlockRulesForNode(nodeId, (rules) => [...rules, {
      id: `block-rule-${stamp}`,
      conditions: [{
        id: `block-condition-${stamp}`,
        logic: 'AND',
        variable: '',
        operator: '=',
        valueType: 'String',
        expression: '',
      }],
      assignments: [{
        id: `block-assignment-${stamp}`,
        target: 'reject_reason',
        dataType: 'String',
        value: '',
      }],
    }])
  }

  const deleteBlockRule = (nodeId, ruleId) => {
    updateBlockRulesForNode(nodeId, (rules) => rules.length <= 1 ? rules : rules.filter((rule) => rule.id !== ruleId))
  }

  const addBlockCondition = (nodeId, ruleId) => {
    updateBlockRulesForNode(nodeId, (rules) => rules.map((rule) => rule.id === ruleId
      ? {
        ...rule,
        conditions: [...rule.conditions, {
          id: `block-condition-${Date.now()}`,
          logic: 'AND',
          variable: '',
          operator: '=',
          valueType: 'String',
          expression: '',
        }],
      }
      : rule))
  }

  const updateBlockCondition = (nodeId, ruleId, conditionId, field, value) => {
    updateBlockRulesForNode(nodeId, (rules) => rules.map((rule) => rule.id === ruleId
      ? {
        ...rule,
        conditions: rule.conditions.map((condition) => condition.id === conditionId ? { ...condition, [field]: value } : condition),
      }
      : rule))
  }

  const updateBlockExpressionParts = (nodeId, ruleId, conditionId, updater) => {
    updateBlockRulesForNode(nodeId, (rules) => rules.map((rule) => rule.id === ruleId
      ? {
        ...rule,
        conditions: rule.conditions.map((condition) => condition.id === conditionId
          ? { ...condition, expressionParts: updater(condition.expressionParts || []) }
          : condition),
      }
      : rule))
  }

  const deleteBlockCondition = (nodeId, ruleId, conditionId) => {
    updateBlockRulesForNode(nodeId, (rules) => rules.map((rule) => rule.id === ruleId
      ? {
        ...rule,
        conditions: rule.conditions.length <= 1
          ? rule.conditions
          : rule.conditions.filter((condition) => condition.id !== conditionId),
      }
      : rule))
  }

  const addBlockAssignment = (nodeId, ruleId) => {
    updateBlockRulesForNode(nodeId, (rules) => rules.map((rule) => rule.id === ruleId
      ? {
        ...rule,
        assignments: [...rule.assignments, {
          id: `block-assignment-${Date.now()}`,
          target: '',
          dataType: 'String',
          value: '',
        }],
      }
      : rule))
  }

  const updateBlockAssignment = (nodeId, ruleId, assignmentId, field, value) => {
    updateBlockRulesForNode(nodeId, (rules) => rules.map((rule) => rule.id === ruleId
      ? {
        ...rule,
        assignments: rule.assignments.map((assignment) => assignment.id === assignmentId ? { ...assignment, [field]: value } : assignment),
      }
      : rule))
  }

  const deleteBlockAssignment = (nodeId, ruleId, assignmentId) => {
    updateBlockRulesForNode(nodeId, (rules) => rules.map((rule) => rule.id === ruleId
      ? {
        ...rule,
        assignments: rule.assignments.filter((assignment) => assignment.id === assignmentId && assignment.target === 'reject_reason'
          ? true
          : assignment.id !== assignmentId),
      }
      : rule))
  }

  const addActionOperation = (nodeId) => {
    const rows = [
      ...(actionOperations[nodeId] || []),
      {
        id: `operation-${Date.now()}`,
        target: '',
        dataType: 'String',
        expression: { type: 'formula', parts: [null] },
      },
    ]
    setActionOperations((current) => ({ ...current, [nodeId]: rows }))
  }

  const commitActionRows = (nodeId, rows) => {
    setActionOperations((current) => ({ ...current, [nodeId]: rows }))
    setNodes((current) => current.map((node) => (
      node.id === nodeId
        ? {
          ...node,
          outputs: rows
            .map((row) => row.target.trim().split(' · ').at(-1))
            .filter(Boolean),
        }
        : node
    )))
  }

  const normalizeActionDataType = (dataType) => {
    const normalized = String(dataType || '').toLowerCase()
    if (['int', 'integer'].includes(normalized)) return 'Integer'
    if (['number', 'double', 'float', 'decimal'].includes(normalized)) return 'Number'
    if (['bool', 'boolean'].includes(normalized)) return 'Boolean'
    if (['time', 'date', 'datetime'].includes(normalized)) return 'Time'
    if (normalized === 'object') return 'Object'
    if (normalized === 'array') return 'Array'
    if (normalized === 'file') return 'File'
    return 'String'
  }

  const inferActionTargetDataType = (target) => {
    const targetName = target.split(' · ').at(-1)
    const feature = featureVariables.find((variable) => variable.name === targetName)
    if (feature) return normalizeActionDataType(feature.type)

    const officialTypes = {
      result: 'String',
      reject_code: 'String',
      reject_reason: 'String',
      credit_limit: 'Number',
      interest_rate: 'Number',
      loan_term: 'Integer',
    }
    if (officialTypes[targetName]) return officialTypes[targetName]

    const upstreamNode = nodes.find((node) => target.startsWith(`${node.label} · `))
    const upstreamRow = upstreamNode
      ? (actionOperations[upstreamNode.id] || []).find((row) => row.target.split(' · ').at(-1) === targetName)
      : null
    return upstreamRow?.dataType || 'String'
  }

  const updateActionTarget = (nodeId, rowId, target, options = {}) => {
    const isNewTarget = Boolean(options.isNew)
    const dataType = options.dataType || inferActionTargetDataType(target)
    const rows = (actionOperations[nodeId] || []).map((row) => row.id === rowId
      ? { ...row, target, dataType, isNewTarget }
      : row)
    commitActionRows(nodeId, rows)
    setActionTargetPicker(null)
  }

  const updateActionTargetText = (nodeId, rowId, target) => {
    const rows = (actionOperations[nodeId] || []).map((row) => (
      row.id === rowId ? { ...row, target, isNewTarget: true } : row
    ))
    commitActionRows(nodeId, rows)
  }

  const updateActionDataType = (nodeId, rowId, dataType) => {
    setActionOperations((current) => ({
      ...current,
      [nodeId]: (current[nodeId] || []).map((row) => (
        row.id === rowId ? { ...row, dataType } : row
      )),
    }))
  }

  const updateActionDefaultValue = (nodeId, rowId, defaultValue) => {
    setActionOperations((current) => ({
      ...current,
      [nodeId]: (current[nodeId] || []).map((row) => (
        row.id === rowId ? { ...row, defaultValue } : row
      )),
    }))
  }

  const updateActionExpression = (nodeId, rowId, expression) => {
    setActionOperations((current) => ({
      ...current,
      [nodeId]: (current[nodeId] || []).map((row) => row.id === rowId ? { ...row, expression } : row),
    }))
  }

  const setFormulaOperand = (nodeId, rowId, partIndex, operand) => {
    const row = (actionOperations[nodeId] || []).find((item) => item.id === rowId)
    const parts = [...(row?.expression?.parts || [null])]
    parts[partIndex] = operand
    updateActionExpression(nodeId, rowId, { type: 'formula', parts })
    setActionExpressionPicker(null)
  }

  const getActionOperandAtPath = (operation, path) => {
    let operand = operation?.expression?.parts?.[path[0]]
    for (let index = 1; index < path.length; index += 1) {
      operand = operand?.args?.[path[index]]
    }
    return operand
  }

  const setActionOperandAtPath = (nodeId, rowId, path, operand, closePicker = true) => {
    const row = (actionOperations[nodeId] || []).find((item) => item.id === rowId)
    const parts = [...(row?.expression?.parts || [null])]
    if (path.length === 1) {
      parts[path[0]] = operand
    } else {
      const updateNested = (current, depth) => {
        const args = [...(current?.args || [])]
        const argIndex = path[depth]
        args[argIndex] = depth === path.length - 1
          ? operand
          : updateNested(args[argIndex], depth + 1)
        return { ...current, args }
      }
      parts[path[0]] = updateNested(parts[path[0]], 1)
    }
    updateActionExpression(nodeId, rowId, { type: 'formula', parts })
    if (closePicker) setActionExpressionPicker(null)
  }

  const appendFormulaOperator = (nodeId, rowId, operator) => {
    const row = (actionOperations[nodeId] || []).find((item) => item.id === rowId)
    const parts = [...(row?.expression?.parts || [null]), { kind: 'operator', value: operator }, null]
    updateActionExpression(nodeId, rowId, { type: 'formula', parts })
    setActionExpressionPicker({
      rowId,
      kind: 'operand',
      path: String(parts.length - 1),
      category: 'all',
      query: '',
    })
  }

  const replaceFormulaOperator = (nodeId, rowId, operatorIndex, operator) => {
    const row = (actionOperations[nodeId] || []).find((item) => item.id === rowId)
    const parts = [...(row?.expression?.parts || [null])]
    parts[operatorIndex] = { kind: 'operator', value: operator }
    updateActionExpression(nodeId, rowId, { type: 'formula', parts })
    setActionExpressionPicker(null)
  }

  const wrapActionOperandWithFunction = (nodeId, operation, path, name, argCount) => {
    const currentOperand = getActionOperandAtPath(operation, path)
    setActionOperandAtPath(nodeId, operation.id, path, {
      kind: 'function',
      name,
      args: Array.from({ length: argCount }, (_, index) => index === 0 ? currentOperand || null : null),
    })
  }

  const updateLiteralOperand = (nodeId, operation, path, value) => {
    const currentOperand = getActionOperandAtPath(operation, path)
    setActionOperandAtPath(nodeId, operation.id, path, {
      ...(currentOperand || { kind: 'literal', valueType: 'Number' }),
      value,
    }, false)
  }

  const deleteActionOperation = (nodeId, rowId) => {
    const currentRows = actionOperations[nodeId] || []
    if (currentRows.length <= 1) return
    commitActionRows(nodeId, currentRows.filter((row) => row.id !== rowId))
    setActionExpressionPicker(null)
  }

  const addNodeOutput = (nodeId) => {
    setNodes((current) => current.map((node) => {
      if (node.id !== nodeId) return node
      const outputs = node.outputs || []
      let index = outputs.length + 1
      let name = `output_${index}`
      while (outputs.includes(name)) {
        index += 1
        name = `output_${index}`
      }
      return { ...node, outputs: [...outputs, name] }
    }))
  }

  const renameNodeOutput = (nodeId, oldName, newName) => {
    setNodes((current) => current.map((node) => (
      node.id === nodeId
        ? { ...node, outputs: (node.outputs || []).map((output) => output === oldName ? newName : output) }
        : node
    )))
    setInputBindings((current) => {
      const next = {}
      Object.entries(current).forEach(([bindingNodeId, rows]) => {
        next[bindingNodeId] = rows.map((row) => (
          row.sourceNodeId === nodeId && row.sourceId === oldName
            ? { ...row, sourceId: newName, sourceLabel: `${nodes.find((node) => node.id === nodeId)?.label || 'Node'} · ${newName}` }
            : row
        ))
      })
      return next
    })
  }

  const deleteNodeOutput = (nodeId, outputName) => {
    setNodes((current) => current.map((node) => (
      node.id === nodeId
        ? { ...node, outputs: (node.outputs || []).filter((output) => output !== outputName) }
        : node
    )))
    setInputBindings((current) => {
      const next = {}
      Object.entries(current).forEach(([bindingNodeId, rows]) => {
        next[bindingNodeId] = rows.map((row) => (
          row.sourceNodeId === nodeId && row.sourceId === outputName
            ? { ...row, sourceType: '', sourceNodeId: '', sourceId: '', sourceLabel: '' }
            : row
        ))
      })
      return next
    })
  }

  const getUpstreamNodes = (nodeId) => {
    const visited = new Set()
    const ordered = []
    const visit = (targetId) => {
      edges.filter((edge) => edge.to === targetId).forEach((edge) => {
        if (visited.has(edge.from)) return
        visited.add(edge.from)
        visit(edge.from)
        const source = nodes.find((node) => node.id === edge.from)
        if (source) ordered.push(source)
      })
    }
    visit(nodeId)
    return ordered
  }

  const updateInputBinding = (nodeId, rowId, patch) => {
    setInputBindings((current) => ({
      ...current,
      [nodeId]: (current[nodeId] || []).map((row) => row.id === rowId ? { ...row, ...patch } : row),
    }))
  }

  const updateNodeLabel = (nodeId, label) => {
    setNodes((current) => current.map((node) => node.id === nodeId ? { ...node, label } : node))
    setInputBindings((current) => {
      const next = {}
      Object.entries(current).forEach(([bindingNodeId, rows]) => {
        next[bindingNodeId] = rows.map((row) => (
          row.sourceNodeId === nodeId
            ? { ...row, sourceLabel: `${label} · ${row.sourceId}` }
            : row
        ))
      })
      return next
    })
  }

  const addStartInput = () => {
    const startNode = nodes.find((node) => node.id === 'start')
    const existing = startNode?.outputs || []
    let index = existing.length + 1
    let name = `input_${index}`
    while (existing.includes(name)) {
      index += 1
      name = `input_${index}`
    }
    setNodes((current) => current.map((node) => (
      node.id === 'start' ? { ...node, outputs: [...(node.outputs || []), name] } : node
    )))
    setStartInputTypes((current) => ({ ...current, [name]: 'String' }))
  }

  const renameStartInput = (oldName, newName) => {
    setNodes((current) => current.map((node) => (
      node.id === 'start'
        ? { ...node, outputs: (node.outputs || []).map((field) => field === oldName ? newName : field) }
        : node
    )))
    setStartInputTypes((current) => {
      const next = { ...current, [newName]: current[oldName] || 'String' }
      if (oldName !== newName) delete next[oldName]
      return next
    })
    setInputBindings((current) => {
      const next = {}
      Object.entries(current).forEach(([nodeId, rows]) => {
        next[nodeId] = rows.map((row) => (
          row.sourceNodeId === 'start' && row.sourceId === oldName
            ? { ...row, sourceId: newName, sourceLabel: `Start · ${newName}` }
            : row
        ))
      })
      return next
    })
  }

  const deleteStartInput = (field) => {
    setNodes((current) => current.map((node) => (
      node.id === 'start'
        ? { ...node, outputs: (node.outputs || []).filter((item) => item !== field) }
        : node
    )))
    setStartInputTypes((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setInputBindings((current) => {
      const next = {}
      Object.entries(current).forEach(([nodeId, rows]) => {
        next[nodeId] = rows.map((row) => (
          row.sourceNodeId === 'start' && row.sourceId === field
            ? { ...row, sourceType: '', sourceNodeId: '', sourceId: '', sourceLabel: '' }
            : row
        ))
      })
      return next
    })
  }

  const addInputBinding = (nodeId) => {
    setInputBindings((current) => ({
      ...current,
      [nodeId]: [
        ...(current[nodeId] || []),
        { id: `${nodeId}-${Date.now()}`, name: '', sourceType: '', sourceId: '', sourceLabel: '' },
      ],
    }))
  }

  const deleteInputBinding = (nodeId, rowId) => {
    setInputBindings((current) => ({
      ...current,
      [nodeId]: (current[nodeId] || []).filter((row) => row.id !== rowId),
    }))
    setBindingPicker(null)
  }

  const selectBinding = (nodeId, rowId, option) => {
    updateInputBinding(nodeId, rowId, option)
    setBindingPicker(null)
  }

  const renderBindingPicker = (nodeId, rowId) => {
    if (bindingPicker?.nodeId !== nodeId || bindingPicker?.rowId !== rowId) return null
    const upstreamNodes = getUpstreamNodes(nodeId)
    return (
      <div className="binding-picker">
        <div className="binding-picker-title">Select variable</div>
        <div className="binding-picker-section">
          <strong><span className="source-icon feature">F</span> Feature</strong>
          {featureVariables.map((feature) => (
            <button
              key={feature.name}
              onClick={() => selectBinding(nodeId, rowId, {
                sourceType: 'feature',
                sourceId: feature.name,
                sourceLabel: `Feature · ${feature.name}`,
              })}
            >
              <span>{feature.name}</span>
              <code>{feature.type}</code>
              <small>{feature.component}</small>
            </button>
          ))}
        </div>
        {upstreamNodes.map((upstreamNode) => (
          <div className="binding-picker-section" key={upstreamNode.id}>
            <strong>
              <span className="source-icon node">{upstreamNode.type === 'start' ? 'S' : 'N'}</span>
              {upstreamNode.label}
            </strong>
            {(upstreamNode.outputs || []).map((output) => (
              <button
                key={output}
                onClick={() => selectBinding(nodeId, rowId, {
                  sourceType: 'node',
                  sourceNodeId: upstreamNode.id,
                  sourceId: output,
                  sourceLabel: `${upstreamNode.label} · ${output}`,
                })}
              >
                <span>{output}</span>
                <code>auto</code>
                <small>Upstream output</small>
              </button>
            ))}
          </div>
        ))}
      </div>
    )
  }

  const renderInputBindings = (node) => {
    const rows = inputBindings[node.id] || []
    return (
      <section className="binding-config-section">
        <div className="binding-section-title">
          <strong>Inputs</strong>
          <button onClick={() => addInputBinding(node.id)}>＋</button>
        </div>
        <div className="binding-table-header"><span>Variable name</span><span>Variable value</span></div>
        {rows.map((row) => (
          <div className="binding-row" key={row.id}>
            <input
              aria-label="Variable name"
              value={row.name}
              placeholder="Input name"
              onChange={(event) => updateInputBinding(node.id, row.id, { name: event.target.value })}
            />
            <div className="binding-value-wrap">
              <button
                className={`binding-value ${row.sourceType ? 'has-value' : ''}`}
                onClick={() => setBindingPicker((current) => (
                  current?.nodeId === node.id && current?.rowId === row.id ? null : { nodeId: node.id, rowId: row.id }
                ))}
              >
                {row.sourceType && <span className={`source-icon ${row.sourceType}`}>{row.sourceType === 'feature' ? 'F' : 'N'}</span>}
                <span>{row.sourceLabel || 'Select Feature or upstream output'}</span>
                <b>⌄</b>
              </button>
              {renderBindingPicker(node.id, row.id)}
            </div>
            <button className="binding-remove" aria-label="Remove input" onClick={() => deleteInputBinding(node.id, row.id)}>−</button>
          </div>
        ))}
        {!rows.length && <p className="binding-empty">No input configured. This node can still run without inputs.</p>}
      </section>
    )
  }

  const getEndTemporaryOptions = (nodeId) => {
    const seen = new Set()
    return getUpstreamNodes(nodeId)
      .filter((node) => node.type !== 'start')
      .flatMap((node) => (node.outputs || []).map((output) => ({
        value: `${node.id}:${output}`,
        name: output,
        sourceNodeId: node.id,
        sourceLabel: node.label,
      })))
      .filter((option) => {
        if (seen.has(option.name)) return false
        seen.add(option.name)
        return true
      })
  }

  const commitEndOutputs = (rows) => {
    setInputBindings((current) => ({ ...current, end: rows }))
    setNodes((current) => current.map((node) => (
      node.id === 'end'
        ? { ...node, inputs: rows.filter((row) => row.sourceId).map((row) => row.sourceId) }
        : node
    )))
  }

  const addEndOutput = () => {
    const rows = inputBindings.end || []
    commitEndOutputs([
      ...rows,
      { id: `end-output-${Date.now()}`, name: '', sourceType: '', sourceNodeId: '', sourceId: '', sourceLabel: '' },
    ])
  }

  const updateEndOutput = (rowId, value) => {
    const option = getEndTemporaryOptions('end').find((item) => item.value === value)
    if (!option) return
    commitEndOutputs((inputBindings.end || []).map((row) => (
      row.id === rowId
        ? {
          ...row,
          name: option.name,
          sourceType: 'temporary',
          sourceNodeId: option.sourceNodeId,
          sourceId: option.name,
          sourceLabel: `${option.sourceLabel} · ${option.name}`,
        }
        : row
    )))
  }

  const deleteEndOutput = (rowId) => {
    commitEndOutputs((inputBindings.end || []).filter((row) => row.id !== rowId))
  }

  const renderEndOutputs = (node) => {
    const rows = inputBindings.end || []
    const options = getEndTemporaryOptions(node.id)
    const selectedNames = new Set(rows.map((row) => row.sourceId).filter(Boolean))
    return (
      <section className="end-output-section">
        <div className="binding-section-title">
          <strong>Outputs</strong>
          <button aria-label="Add End output" onClick={addEndOutput}>＋</button>
        </div>
        <span className="end-output-column-label">Variable</span>
        {rows.map((row) => (
          <div className="end-output-row" key={row.id}>
            <span className="end-temporary-icon">T</span>
            <select
              aria-label="Select Temporary output"
              value={row.sourceId ? `${row.sourceNodeId}:${row.sourceId}` : ''}
              onChange={(event) => updateEndOutput(row.id, event.target.value)}
            >
              <option value="" disabled>Select Temporary</option>
              <optgroup label="Temporary">
                {options.map((option) => (
                  <option
                    disabled={selectedNames.has(option.name) && option.name !== row.sourceId}
                    key={option.value}
                    value={option.value}
                  >{option.name}</option>
                ))}
              </optgroup>
            </select>
            <button aria-label={`Remove ${row.sourceId || 'output'}`} onClick={() => deleteEndOutput(row.id)}>−</button>
          </div>
        ))}
        {!rows.length && <p className="binding-empty">Add an output and select a Temporary variable.</p>}
      </section>
    )
  }

  const getConditionVariableType = (variable, upstreamNodes = []) => {
    if (!variable) return 'unknown'
    const featureName = variable.startsWith('Feature · ') ? variable.replace('Feature · ', '') : ''
    const customName = variable.startsWith('Custom · ') ? variable.replace('Custom · ', '') : ''
    if (featureName) return featureVariables.find((item) => item.name === featureName)?.type || 'unknown'
    if (customName) return customConditionVariables.find((item) => item.name === customName)?.type || 'unknown'
    const outputName = variable.split(' · ').at(-1) || ''
    if (/approved|enabled|active|success/i.test(outputName)) return 'boolean'
    if (/age|amount|income|score|limit|rate|term|count|number/i.test(outputName)) return 'number'
    if (/date|time|created|updated/i.test(outputName)) return 'time'
    return upstreamNodes.length ? 'string' : 'unknown'
  }

  const getConditionOperators = (type) => {
    let operators
    if (type === 'number') operators = ['=', '!=', '>', '>=', '<', '<=']
    else if (type === 'boolean') operators = ['=', '!=']
    else if (type === 'time') operators = ['=', '!=', 'before', 'after', 'between']
    else if (type === 'array') operators = ['contains', 'not contains', 'intersects']
    else if (type === 'string') operators = ['=', '!=', 'contains', 'not contains', 'starts with', 'ends with', 'in', 'not in']
    else operators = ['=', '!=', '>', '>=', '<', '<=', 'contains', 'in']
    return [...operators, 'Expression']
  }

  const formatConditionRow = (row) => {
    if (row?.operator === 'Expression') return row.fullExpression || 'Expression'
    if (!row?.variable) return 'Not configured'
    if (row.rightMode !== 'expression') {
      return `${row.variable.replace('Feature · ', '').replace('Custom · ', '')} ${row.operator} ${row.expression}`
    }
    const expression = (row.expressionParts || []).map((part) => part.value || '').join(' ')
    return `${row.variable.replace('Feature · ', '').replace('Custom · ', '')} ${row.operator} ${expression || 'expression'}`
  }

  const renderConditionExpression = (branch, row, upstreamNodes) => {
    const parts = row.expressionParts || []
    const pickerOpen = conditionExpressionPicker?.branch === branch && conditionExpressionPicker?.rowId === row.id
    const updateParts = (updater) => updateCondition(branch, row.id, 'expressionParts', updater(parts))
    const addPart = (part) => {
      updateParts((current) => [...current, part])
      setConditionExpressionPicker(null)
    }
    const variableModules = [
      ...featureVariables.map((item) => ({ label: item.name, kind: 'variable', value: `Feature · ${item.name}`, sourceType: 'feature' })),
      ...customConditionVariables.map((item) => ({ label: item.name, kind: 'variable', value: `Custom · ${item.name}`, sourceType: 'custom' })),
      ...upstreamNodes.flatMap((node) => (node.outputs || []).map((output) => ({
        label: `${node.label} · ${output}`,
        kind: 'variable',
        value: `${node.label} · ${output}`,
        sourceType: 'local',
      }))),
    ]
    return (
      <div
        className="condition-expression-builder block-expression-builder"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          if (actionModuleDragRef.current) {
            addPart(actionModuleDragRef.current)
            actionModuleDragRef.current = null
          }
        }}
      >
        {!parts.length && <span className="block-expression-placeholder">Build expression</span>}
        {parts.map((part, index) => (
          part.kind === 'literal'
            ? (
              <span className="block-expression-literal" key={`${row.id}-${index}`}>
                <input
                  aria-label="Condition expression constant"
                  value={part.value}
                  placeholder={part.valueType === 'String' ? 'Text' : '0'}
                  onChange={(event) => updateParts((current) => current.map((item, partIndex) => (
                    partIndex === index ? { ...item, value: event.target.value } : item
                  )))}
                />
                <button onClick={() => updateParts((current) => current.filter((_, partIndex) => partIndex !== index))}>×</button>
              </span>
            )
            : (
              <button
                className={`block-expression-token ${part.kind}`}
                key={`${row.id}-${index}`}
                title="Click to remove"
                onClick={() => updateParts((current) => current.filter((_, partIndex) => partIndex !== index))}
              >
                {part.kind === 'function' ? 'ƒ ' : ''}{part.value}
              </button>
            )
        ))}
        <button
          className="block-expression-add"
          aria-label="Add condition expression module"
          onClick={() => setConditionExpressionPicker(pickerOpen ? null : { branch, rowId: row.id })}
        >＋</button>
        {pickerOpen && (
          <div className="block-expression-picker condition-expression-picker">
            <section>
              <small>Variables</small>
              {variableModules.map((module) => (
                <button
                  draggable
                  key={module.value}
                  onDragStart={() => { actionModuleDragRef.current = module }}
                  onClick={() => addPart(module)}
                >{module.label}</button>
              ))}
            </section>
            <section>
              <small>Functions</small>
              {['Abs()', 'Round()', 'Concat()', 'Coalesce()', 'DateDiff()'].map((name) => (
                <button
                  draggable
                  key={name}
                  onDragStart={() => { actionModuleDragRef.current = { kind: 'function', value: name } }}
                  onClick={() => addPart({ kind: 'function', value: name })}
                >ƒ {name}</button>
              ))}
            </section>
            <section>
              <small>Operators</small>
              <div>
                {['+', '−', '×', '÷', '%', 'AND', 'OR', '∩', '∪', '(', ')'].map((operator) => (
                  <button key={operator} onClick={() => addPart({ kind: 'operator', value: operator })}>{operator}</button>
                ))}
              </div>
            </section>
            <section>
              <small>Constants</small>
              <button onClick={() => addPart({ kind: 'literal', value: '0', valueType: 'Number' })}># Number</button>
              <button onClick={() => addPart({ kind: 'literal', value: '', valueType: 'String' })}>T Text</button>
            </section>
          </div>
        )}
      </div>
    )
  }

  const renderConditionGroup = (branch, label, priority) => {
    const upstreamNodes = selectedNode ? getUpstreamNodes(selectedNode.id) : []
    return (
    <div className="selector-branch-card">
      <div className="selector-branch-header">
        <i>⋮⋮</i>
        <strong>{label}</strong>
        <span>Priority {priority}</span>
        <button aria-label={`Remove ${label}`} onClick={() => deleteConditionBranch(branch)}>−</button>
      </div>
      {conditionRows[branch].map((row, rowIndex) => {
        const variableType = getConditionVariableType(row.variable, upstreamNodes)
        const operators = getConditionOperators(variableType)
        const fullExpressionMode = row.operator === 'Expression'
        return (
        <div className="condition-entry" key={row.id}>
          {rowIndex > 0 && (
            <div className="condition-logic">
              <span />
              <select aria-label={`Relationship before condition ${rowIndex + 1}`} value={row.logic || 'AND'} onChange={(event) => updateCondition(branch, row.id, 'logic', event.target.value)}>
                <option>AND</option>
                <option>OR</option>
              </select>
              <span />
            </div>
          )}
          <div className={`condition-row ${fullExpressionMode ? 'full-expression-mode' : ''}`}>
            {fullExpressionMode
              ? (
                <div className="condition-full-expression">
                  <div>
                    <strong>Expression</strong>
                    <button onClick={() => updateCondition(branch, row.id, 'operator', '=')}>Use simple condition</button>
                  </div>
                  <input
                    autoFocus
                    aria-label="Full condition expression"
                    value={row.fullExpression || ''}
                    placeholder="Expression"
                    onChange={(event) => updateCondition(branch, row.id, 'fullExpression', event.target.value)}
                  />
                </div>
              )
              : (
                <>
                  <select
                    aria-label="Left variable"
                    className="condition-variable"
                    value={row.variable}
                    onChange={(event) => {
                      const nextVariable = event.target.value
                      const nextOperators = getConditionOperators(getConditionVariableType(nextVariable, upstreamNodes))
                      updateCondition(branch, row.id, 'variable', nextVariable)
                      if (!nextOperators.includes(row.operator)) updateCondition(branch, row.id, 'operator', nextOperators[0])
                    }}
                  >
                    <option value="">Select left variable</option>
                    <optgroup label="Feature">
                      {featureVariables.map((feature) => <option key={feature.name}>{`Feature · ${feature.name}`}</option>)}
                    </optgroup>
                    <optgroup label="Custom">
                      {customConditionVariables.map((variable) => <option key={variable.name}>{`Custom · ${variable.name}`}</option>)}
                    </optgroup>
                    {upstreamNodes.map((node) => (
                      <optgroup label={node.label} key={node.id}>
                        {(node.outputs || []).map((output) => <option key={output}>{`${node.label} · ${output}`}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <div className="condition-comparison">
                    <select aria-label="Operator" value={row.operator || '='} onChange={(event) => updateCondition(branch, row.id, 'operator', event.target.value)}>
                      {operators.map((operator) => <option key={operator}>{operator}</option>)}
                    </select>
                    {row.rightMode === 'expression'
                      ? renderConditionExpression(branch, row, upstreamNodes)
                      : (
                        <input
                          aria-label="Right variable or value"
                          value={row.expression}
                          placeholder={`Enter ${variableType === 'unknown' ? 'value' : variableType} or select variable`}
                          onChange={(event) => updateCondition(branch, row.id, 'expression', event.target.value)}
                        />
                      )}
                    <button
                      title="Choose right value source"
                      onClick={() => setConditionValuePicker((current) => (
                        current?.branch === branch && current?.rowId === row.id ? null : { branch, rowId: row.id }
                      ))}
                    >
                      ◇
                    </button>
                    {conditionValuePicker?.branch === branch && conditionValuePicker?.rowId === row.id && (
                      <div className="condition-reference-picker">
                  <strong>Right value source</strong>
                  <div className="condition-source-modes">
                    <button
                      onClick={() => {
                        updateCondition(branch, row.id, 'rightMode', 'value')
                        setConditionValuePicker(null)
                      }}
                    ><span>Direct value</span><code>Type</code></button>
                    <button
                      onClick={() => {
                        updateCondition(branch, row.id, 'rightMode', 'expression')
                        if (!row.expressionParts) updateCondition(branch, row.id, 'expressionParts', [])
                        setConditionValuePicker(null)
                      }}
                    ><span>Expression</span><code>ƒx</code></button>
                  </div>
                  <small>Feature</small>
                  {featureVariables.map((feature) => (
                    <button
                      key={feature.name}
                      onClick={() => {
                        updateCondition(branch, row.id, 'rightMode', 'value')
                        updateCondition(branch, row.id, 'expression', `Feature · ${feature.name}`)
                        setConditionValuePicker(null)
                      }}
                    >
                      <span>{feature.name}</span><code>{feature.type}</code>
                    </button>
                  ))}
                  <small>Custom</small>
                  {customConditionVariables.map((variable) => (
                    <button
                      key={variable.name}
                      onClick={() => {
                        updateCondition(branch, row.id, 'rightMode', 'value')
                        updateCondition(branch, row.id, 'expression', `Custom · ${variable.name}`)
                        setConditionValuePicker(null)
                      }}
                    >
                      <span>{variable.name}</span><code>{variable.type}</code>
                    </button>
                  ))}
                  {upstreamNodes.map((node) => (
                    <div key={node.id}>
                      <small>{node.label}</small>
                      {(node.outputs || []).map((output) => (
                        <button
                          key={output}
                          onClick={() => {
                            updateCondition(branch, row.id, 'rightMode', 'value')
                            updateCondition(branch, row.id, 'expression', `${node.label} · ${output}`)
                            setConditionValuePicker(null)
                          }}
                        >
                          <span>{output}</span><code>auto</code>
                        </button>
                      ))}
                    </div>
                  ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            <button
              aria-label={`Delete ${branch} condition ${rowIndex + 1}`}
              disabled={conditionRows[branch].length === 1}
              onClick={() => deleteCondition(branch, row.id)}
            >−</button>
          </div>
        </div>
      )})}
      <button className="condition-add" onClick={() => addCondition(branch)}>＋ Add condition</button>
    </div>
  )}

  const actionPickerCategories = [
    { id: 'all', label: 'All', icon: '⌘' },
    { id: 'custom', label: 'Custom', icon: 'C' },
    { id: 'feature', label: 'Feature', icon: 'F' },
    { id: 'local', label: 'Upstream Output', icon: 'N' },
    { id: 'function', label: 'Function', icon: 'ƒ' },
    { id: 'constant', label: 'Constant', icon: '#' },
  ]

  const actionFunctionOptions = [
    { name: 'Abs', description: 'Absolute value', args: 1 },
    { name: 'Round', description: 'Round value', args: 2 },
    { name: 'Concat', description: 'Join values', args: 2 },
    { name: 'Coalesce', description: 'First non-empty value', args: 2 },
    { name: 'DateDiff', description: 'Difference between dates', args: 2 },
  ]

  const actionPickerOptions = selectedNode
    ? [
      ...customConditionVariables.map((variable) => ({
        category: 'custom',
        label: variable.name,
        detail: variable.type,
        dataType: normalizeActionDataType(variable.type),
        operand: { kind: 'variable', value: `Custom · ${variable.name}`, sourceType: 'custom' },
      })),
      ...featureVariables.map((variable) => ({
        category: 'feature',
        label: variable.name,
        detail: `${variable.component} · ${variable.type}`,
        dataType: normalizeActionDataType(variable.type),
        operand: { kind: 'variable', value: `Feature · ${variable.name}`, sourceType: 'feature' },
      })),
      ...getUpstreamNodes(selectedNode.id).flatMap((node) => (
        (node.outputs || []).map((output) => ({
          category: 'local',
          label: output,
          detail: node.label,
          dataType: inferActionTargetDataType(`${node.label} · ${output}`),
          operand: { kind: 'variable', value: `${node.label} · ${output}`, sourceType: 'local' },
        }))
      )),
    ]
    : []

  const renderBlockExpression = (nodeId, rule, condition) => {
    const parts = condition.expressionParts || []
    const pickerOpen = blockExpressionPicker?.conditionId === condition.id
    const addPart = (part) => {
      updateBlockExpressionParts(nodeId, rule.id, condition.id, (current) => [...current, part])
      setBlockExpressionPicker(null)
    }
    const removePart = (index) => {
      updateBlockExpressionParts(nodeId, rule.id, condition.id, (current) => current.filter((_, partIndex) => partIndex !== index))
    }
    const updateLiteral = (index, value) => {
      updateBlockExpressionParts(nodeId, rule.id, condition.id, (current) => current.map((part, partIndex) => (
        partIndex === index ? { ...part, value } : part
      )))
    }
    return (
      <div
        className="block-expression-builder"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          if (actionModuleDragRef.current) {
            addPart(actionModuleDragRef.current)
            actionModuleDragRef.current = null
          }
        }}
      >
        {!parts.length && <span className="block-expression-placeholder">Build expression</span>}
        {parts.map((part, index) => (
          part.kind === 'literal'
            ? (
              <span className="block-expression-literal" key={`${condition.id}-${index}`}>
                <input
                  aria-label="Expression constant"
                  value={part.value}
                  placeholder={part.valueType === 'String' ? 'Text' : '0'}
                  onChange={(event) => updateLiteral(index, event.target.value)}
                />
                <button onClick={() => removePart(index)}>×</button>
              </span>
            )
            : (
              <button
                className={`block-expression-token ${part.kind}`}
                key={`${condition.id}-${index}`}
                onClick={() => removePart(index)}
                title="Click to remove"
              >
                {part.kind === 'function' ? 'ƒ ' : ''}{part.value}
              </button>
            )
        ))}
        <button
          className="block-expression-add"
          aria-label="Add expression module"
          onClick={() => setBlockExpressionPicker((current) => current?.conditionId === condition.id ? null : { conditionId: condition.id })}
        >＋</button>
        {pickerOpen && (
          <div className="block-expression-picker">
            <section>
              <small>Variables</small>
              {actionPickerOptions.map((option) => (
                <button
                  draggable
                  key={`${option.category}-${option.label}`}
                  onDragStart={() => { actionModuleDragRef.current = option.operand }}
                  onClick={() => addPart(option.operand)}
                >
                  <i className={option.category}>{option.category === 'feature' ? 'F' : option.category === 'output' ? 'O' : 'L'}</i>
                  {option.label}
                </button>
              ))}
            </section>
            <section>
              <small>Functions</small>
              {actionFunctionOptions.map((option) => (
                <button
                  draggable
                  key={option.name}
                  onDragStart={() => { actionModuleDragRef.current = { kind: 'function', value: `${option.name}()` } }}
                  onClick={() => addPart({ kind: 'function', value: `${option.name}()` })}
                >ƒ {option.name}</button>
              ))}
            </section>
            <section>
              <small>Operators</small>
              <div>
                {['+', '−', '×', '÷', '%', 'AND', 'OR', '∩', '∪', '(', ')'].map((operator) => (
                  <button
                    draggable
                    key={operator}
                    onDragStart={() => { actionModuleDragRef.current = { kind: 'operator', value: operator } }}
                    onClick={() => addPart({ kind: 'operator', value: operator })}
                  >{operator}</button>
                ))}
              </div>
            </section>
            <section>
              <small>Constants</small>
              <button onClick={() => addPart({ kind: 'literal', value: '0', valueType: 'Number' })}># Number</button>
              <button onClick={() => addPart({ kind: 'literal', value: '', valueType: 'String' })}>T Text</button>
            </section>
          </div>
        )}
      </div>
    )
  }

  const formatBlockCondition = (condition) => {
    if (condition?.operator === 'Expression') return condition.fullExpression || 'Expression'
    if (!condition?.variable) return 'Configure condition'
    if (condition.operator !== 'Expression') {
      return `${condition.variable.replace('Feature · ', '')} ${condition.operator} ${condition.expression}`
    }
    const expression = (condition.expressionParts || []).map((part) => part.value || '').join(' ')
    return `${condition.variable.replace('Feature · ', '')} matches ${expression || 'expression'}`
  }

  const renderActionTargetPicker = (nodeId, operation) => {
    if (actionTargetPicker?.rowId !== operation.id) return null
    const category = actionTargetPicker.category || 'feature'
    const query = (actionTargetPicker.query || '').trim().toLowerCase()
    const options = actionPickerOptions.map((option) => ({
        category: option.category,
        label: option.label,
        detail: option.detail,
        dataType: option.dataType,
        target: option.operand.value,
      })).filter((option, index, all) => (
      ['custom', 'feature', 'local'].includes(option.category)
      && (query ? ['custom', 'feature'].includes(option.category) : option.category === category)
      && (!query || `${option.label} ${option.detail}`.toLowerCase().includes(query))
      && all.findIndex((item) => item.target === option.target) === index
    ))
    return (
      <div className="action-value-picker action-target-value-picker">
        <div className="action-picker-search">
          <span>⌕</span>
          <input
            autoFocus
            aria-label="Search Feature or Custom variables"
            value={actionTargetPicker.query || ''}
            placeholder="Search Feature or Custom by variable name"
            onChange={(event) => setActionTargetPicker((current) => ({ ...current, query: event.target.value }))}
          />
          <button onClick={() => setActionTargetPicker(null)}>×</button>
        </div>
        <div className="action-picker-body">
          <nav className="action-picker-categories">
            {[
              { id: 'custom', label: 'Custom', icon: 'C' },
              { id: 'feature', label: 'Feature', icon: 'F' },
              { id: 'local', label: 'Upstream Output', icon: 'N' },
            ].map((item) => (
              <button
                className={category === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => setActionTargetPicker((current) => ({ ...current, category: item.id }))}
              ><i>{item.icon}</i>{item.label}</button>
            ))}
          </nav>
          <div className="action-picker-results">
            <section>
              <small>{query ? 'Search Result' : category}</small>
              {options.map((option) => (
                <button key={option.target} onClick={() => updateActionTarget(nodeId, operation.id, option.target, { dataType: option.dataType })}>
                  <i className={option.category}>{option.category === 'feature' ? 'F' : option.category === 'custom' ? 'C' : 'N'}</i>
                  <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                </button>
              ))}
              {!options.length && <p>No matching variables</p>}
            </section>
          </div>
        </div>
      </div>
    )
  }

  const openActionOperandPicker = (operation, path) => {
    setActionExpressionPicker({
      rowId: operation.id,
      kind: 'operand',
      path: path.join('.'),
      category: 'all',
      query: '',
    })
  }

  const isActionPickerOpen = (operation, path) => (
    actionExpressionPicker?.rowId === operation.id
    && actionExpressionPicker?.kind === 'operand'
    && actionExpressionPicker?.path === path.join('.')
  )

  const createActionLiteral = (valueType) => ({
    kind: 'literal',
    value: valueType === 'Number' ? '0' : valueType === 'Boolean' ? 'true' : valueType === 'Null' ? 'null' : '',
    valueType,
  })

  const renderActionOperandPicker = (nodeId, operation, path) => {
    if (!isActionPickerOpen(operation, path)) return null
    const category = actionExpressionPicker.category || 'all'
    const query = (actionExpressionPicker.query || '').trim().toLowerCase()
    const currentOperand = getActionOperandAtPath(operation, path)
    const variableOptions = actionPickerOptions.filter((option) => (
      (query ? ['custom', 'feature'].includes(option.category) : category === 'all' || category === option.category)
      && (!query || `${option.label} ${option.detail}`.toLowerCase().includes(query))
    ))
    const functionOptions = actionFunctionOptions.filter((option) => (
      !query && (category === 'all' || category === 'function')
    ))
    const showConstants = !query && (category === 'all' || category === 'constant')
    const chooseOperand = (operand) => setActionOperandAtPath(nodeId, operation.id, path, operand)
    return (
      <div className="action-value-picker">
        <div className="action-picker-search">
          <span>⌕</span>
          <input
            autoFocus
            aria-label="Search Feature or Custom variables"
            value={actionExpressionPicker.query || ''}
            placeholder="Search Feature or Custom by variable name"
            onChange={(event) => setActionExpressionPicker((current) => ({ ...current, query: event.target.value }))}
          />
          <button onClick={() => setActionExpressionPicker(null)}>×</button>
        </div>
        <div className="action-picker-body">
          <nav className="action-picker-categories">
            {actionPickerCategories.map((item) => (
              <button
                className={category === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => setActionExpressionPicker((current) => ({ ...current, category: item.id }))}
              >
                <i>{item.icon}</i>{item.label}
              </button>
            ))}
          </nav>
          <div className="action-picker-results">
            {variableOptions.length > 0 && (
              <section>
                <small>{query ? 'Search Result' : category === 'all' ? 'Variables' : actionPickerCategories.find((item) => item.id === category)?.label}</small>
                {variableOptions.map((option) => (
                  <button
                    draggable
                    key={`${option.category}-${option.label}`}
                    onDragStart={() => { actionModuleDragRef.current = option.operand }}
                    onClick={() => chooseOperand(option.operand)}
                >
                    <i className={option.category}>{option.category === 'feature' ? 'F' : option.category === 'custom' ? 'C' : 'N'}</i>
                    <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                  </button>
                ))}
              </section>
            )}
            {functionOptions.length > 0 && (
              <section>
                <small>Functions</small>
                {functionOptions.map((option) => (
                  <button
                    draggable
                    key={option.name}
                    onDragStart={() => {
                      actionModuleDragRef.current = {
                        kind: 'function',
                        name: option.name,
                        args: Array.from({ length: option.args }, (_, index) => index === 0 ? currentOperand || null : null),
                      }
                    }}
                    onClick={() => wrapActionOperandWithFunction(nodeId, operation, path, option.name, option.args)}
                  >
                    <i className="function">ƒ</i>
                    <span><strong>{option.name}</strong><small>{option.description}</small></span>
                  </button>
                ))}
              </section>
            )}
            {showConstants && (
              <section>
                <small>Constants</small>
                <div className="action-picker-constant-modules">
                  {['Number', 'String', 'Boolean', 'Null'].map((type) => (
                    <button
                      draggable
                      key={type}
                      onDragStart={() => { actionModuleDragRef.current = createActionLiteral(type) }}
                      onClick={() => chooseOperand(createActionLiteral(type))}
                    ><i className="constant">#</i><strong>{type}</strong></button>
                  ))}
                </div>
              </section>
            )}
            {!variableOptions.length && !functionOptions.length && !showConstants && <p>No matching modules</p>}
          </div>
        </div>
      </div>
    )
  }

  const renderActionOperand = (nodeId, operation, operand, path) => {
    if (operand?.kind === 'function') {
      return (
        <span
          className="action-function-module"
          draggable
          onDragStart={() => { actionModuleDragRef.current = operand }}
        >
          <button className="action-function-label" onClick={() => openActionOperandPicker(operation, path)}>ƒ {operand.name}</button>
          <span>(</span>
          {(operand.args || []).map((argument, index) => (
            <span className="action-function-argument" key={`${operation.id}-${path.join('-')}-${index}`}>
              {renderActionOperand(nodeId, operation, argument, [...path, index])}
              {index < operand.args.length - 1 && <b>,</b>}
            </span>
          ))}
          <span>)</span>
          {renderActionOperandPicker(nodeId, operation, path)}
        </span>
      )
    }
    if (operand?.kind === 'literal') {
      return (
        <span
          className={`action-expression-literal ${operand.valueType?.toLowerCase()}`}
          draggable
          onDragStart={() => { actionModuleDragRef.current = operand }}
        >
          <input
            aria-label={`${operation.target || 'Output'} constant value`}
            value={operand.value}
            placeholder={operand.valueType === 'String' ? 'Enter text' : 'Enter number'}
            onChange={(event) => updateLiteralOperand(nodeId, operation, path, event.target.value)}
          />
          <button aria-label="Change value source" onClick={() => openActionOperandPicker(operation, path)}>⌄</button>
          {renderActionOperandPicker(nodeId, operation, path)}
        </span>
      )
    }
    const sourceType = operand?.sourceType || (operand?.value?.startsWith('Feature ·') ? 'feature' : operand?.value?.startsWith('Output ·') ? 'output' : 'local')
    if (!operand) {
      return (
        <span
          className="action-expression-empty"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            if (actionModuleDragRef.current) {
              setActionOperandAtPath(nodeId, operation.id, path, actionModuleDragRef.current)
              actionModuleDragRef.current = null
            }
          }}
        >
          <input
            aria-label={`${operation.target || 'Output'} constant value`}
            placeholder="Enter constant"
            onChange={(event) => {
              const value = event.target.value
              const valueType = value !== '' && !Number.isNaN(Number(value)) ? 'Number' : 'String'
              setActionOperandAtPath(nodeId, operation.id, path, {
                kind: 'literal',
                value,
                valueType,
              }, false)
            }}
          />
          <button aria-label="Select variable or function" onClick={() => openActionOperandPicker(operation, path)}>⌄</button>
          {renderActionOperandPicker(nodeId, operation, path)}
        </span>
      )
    }
    return (
      <span
        className="action-expression-variable"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          if (actionModuleDragRef.current) {
            setActionOperandAtPath(nodeId, operation.id, path, actionModuleDragRef.current)
            actionModuleDragRef.current = null
          }
        }}
      >
        <button
          className={operand ? 'has-module' : ''}
          draggable={Boolean(operand)}
          onDragStart={() => { actionModuleDragRef.current = operand }}
          onClick={() => openActionOperandPicker(operation, path)}
        >
          {operand?.kind === 'variable'
            ? <><i className={sourceType}>{sourceType === 'feature' ? 'F' : sourceType === 'output' ? 'O' : 'L'}</i>{operand.value}</>
            : '＋ Select or drop module'}
        </button>
        {renderActionOperandPicker(nodeId, operation, path)}
      </span>
    )
  }

  const renderActionExpression = (nodeId, operation) => {
    const parts = operation.expression?.parts || [null]
    return (
      <div
        className="action-expression-builder"
        onDragOver={(event) => event.preventDefault()}
      >
        {parts.map((part, index) => (
          part?.kind === 'operator'
            ? <button
              className="action-expression-operator"
              key={`${operation.id}-${index}`}
              onClick={() => setActionExpressionPicker({ rowId: operation.id, kind: 'operator', operatorIndex: index })}
            >{part.value}</button>
            : <span key={`${operation.id}-${index}`}>{renderActionOperand(nodeId, operation, part, [index])}</span>
        ))}
        {parts.at(-1) && (
          <span className="action-add-operator">
            <button aria-label="Add calculation" onClick={() => setActionExpressionPicker({ rowId: operation.id, kind: 'operator' })}>＋</button>
            {actionExpressionPicker?.rowId === operation.id && actionExpressionPicker?.kind === 'operator' && (
              <div className="action-operator-picker">
                {['+', '−', '×', '÷', '%'].map((operator) => (
                  <button
                    key={operator}
                    onClick={() => Number.isInteger(actionExpressionPicker.operatorIndex)
                      ? replaceFormulaOperator(nodeId, operation.id, actionExpressionPicker.operatorIndex, operator)
                      : appendFormulaOperator(nodeId, operation.id, operator)}
                  >{operator}</button>
                ))}
              </div>
            )}
          </span>
        )}
      </div>
    )
  }

  const updateDecisionTable = (nodeId, updater) => {
    setDecisionTables((current) => ({
      ...current,
      [nodeId]: updater(current[nodeId] || { columns: [], rows: [] }),
    }))
  }

  const updateDecisionTableCell = (nodeId, rowId, columnId, value) => {
    updateDecisionTable(nodeId, (table) => ({
      ...table,
      rows: table.rows.map((row) => (
        row.id === rowId ? { ...row, cells: { ...row.cells, [columnId]: value } } : row
      )),
    }))
  }

  const appendDecisionTablePart = (nodeId, rowId, columnId, part) => {
    updateDecisionTable(nodeId, (table) => ({
      ...table,
      rows: table.rows.map((row) => {
        if (row.id !== rowId) return row
        const currentCell = row.cells[columnId]
        const currentParts = currentCell?.kind === 'expression'
          ? currentCell.parts
          : currentCell ? [currentCell] : []
        return {
          ...row,
          cells: {
            ...row.cells,
            [columnId]: { kind: 'expression', parts: [...currentParts, part] },
          },
        }
      }),
    }))
  }

  const updateDecisionTablePart = (nodeId, rowId, columnId, partIndex, patch) => {
    updateDecisionTable(nodeId, (table) => ({
      ...table,
      rows: table.rows.map((row) => {
        if (row.id !== rowId) return row
        const cell = row.cells[columnId]
        return {
          ...row,
          cells: {
            ...row.cells,
            [columnId]: {
              kind: 'expression',
              parts: (cell?.parts || []).map((part, index) => index === partIndex ? { ...part, ...patch } : part),
            },
          },
        }
      }),
    }))
  }

  const removeDecisionTablePart = (nodeId, rowId, columnId, partIndex) => {
    updateDecisionTable(nodeId, (table) => ({
      ...table,
      rows: table.rows.map((row) => {
        if (row.id !== rowId) return row
        const nextParts = (row.cells[columnId]?.parts || []).filter((_, index) => index !== partIndex)
        return {
          ...row,
          cells: { ...row.cells, [columnId]: nextParts.length ? { kind: 'expression', parts: nextParts } : null },
        }
      }),
    }))
  }

  const addDecisionTableRow = (nodeId) => {
    updateDecisionTable(nodeId, (table) => ({
      ...table,
      rows: [
        ...table.rows,
        {
          id: `table-row-${Date.now()}`,
          cells: Object.fromEntries(table.columns.map((column) => [column.id, null])),
        },
      ],
    }))
  }

  const removeDecisionTableRow = (nodeId, rowId) => {
    updateDecisionTable(nodeId, (table) => ({
      ...table,
      rows: table.rows.length > 1 ? table.rows.filter((row) => row.id !== rowId) : table.rows,
    }))
    setDecisionTablePicker(null)
  }

  const addDecisionTableColumn = (nodeId) => {
    updateDecisionTable(nodeId, (table) => {
      const columnId = String.fromCharCode(65 + table.columns.length)
      return {
        columns: [...table.columns, { id: columnId, name: 'Select Variable', kind: 'result' }],
        rows: table.rows.map((row) => ({ ...row, cells: { ...row.cells, [columnId]: null } })),
      }
    })
  }

  const updateDecisionTableColumn = (nodeId, columnId, name) => {
    updateDecisionTable(nodeId, (table) => ({
      ...table,
      columns: table.columns.map((column) => column.id === columnId ? { ...column, name } : column),
    }))
  }

  const decisionTableOptions = (nodeId, category, query = '') => {
    const upstreamOptions = getUpstreamNodes(nodeId).flatMap((node) => (node.outputs || []).map((output) => ({
      category: 'upstream',
      kind: 'variable',
      label: `${node.label} · ${output}`,
      detail: `Upstream output · ${node.label}`,
    })))
    const options = [
      ...customConditionVariables.map((variable) => ({
        category: 'custom',
        kind: 'variable',
        label: variable.name,
        detail: variable.type,
      })),
      ...featureVariables.map((variable) => ({
        category: 'feature',
        kind: 'variable',
        label: `Feature · ${variable.name}`,
        detail: `${variable.component} · ${variable.type}`,
      })),
      ...upstreamOptions,
      ...decisionTableFunctions.map((item) => ({
        category: 'function',
        kind: 'function',
        label: item.name,
        detail: item.syntax,
        description: item.description,
      })),
      ...decisionTableOperators.map((operator) => ({
        category: 'operator',
        kind: 'operator',
        label: operator.label,
        detail: operator.detail,
        description: operator.group,
      })),
    ]
    const normalizedQuery = query.trim().toLowerCase()
    return options.filter((option) => (
      (normalizedQuery ? ['custom', 'feature'].includes(option.category) : category === 'all' || option.category === category)
      && (!normalizedQuery || `${option.label} ${option.detail}`.toLowerCase().includes(normalizedQuery))
    ))
  }

  const renderDecisionTableCell = (nodeId, row, column) => {
    const cell = row.cells[column.id]
    const parts = cell?.kind === 'expression' ? cell.parts : cell ? [cell] : []
    const pickerOpen = decisionTablePicker?.nodeId === nodeId
      && decisionTablePicker?.rowId === row.id
      && decisionTablePicker?.columnId === column.id
    const category = decisionTablePicker?.category || 'all'
    const pickerOptions = pickerOpen
      ? decisionTableOptions(nodeId, category, decisionTablePicker.query || '')
      : []
    return (
      <div className={`decision-table-cell ${pickerOpen ? 'active' : ''}`} key={column.id}>
        {parts.length ? (
          <div className="decision-table-expression">
            {parts.map((part, partIndex) => (
              part.kind === 'literal' ? (
                <span className="decision-table-literal-part" key={`${part.kind}-${partIndex}`}>
                  <input
                    autoFocus={!part.value}
                    aria-label={`${column.name} constant ${partIndex + 1}`}
                    value={part.value}
                    placeholder={part.valueType === 'Number' ? 'Number' : 'Text'}
                    onChange={(event) => updateDecisionTablePart(nodeId, row.id, column.id, partIndex, { value: event.target.value })}
                  />
                  <button onClick={() => removeDecisionTablePart(nodeId, row.id, column.id, partIndex)}>×</button>
                </span>
              ) : (
                <span className={`decision-table-part ${part.kind}`} key={`${part.kind}-${part.label}-${partIndex}`}>
                  <i>{part.kind === 'function' ? 'ƒ' : part.kind === 'operator' ? '±' : part.label.startsWith('Feature') ? 'F' : part.category === 'upstream' ? 'N' : 'C'}</i>
                  <b>{part.label}</b>
                  <button onClick={() => removeDecisionTablePart(nodeId, row.id, column.id, partIndex)}>×</button>
                </span>
              )
            ))}
            <button
              className="decision-table-append-part"
              aria-label="Add expression module"
              onClick={() => setDecisionTablePicker({ nodeId, rowId: row.id, columnId: column.id, category: 'all', query: '' })}
            >＋</button>
          </div>
        ) : (
          <button
            className="decision-table-empty-cell"
            onClick={() => setDecisionTablePicker({ nodeId, rowId: row.id, columnId: column.id, category: 'all', query: '' })}
          >
            <span>Enter expression</span>
          </button>
        )}
        {pickerOpen && (
          <div className="decision-table-picker" onClick={(event) => event.stopPropagation()}>
            <label>
              <span>⌕</span>
              <input
                autoFocus
                value={decisionTablePicker.query || ''}
                placeholder="Search Feature or Custom by variable name"
                onChange={(event) => setDecisionTablePicker((current) => ({ ...current, query: event.target.value }))}
              />
              <button onClick={() => setDecisionTablePicker(null)}>×</button>
            </label>
            <div className="decision-table-picker-content">
              <nav>
                {decisionTablePickerCategories.map((item) => (
                  <button
                    key={item.id}
                    className={category === item.id ? 'active' : ''}
                    onClick={() => setDecisionTablePicker((current) => ({ ...current, category: item.id }))}
                  >
                    <i className={item.id}>{item.icon}</i>
                    <span>{item.label}</span>
                    {item.badge && <em>{item.badge}</em>}
                  </button>
                ))}
              </nav>
              <section>
                <small>{decisionTablePicker.query ? 'Search Result' : category === 'all' ? 'Recent used' : decisionTablePickerCategories.find((item) => item.id === category)?.label}</small>
                {!decisionTablePicker.query && (category === 'all' || category === 'custom') && (
                  <div className="decision-table-constants">
                    {['Number', 'Text'].map((valueType) => (
                      <button
                        key={valueType}
                        onClick={() => {
                          appendDecisionTablePart(nodeId, row.id, column.id, {
                            kind: 'literal',
                            valueType,
                            value: '',
                            label: valueType,
                          })
                          setDecisionTablePicker(null)
                        }}
                      >
                        <i>#</i><span>{valueType}</span>
                      </button>
                    ))}
                  </div>
                )}
                {pickerOptions.map((option) => (
                  <button
                    className="decision-table-picker-option"
                    key={`${option.category}-${option.label}`}
                    onClick={() => {
                      appendDecisionTablePart(nodeId, row.id, column.id, option)
                      setDecisionTablePicker(null)
                    }}
                  >
                    <i className={option.category}>{option.kind === 'function' ? 'ƒ' : option.category === 'feature' ? 'F' : option.category === 'upstream' ? 'N' : option.category === 'operator' ? '±' : 'C'}</i>
                    <span><strong>{option.label}</strong><small>{option.description || option.detail}</small></span>
                  </button>
                ))}
                {!pickerOptions.length && <p>No matching modules</p>}
              </section>
            </div>
            <button
              className="decision-table-add-variable"
              onClick={() => {
                appendDecisionTablePart(nodeId, row.id, column.id, { kind: 'literal', valueType: 'Text', value: '', label: 'Custom value' })
                setDecisionTablePicker(null)
              }}
            >＋ Add Variable</button>
          </div>
        )}
      </div>
    )
  }

  const renderDecisionTableConfig = (node) => {
    const table = decisionTables[node.id] || { columns: [], rows: [] }
    return (
      <section className="decision-table-config">
        <div className="decision-table-config-title">
          <div><strong>Configure Rule</strong><span>Build conditions and results with reusable modules</span></div>
          <button
            aria-label="Expand decision table"
            onClick={() => setDecisionTableExpanded((current) => !current)}
          >{decisionTableExpanded ? '↙' : '⛶'}</button>
        </div>
        <div className="decision-table-grid" style={{ '--table-columns': table.columns.length }}>
          <div className="decision-table-corner" />
          {table.columns.map((column) => <div className="decision-table-letter" key={column.id}>{column.id}</div>)}
          <button className="decision-table-add-column" onClick={() => addDecisionTableColumn(node.id)}>＋</button>
          <div className="decision-table-row-number">1</div>
          {table.columns.map((column) => (
            <input
              key={column.id}
              className={`decision-table-column-name ${column.kind}`}
              aria-label={`Column ${column.id} name`}
              value={column.name}
              onChange={(event) => updateDecisionTableColumn(node.id, column.id, event.target.value)}
            />
          ))}
          <div />
          {table.rows.map((row, rowIndex) => (
            <div className="decision-table-data-row" key={row.id}>
              <div className="decision-table-row-number">{rowIndex + 2}</div>
              {table.columns.map((column) => renderDecisionTableCell(node.id, row, column))}
              <button
                className="decision-table-remove-row"
                disabled={table.rows.length === 1}
                aria-label={`Remove row ${rowIndex + 2}`}
                onClick={() => removeDecisionTableRow(node.id, row.id)}
              >−</button>
            </div>
          ))}
        </div>
        <button className="decision-table-add-row" onClick={() => addDecisionTableRow(node.id)}>＋ Add row</button>
      </section>
    )
  }

  const updateCrossTable = (nodeId, updater) => {
    setCrossTables((current) => ({
      ...current,
      [nodeId]: updater(current[nodeId]),
    }))
  }

  const updateCrossAxis = (nodeId, field, value) => {
    updateCrossTable(nodeId, (table) => ({ ...table, [field]: value }))
    if (field === 'outputVariable') {
      commitNodes((current) => current.map((node) => (
        node.id === nodeId ? { ...node, outputs: [value || 'cross_result'] } : node
      )))
    }
  }

  const addCrossColumn = (nodeId) => {
    updateCrossTable(nodeId, (table) => ({
      ...table,
      columns: [...table.columns, { id: `cross-column-${Date.now()}`, value: 'New value' }],
      rows: table.rows.map((row) => ({ ...row, results: [...row.results, ''] })),
    }))
  }

  const removeCrossColumn = (nodeId, columnIndex) => {
    updateCrossTable(nodeId, (table) => {
      if (table.columns.length === 1) return table
      return {
        ...table,
        columns: table.columns.filter((_, index) => index !== columnIndex),
        rows: table.rows.map((row) => ({
          ...row,
          results: row.results.filter((_, index) => index !== columnIndex),
        })),
      }
    })
  }

  const addCrossRow = (nodeId) => {
    updateCrossTable(nodeId, (table) => ({
      ...table,
      rows: [
        ...table.rows,
        {
          id: `cross-row-${Date.now()}`,
          value: 'New value',
          results: table.columns.map(() => ''),
        },
      ],
    }))
  }

  const removeCrossRow = (nodeId, rowId) => {
    updateCrossTable(nodeId, (table) => ({
      ...table,
      rows: table.rows.length === 1 ? table.rows : table.rows.filter((row) => row.id !== rowId),
    }))
  }

  const renderCrossVariableOptions = (nodeId) => (
    <>
      <option value="">Select variable</option>
      <optgroup label="Custom">
        {customConditionVariables.map((variable) => (
          <option key={`custom-${variable.name}`} value={`Custom · ${variable.name}`}>{variable.name}</option>
        ))}
      </optgroup>
      <optgroup label="Feature">
        {featureVariables.map((variable) => (
          <option key={`feature-${variable.name}`} value={`Feature · ${variable.name}`}>{variable.name}</option>
        ))}
      </optgroup>
      <optgroup label="Upstream Output">
        {getUpstreamNodes(nodeId).flatMap((upstreamNode) => (upstreamNode.outputs || []).map((output) => (
          <option key={`${upstreamNode.id}-${output}`} value={`${upstreamNode.label} · ${output}`}>
            {upstreamNode.label} · {output}
          </option>
        )))}
      </optgroup>
    </>
  )

  const renderCrossConfig = (node) => {
    const table = crossTables[node.id]
    if (!table) return null
    return (
      <section className="cross-config">
        <div className="decision-table-config-title">
          <div>
            <strong>Configure Cross</strong>
            <span>Match two dimensions and assign the intersecting result</span>
          </div>
          <button
            aria-label="Expand cross table"
            onClick={() => setDecisionTableExpanded((current) => !current)}
          >{decisionTableExpanded ? '↙' : '⛶'}</button>
        </div>

        <div className="cross-axis-config">
          <label>
            <span>Row condition</span>
            <select
              value={table.rowVariable}
              onChange={(event) => updateCrossAxis(node.id, 'rowVariable', event.target.value)}
            >
              {renderCrossVariableOptions(node.id)}
            </select>
          </label>
          <label>
            <span>Column condition</span>
            <select
              value={table.columnVariable}
              onChange={(event) => updateCrossAxis(node.id, 'columnVariable', event.target.value)}
            >
              {renderCrossVariableOptions(node.id)}
            </select>
          </label>
          <label>
            <span>Assignment variable</span>
            <input
              value={table.outputVariable}
              placeholder="Output variable"
              onChange={(event) => updateCrossAxis(node.id, 'outputVariable', event.target.value)}
            />
          </label>
        </div>

        <div
          className="cross-matrix"
          style={{ '--cross-columns': table.columns.length }}
        >
          <div className="cross-matrix-corner">
            <span>{table.columnVariable.split(' · ').at(-1) || 'Column condition'} →</span>
            <strong>↓ {table.rowVariable.split(' · ').at(-1) || 'Row condition'}</strong>
          </div>
          {table.columns.map((column, columnIndex) => (
            <div className="cross-column-condition" key={column.id}>
              <input
                aria-label={`Column condition ${columnIndex + 1}`}
                value={column.value}
                onChange={(event) => updateCrossTable(node.id, (current) => ({
                  ...current,
                  columns: current.columns.map((item, index) => (
                    index === columnIndex ? { ...item, value: event.target.value } : item
                  )),
                }))}
              />
              <button
                disabled={table.columns.length === 1}
                aria-label={`Remove column ${columnIndex + 1}`}
                onClick={() => removeCrossColumn(node.id, columnIndex)}
              >×</button>
            </div>
          ))}
          <button
            className="cross-add-column"
            aria-label="Add column condition"
            onClick={() => addCrossColumn(node.id)}
          >＋</button>

          {table.rows.map((row, rowIndex) => (
            <div className="cross-matrix-row" key={row.id}>
              <div className="cross-row-condition">
                <span>{rowIndex + 1}</span>
                <input
                  aria-label={`Row condition ${rowIndex + 1}`}
                  value={row.value}
                  onChange={(event) => updateCrossTable(node.id, (current) => ({
                    ...current,
                    rows: current.rows.map((item) => (
                      item.id === row.id ? { ...item, value: event.target.value } : item
                    )),
                  }))}
                />
              </div>
              {table.columns.map((column, columnIndex) => (
                <label className="cross-result-cell" key={`${row.id}-${column.id}`}>
                  <small>{table.outputVariable || 'Result'} =</small>
                  <input
                    aria-label={`Result for ${row.value} and ${column.value}`}
                    value={row.results[columnIndex] || ''}
                    placeholder="Value"
                    onChange={(event) => updateCrossTable(node.id, (current) => ({
                      ...current,
                      rows: current.rows.map((item) => (
                        item.id === row.id
                          ? {
                            ...item,
                            results: item.results.map((result, index) => (
                              index === columnIndex ? event.target.value : result
                            )),
                          }
                          : item
                      )),
                    }))}
                  />
                </label>
              ))}
              <button
                className="cross-remove-row"
                disabled={table.rows.length === 1}
                aria-label={`Remove row ${rowIndex + 1}`}
                onClick={() => removeCrossRow(node.id, row.id)}
              >−</button>
            </div>
          ))}
        </div>
        <button className="decision-table-add-row" onClick={() => addCrossRow(node.id)}>＋ Add row condition</button>
      </section>
    )
  }

  const renderCanvasNodeTitle = (node, selected) => (
    selected ? (
      <input
        className="canvas-node-title-input"
        aria-label={`Rename ${node.label}`}
        value={node.label}
        autoFocus
        onFocus={(event) => event.target.select()}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => updateNodeLabel(node.id, event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
      />
    ) : <strong>{node.label}</strong>
  )

  const variables = variableTab === 'feature'
    ? featureVariables
    : variableTab === 'local'
      ? localVariables
      : outputVariables

  return (
    <div
      className="decision-editor-page"
      onMouseMove={(event) => {
        movePaletteDrag(event)
        moveCanvasNodeDrag(event)
        moveConnectionDrag(event)
      }}
      onMouseUp={(event) => {
        stopPaletteDrag(event)
        stopCanvasNodeDrag()
        stopConnectionDrag(event)
      }}
    >
      <aside className="editor-left-panel">
        <div className="editor-header">
          <button className="editor-icon-button" onClick={closeEditor} aria-label="Close canvas">×</button>
          <button className="editor-panel-icon" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Fullscreen">▣</button>
          <div className="editor-title">
            <div>{decisionMeta.name}</div>
            <label className="decision-editor-version">
              <span>Decision version</span>
              <select
                aria-label="Decision version"
                value={activeDecisionVersion}
                onChange={(event) => switchDecisionVersion(event.target.value)}
              >
                {decisionMeta.versions.map((version) => <option key={version}>{version}</option>)}
              </select>
            </label>
            <small>Autosaved just now · Published only through Policy</small>
          </div>
        </div>

        <div className="node-panel">
          <label className="node-search">
            <strong>Node</strong>
            <input value={nodeSearch} aria-label="Search nodes" onChange={(event) => setNodeSearch(event.target.value)} />
            <span>⌕</span>
          </label>
          <div className="node-list">
            {[
              { id: 'basic', label: 'Basic Node' },
              { id: 'business', label: 'Business Node' },
            ].map((group) => {
              const definitions = visibleNodeTypes.filter((definition) => definition.group === group.id)
              if (!definitions.length) return null
              return (
                <section className="node-library-group" key={group.id}>
                  <small>{group.label}</small>
                  {definitions.map((definition) => (
                    <button
                      key={definition.type}
                      className="node-item"
                      onMouseDown={(event) => startPaletteDrag(event, definition)}
                      onClick={() => {
                        if (suppressPaletteClickRef.current) {
                          suppressPaletteClickRef.current = false
                          return
                        }
                        addNode(definition)
                      }}
                    >
                      <span className="node-icon" style={{ background: definition.color }}>{definition.icon}</span>
                      <span>{definition.label}</span>
                    </button>
                  ))}
                </section>
              )
            })}
          </div>
        </div>
      </aside>

      {dragPreview && (
        <div className="palette-drag-preview" style={{ left: dragPreview.x + 12, top: dragPreview.y - 21 }}>
          <span className="node-icon" style={{ background: dragPreview.definition.color }}>{dragPreview.definition.icon}</span>
          <strong>{dragPreview.definition.label}</strong>
        </div>
      )}

      <main
        className={`editor-canvas ${panStartRef.current ? 'panning' : ''} ${panelMode ? 'has-drawer' : ''} ${connectionDraft ? 'connecting' : ''}`}
        ref={canvasRef}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onMouseDown={startPan}
        onMouseMove={movePan}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
        onWheel={handleCanvasWheel}
      >
        <div className="canvas-grid" />
        {marquee && (
          <div
            className="selection-marquee"
            style={{ left: marquee.x, top: marquee.y, width: marquee.width, height: marquee.height }}
          />
        )}

        <div className="top-canvas-toolbar canvas-toolbar">
          <button onClick={undo} aria-label="Undo">↶</button>
          <button
            aria-label="Configure selected node"
            onClick={() => selectedNode && setPanelMode('config')}
            disabled={selectedNodeIds.length !== 1 || !selectedNode}
          >
            ☷
          </button>
          <button aria-label="Variables" onClick={() => setPanelMode('variables')}>◇</button>
        </div>

        <div
          className="canvas-stage"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <svg className="connection-lines" width="1400" height="760">
            {edges.map((edge) => {
              const source = nodes.find((node) => node.id === edge.from)
              const target = nodes.find((node) => node.id === edge.to)
              if (!source || !target) return null
              const {
                path: edgePath,
                endX,
                endY,
                labelX,
                labelY,
              } = connectionGeometry(source, target, edge)
              const selected = selectedEdgeId === edge.id
              return (
                <g
                  key={edge.id}
                  className={`edge-group ${selected ? 'selected' : ''}`}
                  role="button"
                  aria-label={`Connection from ${source.label} to ${target.label}`}
                  tabIndex="0"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    selectEdge(edge.id)
                  }}
                  >
                  <path className="edge-hit-area" d={edgePath} />
                  <path className="edge-line" d={edgePath} />
                  <circle cx={endX} cy={endY} r="2.5" />
                  {edge.label && (
                    <g>
                      <rect className="edge-label-bg" x={labelX - 30} y={labelY - 12} width="60" height="21" rx="7" />
                      <text className="edge-label" x={labelX} y={labelY + 2}>{edge.label}</text>
                    </g>
                  )}
                  <g
                    className="edge-delete-control"
                    transform={`translate(${labelX} ${labelY + (edge.label ? 20 : 0)})`}
                    role="button"
                    aria-label={`Delete connection from ${source.label} to ${target.label}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      deleteEdge(edge.id)
                    }}
                  >
                    <circle r="9" />
                    <text y="3">×</text>
                  </g>
                </g>
              )
            })}
            {connectionDraft && (
              <g className="draft-connection" aria-hidden="true">
                <path
                  className="edge-line"
                  d={draftConnectionPath(connectionDraft.start, connectionDraft.current)}
                />
                <circle cx={connectionDraft.current.x} cy={connectionDraft.current.y} r="4" />
              </g>
            )}
          </svg>

          {nodes.map((node) => {
            const definition = nodeTypes.find((item) => item.type === node.type)
            const selected = selectedNodeIds.includes(node.id)
            return (
              <div
                key={node.id}
                onMouseDown={(event) => startCanvasNodeDrag(event, node)}
                onClick={(event) => {
                  event.stopPropagation()
                  if (event.shiftKey) toggleSelection(node.id)
                  else {
                    selectOnly(node.id)
                    setPanelMode('config')
                  }
                  setQuickAddNodeId('')
                }}
                onDoubleClick={() => openNodePanel(node.id)}
                className={`canvas-node ${node.type} ${selected ? 'selected' : ''} ${connectionDraft?.hoverTargetId === node.id ? 'connection-target' : ''}`}
                style={{ left: node.x, top: node.y }}
              >
                {node.type !== 'start' && (
                  <button
                    type="button"
                    className="node-input-port"
                    data-node-input-port={node.id}
                    aria-label={`Connect to ${node.label}`}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                  />
                )}
                {node.type === 'start' || node.type === 'end' ? (
                  <>
                    {renderCanvasNodeTitle(node, selected)}
                    <small>{node.type === 'start' ? 'Input' : 'Return'}</small>
                    <span>{(node.outputs || node.inputs || []).join(' · ')}</span>
                  </>
                ) : (
                  <>
                    <span className="node-card-header">
                      <span className="canvas-node-icon" style={{ background: definition?.color }}>{definition?.icon}</span>
                      <span className="node-copy">
                        <small>{definition?.label}</small>
                        {renderCanvasNodeTitle(node, selected)}
                      </span>
                      <span className={`node-status ${node.status || 'warning'}`}>{node.status === 'success' ? '✓' : '!'}</span>
                      <button
                        className="node-more"
                        aria-label={`Configure ${node.label}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          openNodePanel(node.id)
                        }}
                      >
                        ···
                      </button>
                    </span>
                    {node.type === 'ifElse' ? (
                      <div className="ifelse-node-preview">
                        {conditionBranchOrder.map((branch, index) => {
                          const condition = conditionRows[branch]?.[0]
                          const branchLabel = index === 0 ? 'IF' : 'ELSE IF'
                          const portCount = conditionBranchOrder.length + 1
                          const quickAddKey = `${node.id}:${branch}`
                          return (
                            <span key={branch}>
                              <b>{branchLabel}</b>
                              <em>{formatConditionRow(condition)}</em>
                              <i />
                              <button
                                className="branch-add-button"
                                aria-label={`Add node to ${branchLabel} branch`}
                                onMouseDown={(event) => startConnectionDrag(event, node, {
                                  label: branchLabel,
                                  index,
                                  count: portCount,
                                })}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  if (suppressConnectionClickRef.current) {
                                    suppressConnectionClickRef.current = false
                                    return
                                  }
                                  selectOnly(node.id)
                                  setQuickAddNodeId((current) => current === quickAddKey ? '' : quickAddKey)
                                }}
                              >
                                ＋
                              </button>
                              {quickAddNodeId === quickAddKey && (
                                <div
                                  className="branch-quick-add-menu canvas-toolbar"
                                  onMouseDown={(event) => event.stopPropagation()}
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <div>
                                    <strong>Add to {branchLabel}</strong>
                                    <button aria-label="Close add node menu" onClick={() => setQuickAddNodeId('')}>×</button>
                                  </div>
                                  {nodeTypes.map((item) => (
                                    <button
                                      key={item.type}
                                      onClick={() => addNode(item, null, node.id, {
                                        label: branchLabel,
                                        index,
                                        count: portCount,
                                      })}
                                    >
                                      <span className="node-icon" style={{ background: item.color }}>{item.icon}</span>
                                      <span>{item.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </span>
                          )
                        })}
                        <span>
                          <b>ELSE</b><em>Fallback</em><i />
                          <button
                            className="branch-add-button"
                            aria-label="Add node to ELSE branch"
                            onMouseDown={(event) => startConnectionDrag(event, node, {
                              label: 'ELSE',
                              index: conditionBranchOrder.length,
                              count: conditionBranchOrder.length + 1,
                            })}
                            onClick={(event) => {
                              event.stopPropagation()
                              if (suppressConnectionClickRef.current) {
                                suppressConnectionClickRef.current = false
                                return
                              }
                              const quickAddKey = `${node.id}:else`
                              selectOnly(node.id)
                              setQuickAddNodeId((current) => current === quickAddKey ? '' : quickAddKey)
                            }}
                          >
                            ＋
                          </button>
                          {quickAddNodeId === `${node.id}:else` && (
                            <div
                              className="branch-quick-add-menu canvas-toolbar"
                              onMouseDown={(event) => event.stopPropagation()}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div>
                                <strong>Add to ELSE</strong>
                                <button aria-label="Close add node menu" onClick={() => setQuickAddNodeId('')}>×</button>
                              </div>
                              {nodeTypes.map((item) => (
                                <button
                                  key={item.type}
                                  onClick={() => addNode(item, null, node.id, {
                                    label: 'ELSE',
                                    index: conditionBranchOrder.length,
                                    count: conditionBranchOrder.length + 1,
                                  })}
                                >
                                  <span className="node-icon" style={{ background: item.color }}>{item.icon}</span>
                                  <span>{item.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </span>
                      </div>
                    ) : node.type === 'block' ? (
                      <div className="block-node-preview">
                        {(blockRules[node.id] || []).slice(0, 3).map((rule, index) => {
                          const condition = rule.conditions[0]
                          return (
                            <span key={rule.id}>
                              <b>{index + 1}</b>
                              <em>{formatBlockCondition(condition)}</em>
                              <strong>Reject</strong>
                            </span>
                          )
                        })}
                        {(blockRules[node.id] || []).length > 3 && <small>＋{blockRules[node.id].length - 3} more rules</small>}
                      </div>
                    ) : node.type === 'decisionTable' ? (
                      <div className="decision-table-node-preview">
                        <span><b>{decisionTables[node.id]?.columns.length || 2}</b> columns</span>
                        <i />
                        <span><b>{decisionTables[node.id]?.rows.length || 1}</b> rules</span>
                      </div>
                    ) : node.type === 'cross' ? (
                      <div className="decision-table-node-preview cross-node-preview">
                        <span><b>{crossTables[node.id]?.rows.length || 0}</b> × <b>{crossTables[node.id]?.columns.length || 0}</b> matrix</span>
                        <i />
                        <span>Output <b>{crossTables[node.id]?.outputVariable || 'cross_result'}</b></span>
                      </div>
                    ) : (
                      <>
                        <span className="node-io-row"><b>Input</b><span>{(node.inputs || ['Not configured']).join(' · ')}</span></span>
                        <span className="node-io-row"><b>Output</b><span>{(node.outputs || ['Not configured']).join(' · ')}</span></span>
                      </>
                    )}
                  </>
                )}
                {selected && <><i className="node-handle top" /><i className="node-handle bottom" /></>}
                {node.type !== 'end' && node.type !== 'ifElse' && (
                  <button
                    className="node-add-button"
                    aria-label={`Add node after ${node.label}`}
                    onMouseDown={(event) => startConnectionDrag(event, node)}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (suppressConnectionClickRef.current) {
                        suppressConnectionClickRef.current = false
                        return
                      }
                      selectOnly(node.id)
                      setQuickAddNodeId((current) => current === node.id ? '' : node.id)
                    }}
                  >
                    ＋
                  </button>
                )}
                {quickAddNodeId === node.id && (
                  <div
                    className="quick-add-menu canvas-toolbar"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div>
                      <strong>Add next node</strong>
                      <button aria-label="Close add node menu" onClick={() => setQuickAddNodeId('')}>×</button>
                    </div>
                    {nodeTypes.map((item) => (
                      <button key={item.type} onClick={() => addNode(item, null, node.id)}>
                        <span className="node-icon" style={{ background: item.color }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {selectedNodeIds.length > 0 && (
          <div className="selection-action-bar canvas-toolbar">
            <strong>Selected {selectedNodeIds.length} node{selectedNodeIds.length > 1 ? 's' : ''}</strong>
            <button onClick={duplicateSelectedNodes}>Duplicate <kbd>⌘D</kbd></button>
            <button onClick={deleteSelectedNodes} disabled={selectedNodeIds.every((nodeId) => ['start', 'end'].includes(nodeId))}>Delete</button>
            <span>Shift + drag to box select</span>
          </div>
        )}

        <div className="bottom-canvas-toolbar canvas-toolbar">
          <button onClick={organizeCanvas} data-tooltip="Organize Canvas">⌘</button>
          <button onClick={fitCanvas} data-tooltip="Fit to view">⌗</button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} data-tooltip="Actual size">1:1</button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} data-tooltip="Fullscreen">⛶</button>
          <button onClick={() => setZoom((current) => Math.max(MIN_ZOOM, current - 0.1))} aria-label="Zoom out">−</button>
          <strong>{Math.round(zoom * 100)}%</strong>
          <button onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + 0.1))} aria-label="Zoom in">＋</button>
          <button className="assistant-button" aria-label="Assistant">✦</button>
        </div>

      </main>

      {panelMode && (
        <aside className={`editor-right-drawer ${['decisionTable', 'cross', 'action'].includes(selectedNode?.type) ? 'decision-table-drawer' : ''} ${selectedNode?.type === 'cross' ? 'cross-drawer' : ''} ${selectedNode?.type === 'action' ? 'assignment-drawer' : ''} ${decisionTableExpanded && ['decisionTable', 'cross', 'action'].includes(selectedNode?.type) ? 'decision-table-expanded' : ''}`}>
          {panelMode === 'config' && selectedNode && (
            <>
              <div className="drawer-header">
                <button onClick={() => setPanelMode('')} aria-label="Close configuration">×</button>
                <h3>{selectedNode.label}</h3>
                <span>ⓘ</span>
              </div>
              <div className="drawer-body">
                {!['decisionTable', 'cross', 'action'].includes(selectedNode.type) && (
                  <div className="node-summary-card">
                    <span className="canvas-node-icon" style={{ background: nodeTypes.find((item) => item.type === selectedNode.type)?.color || '#edf0f4' }}>
                      {selectedNode.type === 'start' ? '▶' : selectedNode.type === 'end' ? '■' : nodeTypes.find((item) => item.type === selectedNode.type)?.icon}
                    </span>
                    <div>
                      <small>NODE TYPE</small>
                      <strong>{selectedNode.type === 'start' ? 'Start' : selectedNode.type === 'end' ? 'End' : nodeTypes.find((item) => item.type === selectedNode.type)?.label}</strong>
                    </div>
                  </div>
                )}
                {selectedNode.type === 'decisionTable' ? (
                  renderDecisionTableConfig(selectedNode)
                ) : selectedNode.type === 'cross' ? (
                  renderCrossConfig(selectedNode)
                ) : selectedNode.type === 'ifElse' ? (
                  <>
                    <section className="selector-config">
                      <div className="selector-config-title">
                        <div>
                          <strong>Condition branches</strong>
                          <span>Branches run by priority; the first match wins</span>
                        </div>
                        <button onClick={addConditionBranch}>＋</button>
                      </div>
                      {conditionBranchOrder.map((branch, index) => (
                        <div key={branch}>
                          {renderConditionGroup(branch, index === 0 ? 'IF' : 'ELSE IF', index + 1)}
                        </div>
                      ))}
                      <div className="selector-else-card">
                        <div><strong>ELSE</strong><span>Runs when no condition above is met</span></div>
                      </div>
                    </section>
                  </>
                ) : selectedNode.type === 'block' ? (
                  <>
                    <section className="block-config-section">
                      <div className="block-config-title">
                        <div>
                          <strong>Hard Rules</strong>
                          <span>The first matched rule rejects and stops the decision</span>
                        </div>
                        <button onClick={() => addBlockRule(selectedNode.id)}>＋ Add rule</button>
                      </div>
                      {(blockRules[selectedNode.id] || []).map((rule, ruleIndex) => (
                        <article className="block-rule-card" key={rule.id}>
                          <header>
                            <span className="block-rule-index">{ruleIndex + 1}</span>
                            <div><strong>Rule {ruleIndex + 1}</strong><small>Priority {ruleIndex + 1}</small></div>
                            <button
                              aria-label={`Delete hard rule ${ruleIndex + 1}`}
                              disabled={(blockRules[selectedNode.id] || []).length === 1}
                              onClick={() => deleteBlockRule(selectedNode.id, rule.id)}
                            >−</button>
                          </header>
                          <div className="block-rule-conditions">
                            <div className="block-condition-heading">
                              <strong>IF</strong>
                              <button className="block-add-condition" onClick={() => addBlockCondition(selectedNode.id, rule.id)}>＋ Condition</button>
                            </div>
                            {rule.conditions.map((condition, conditionIndex) => {
                              const upstreamNodes = getUpstreamNodes(selectedNode.id)
                              const variableType = getConditionVariableType(condition.variable, upstreamNodes)
                              const operators = getConditionOperators(variableType)
                              const fullExpressionMode = condition.operator === 'Expression'
                              const blockPickerOpen = conditionValuePicker?.mode === 'block'
                                && conditionValuePicker?.nodeId === selectedNode.id
                                && conditionValuePicker?.ruleId === rule.id
                                && conditionValuePicker?.conditionId === condition.id
                              return (
                                <div className={`block-condition-row ${fullExpressionMode ? 'expression-mode' : ''}`} key={condition.id}>
                                  {conditionIndex > 0 && (
                                    <select
                                      aria-label="Condition logic"
                                      value={condition.logic}
                                      onChange={(event) => updateBlockCondition(selectedNode.id, rule.id, condition.id, 'logic', event.target.value)}
                                    >
                                      <option>AND</option>
                                      <option>OR</option>
                                    </select>
                                  )}
                                  {fullExpressionMode
                                    ? (
                                      <div className="block-full-expression">
                                        <div>
                                          <strong>Expression</strong>
                                          <button onClick={() => updateBlockCondition(selectedNode.id, rule.id, condition.id, 'operator', '=')}>Use simple condition</button>
                                        </div>
                                        <input
                                          autoFocus
                                          aria-label="Full hard rule condition expression"
                                          value={condition.fullExpression || ''}
                                          placeholder="Expression"
                                          onChange={(event) => updateBlockCondition(selectedNode.id, rule.id, condition.id, 'fullExpression', event.target.value)}
                                        />
                                      </div>
                                    )
                                    : (
                                      <>
                                        <select
                                          aria-label="Hard rule condition variable"
                                          value={condition.variable}
                                          onChange={(event) => {
                                            const nextVariable = event.target.value
                                            const nextOperators = getConditionOperators(getConditionVariableType(nextVariable, upstreamNodes))
                                            updateBlockCondition(selectedNode.id, rule.id, condition.id, 'variable', nextVariable)
                                            if (!nextOperators.includes(condition.operator)) {
                                              updateBlockCondition(selectedNode.id, rule.id, condition.id, 'operator', nextOperators[0])
                                            }
                                          }}
                                        >
                                          <option value="">Select variable</option>
                                          <optgroup label="Feature">
                                            {featureVariables.map((variable) => <option key={variable.name} value={`Feature · ${variable.name}`}>{variable.name}</option>)}
                                          </optgroup>
                                          <optgroup label="Custom">
                                            {customConditionVariables.map((variable) => <option key={variable.name} value={`Custom · ${variable.name}`}>{variable.name}</option>)}
                                          </optgroup>
                                          {upstreamNodes.map((node) => (
                                            <optgroup label={node.label} key={node.id}>
                                              {(node.outputs || []).map((output) => (
                                                <option key={`${node.id}-${output}`} value={`${node.label} · ${output}`}>{node.label} · {output}</option>
                                              ))}
                                            </optgroup>
                                          ))}
                                        </select>
                                        <select
                                          aria-label="Hard rule condition operator"
                                          value={condition.operator}
                                          onChange={(event) => updateBlockCondition(selectedNode.id, rule.id, condition.id, 'operator', event.target.value)}
                                        >
                                          {operators.map((operator) => <option key={operator}>{operator}</option>)}
                                        </select>
                                        <input
                                          aria-label="Hard rule condition value"
                                          value={condition.expression}
                                          placeholder={`Enter ${variableType === 'unknown' ? 'value' : variableType}`}
                                          onChange={(event) => updateBlockCondition(selectedNode.id, rule.id, condition.id, 'expression', event.target.value)}
                                        />
                                        <button
                                          className="block-condition-source"
                                          aria-label="Choose hard rule right value source"
                                          onClick={() => setConditionValuePicker(blockPickerOpen
                                            ? null
                                            : { mode: 'block', nodeId: selectedNode.id, ruleId: rule.id, conditionId: condition.id })}
                                        >◇</button>
                                        {blockPickerOpen && (
                                          <div className="condition-reference-picker block-condition-reference-picker">
                                            <strong>Right value source</strong>
                                            <small>Feature</small>
                                            {featureVariables.map((feature) => (
                                              <button
                                                key={feature.name}
                                                onClick={() => {
                                                  updateBlockCondition(selectedNode.id, rule.id, condition.id, 'expression', `Feature · ${feature.name}`)
                                                  setConditionValuePicker(null)
                                                }}
                                              ><span>{feature.name}</span><code>{feature.type}</code></button>
                                            ))}
                                            <small>Custom</small>
                                            {customConditionVariables.map((variable) => (
                                              <button
                                                key={variable.name}
                                                onClick={() => {
                                                  updateBlockCondition(selectedNode.id, rule.id, condition.id, 'expression', `Custom · ${variable.name}`)
                                                  setConditionValuePicker(null)
                                                }}
                                              ><span>{variable.name}</span><code>{variable.type}</code></button>
                                            ))}
                                            {upstreamNodes.map((node) => (
                                              <div key={node.id}>
                                                <small>{node.label}</small>
                                                {(node.outputs || []).map((output) => (
                                                  <button
                                                    key={output}
                                                    onClick={() => {
                                                      updateBlockCondition(selectedNode.id, rule.id, condition.id, 'expression', `${node.label} · ${output}`)
                                                      setConditionValuePicker(null)
                                                    }}
                                                  ><span>{output}</span><code>auto</code></button>
                                                ))}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  <button
                                    className="block-condition-remove"
                                    aria-label="Remove hard rule condition"
                                    disabled={rule.conditions.length === 1}
                                    onClick={() => deleteBlockCondition(selectedNode.id, rule.id, condition.id)}
                                  >−</button>
                                </div>
                              )
                            })}
                          </div>
                          <div className="block-assignments">
                            <div className="block-assignment-title">
                              <strong>Action</strong>
                              <button aria-label="Add hard rule return value" onClick={() => addBlockAssignment(selectedNode.id, rule.id)}>＋</button>
                            </div>
                            {rule.assignments.map((assignment) => (
                              <div className="block-assignment-row" key={assignment.id}>
                                <input
                                  aria-label="Hard rule return variable"
                                  value={assignment.target}
                                  readOnly={assignment.target === 'reject_reason'}
                                  placeholder="Variable"
                                  onChange={(event) => updateBlockAssignment(selectedNode.id, rule.id, assignment.id, 'target', event.target.value)}
                                />
                                <select
                                  aria-label={`${assignment.target || 'New variable'} data type`}
                                  value={assignment.dataType || 'String'}
                                  disabled={assignment.target === 'reject_reason'}
                                  onChange={(event) => updateBlockAssignment(selectedNode.id, rule.id, assignment.id, 'dataType', event.target.value)}
                                >
                                  {['String', 'Integer', 'Number', 'Boolean', 'Time', 'Object', 'Array'].map((type) => (
                                    <option key={type}>{type}</option>
                                  ))}
                                </select>
                                <strong>=</strong>
                                <input
                                  aria-label={`${assignment.target || 'Hard Rules'} value`}
                                  value={assignment.value}
                                  placeholder={assignment.target === 'reject_reason' ? 'Enter reject reason' : 'Enter value'}
                                  onChange={(event) => updateBlockAssignment(selectedNode.id, rule.id, assignment.id, 'value', event.target.value)}
                                />
                                <button
                                  aria-label="Remove hard rule return value"
                                  disabled={assignment.target === 'reject_reason'}
                                  onClick={() => deleteBlockAssignment(selectedNode.id, rule.id, assignment.id)}
                                >−</button>
                              </div>
                            ))}
                          </div>
                        </article>
                      ))}
                    </section>
                    <p className="drawer-tip">When a rule matches, the workflow returns its configured values and stops immediately.</p>
                  </>
                ) : selectedNode.type === 'action' ? (
                  <>
                    <section className="assignment-rule-config">
                      <div className="decision-table-config-title">
                        <div>
                          <strong>Configure Rule</strong>
                          <span>Copy the expression in column B into the variable in column A</span>
                        </div>
                        <button
                          aria-label="Expand assignment table"
                          onClick={() => setDecisionTableExpanded((current) => !current)}
                        >{decisionTableExpanded ? '↙' : '⛶'}</button>
                      </div>
                      <div className="assignment-rule-grid">
                        <div className="assignment-grid-corner" />
                        <div className="assignment-grid-letter assignment-grid-a-letter">A</div>
                        <div className="assignment-grid-letter assignment-grid-equals-heading">=</div>
                        <div className="assignment-grid-letter assignment-grid-b-letter">B</div>
                        <button
                          className="assignment-add-row"
                          aria-label="Add assignment row"
                          onClick={() => addActionOperation(selectedNode.id)}
                        >＋</button>

                        <div className="assignment-grid-number">1</div>
                        <div className="assignment-grid-heading variable">Variable</div>
                        <div className="assignment-grid-heading data-type">Data Type</div>
                        <div className="assignment-grid-heading equals">=</div>
                        <div className="assignment-grid-heading expression">Assignment Expression</div>
                        <div />

                        {(actionOperations[selectedNode.id] || []).map((operation, rowIndex) => (
                          <div className="assignment-grid-row" key={operation.id}>
                            <div className="assignment-grid-number">{rowIndex + 2}</div>
                            <div className="assignment-grid-target">
                              <div className="action-target-wrap">
                                <div className={operation.target ? 'assignment-target-combobox selected' : 'assignment-target-combobox'}>
                                  {operation.target && (
                                    <i className={operation.target.startsWith('Feature ·') ? 'feature' : operation.target.startsWith('Custom ·') || !operation.target.includes(' · ') ? 'custom' : 'local'}>
                                      {operation.target.startsWith('Feature ·') ? 'F' : operation.target.startsWith('Custom ·') || !operation.target.includes(' · ') ? 'C' : 'N'}
                                    </i>
                                  )}
                                  <input
                                    aria-label={`Enter or select assignment variable ${rowIndex + 1}`}
                                    value={operation.target.startsWith('Custom · ')
                                      ? operation.target.slice('Custom · '.length)
                                      : operation.target}
                                    placeholder="Select or enter variable"
                                    onChange={(event) => updateActionTargetText(selectedNode.id, operation.id, event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === 'Enter') event.currentTarget.blur()
                                    }}
                                  />
                                  <button
                                    aria-label={`Select assignment variable ${rowIndex + 1}`}
                                    onClick={() => setActionTargetPicker({
                                      rowId: operation.id,
                                      category: operation.target.startsWith('Feature ·')
                                        ? 'feature'
                                        : operation.target.startsWith('Custom ·') || !operation.target.includes(' · ')
                                          ? 'custom'
                                          : 'local',
                                      query: '',
                                      newName: '',
                                    })}
                                  >⌄</button>
                                </div>
                                {['result', 'reject_code', 'reject_reason'].includes(operation.target.split(' · ').at(-1)) && <span>Official</span>}
                                {renderActionTargetPicker(selectedNode.id, operation)}
                              </div>
                            </div>
                            <div className="assignment-grid-data-type">
                              <select
                                aria-label={`Assignment data type ${rowIndex + 1}`}
                                value={operation.dataType || 'String'}
                                disabled={Boolean(operation.target) && !operation.isNewTarget}
                                title={Boolean(operation.target) && !operation.isNewTarget ? 'Data type is inherited from the selected variable' : 'Select data type for the new variable'}
                                onChange={(event) => updateActionDataType(selectedNode.id, operation.id, event.target.value)}
                              >
                                {['String', 'Integer', 'Number', 'Boolean', 'Time', 'Object', 'Array', 'File'].map((dataType) => (
                                  <option key={dataType} value={dataType}>{dataType}</option>
                                ))}
                              </select>
                              <button
                                className="assignment-default-toggle"
                                aria-label={`${expandedActionDefaults[operation.id] ? 'Hide' : 'Set'} default value for ${operation.target || `assignment ${rowIndex + 1}`}`}
                                aria-expanded={Boolean(expandedActionDefaults[operation.id])}
                                onClick={() => setExpandedActionDefaults((current) => ({
                                  ...current,
                                  [operation.id]: !current[operation.id],
                                }))}
                              >
                                ↗
                              </button>
                            </div>
                            <div className="assignment-grid-equals" aria-label="Assignment equals">=</div>
                            <div className="assignment-grid-expression">
                              {renderActionExpression(selectedNode.id, operation)}
                            </div>
                            <button
                              className="assignment-remove-row"
                              aria-label={`Remove assignment row ${rowIndex + 1}`}
                              disabled={(actionOperations[selectedNode.id] || []).length === 1}
                              onClick={() => deleteActionOperation(selectedNode.id, operation.id)}
                            >−</button>
                            {expandedActionDefaults[operation.id] && (
                              <div className="assignment-default-editor">
                                <div>
                                  <strong>Default Value</strong>
                                  <span>Used when the assignment expression returns no value.</span>
                                </div>
                                {operation.dataType === 'Boolean' ? (
                                  <select
                                    aria-label={`Default value for ${operation.target || `assignment ${rowIndex + 1}`}`}
                                    value={operation.defaultValue || ''}
                                    onChange={(event) => updateActionDefaultValue(selectedNode.id, operation.id, event.target.value)}
                                  >
                                    <option value="">No default</option>
                                    <option value="true">true</option>
                                    <option value="false">false</option>
                                  </select>
                                ) : (
                                  <input
                                    type={['Integer', 'Number'].includes(operation.dataType) ? 'number' : operation.dataType === 'Time' ? 'datetime-local' : 'text'}
                                    aria-label={`Default value for ${operation.target || `assignment ${rowIndex + 1}`}`}
                                    value={operation.defaultValue || ''}
                                    placeholder={['Object', 'Array'].includes(operation.dataType) ? 'Enter JSON default value' : 'Enter default value'}
                                    onChange={(event) => updateActionDefaultValue(selectedNode.id, operation.id, event.target.value)}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="decision-table-add-row" onClick={() => addActionOperation(selectedNode.id)}>＋ Add assignment</button>
                    </section>
                  </>
                ) : selectedNode.type === 'start' ? (
                  <>
                    <section className="start-input-section">
                      <div className="binding-section-title"><strong>Inputs</strong><button onClick={addStartInput}>＋</button></div>
                      <div className="start-input-header"><span>Variable name</span><span>Variable type</span><span>Required</span></div>
                      {(selectedNode.outputs || []).map((field, index) => (
                        <div className="start-input-row" key={index}>
                          <input value={field} onChange={(event) => renameStartInput(field, event.target.value)} />
                          <select
                            value={startInputTypes[field] || 'String'}
                            onChange={(event) => setStartInputTypes((current) => ({ ...current, [field]: event.target.value }))}
                          >
                            {variableTypeOptions.map((type) => <option key={type}>{type}</option>)}
                          </select>
                          <input type="checkbox" defaultChecked />
                          <button aria-label={`Remove ${field}`} onClick={() => deleteStartInput(field)}>−</button>
                        </div>
                      ))}
                    </section>
                    <p className="drawer-tip">Start only defines the entity keys entering this workflow. Connected downstream nodes can consume these values directly.</p>
                  </>
                ) : selectedNode.type === 'end' ? (
                  <>
                    {renderEndOutputs(selectedNode)}
                    <p className="drawer-tip">End returns the final decision outputs to the calling system.</p>
                  </>
                ) : (
                  <>
                    {renderInputBindings(selectedNode)}
                    <section className="io-config-section">
                      <div><strong>Outputs</strong><button>＋ Add output</button></div>
                      {(selectedNode.outputs || []).map((field) => (
                        <label key={field}><span>{field}</span><code>auto</code><button>•••</button></label>
                      ))}
                    </section>
                    <p className="drawer-tip">Outputs created here become Local variables for connected downstream nodes.</p>
                  </>
                )}
              </div>
            </>
          )}

          {panelMode === 'variables' && (
            <>
              <div className="drawer-header">
                <button onClick={() => setPanelMode('')} aria-label="Close variables">×</button>
                <h3>Variable management</h3>
              </div>
              <div className="variable-tabs">
                {['feature', 'local', 'output'].map((tab) => (
                  <button key={tab} className={variableTab === tab ? 'active' : ''} onClick={() => setVariableTab(tab)}>
                    {tab[0].toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="drawer-body variable-body">
                <p>{variableTab === 'feature' ? 'Reusable features resolved by component key.' : variableTab === 'local' ? 'Variables created by upstream node outputs.' : 'Values returned by the policy.'}</p>
                <table>
                  <thead><tr><th>Name</th><th>Type</th><th>{variableTab === 'feature' ? 'Binding' : 'Source'}</th></tr></thead>
                  <tbody>
                    {variables.map((variable) => (
                      <tr key={variable.name}>
                        <td>{variable.name}</td>
                        <td><code>{variable.type}</code></td>
                        <td>{variableTab === 'feature' ? `${variable.component} · ${variable.key}` : variable.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </aside>
      )}
    </div>
  )
}

export default DecisionEditorPage
