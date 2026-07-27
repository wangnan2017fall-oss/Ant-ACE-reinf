import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './DecisionEditorPage.css'

const nodeTypes = [
  { type: 'ifElse', label: 'If-Else', icon: '≷', color: '#d8c6ff' },
  { type: 'action', label: 'Action', icon: 'ƒ', color: '#ffd2c5' },
]

const initialNodes = [
  { id: 'start', type: 'start', label: 'Start', x: 70, y: 155, outputs: ['user_id', 'shop_id'] },
  { id: 'ifElse1', type: 'ifElse', label: 'Eligibility Check', x: 300, y: 215, status: 'success', inputs: ['monthly_income', 'credit_report_score'], outputs: ['approved', 'customer_tier'] },
  { id: 'action1', type: 'action', label: 'Calculate Credit Terms', x: 650, y: 335, status: 'warning', inputs: ['monthly_income', 'customer_tier'], outputs: ['credit_limit', 'interest_rate', 'loan_term'] },
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

function nodeSize(node) {
  return node.type === 'start' || node.type === 'end'
    ? { width: 132, height: 84 }
    : node.type === 'ifElse'
      ? { width: 270, height: 154 }
    : { width: 270, height: 122 }
}

function connectionPath(source, target, edge = {}) {
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
    const middleX = (startX + endX) / 2
    return `M ${startX} ${sourceCenterY} L ${middleX} ${sourceCenterY} L ${middleX} ${targetCenterY} L ${endX} ${targetCenterY}`
  }

  const startY = targetCenterY >= sourceCenterY ? source.y + sourceSize.height : source.y
  const endY = targetCenterY >= sourceCenterY ? target.y : target.y + targetSize.height
  const middleY = (startY + endY) / 2
  return `M ${sourceCenterX} ${startY} L ${sourceCenterX} ${middleY} L ${targetCenterX} ${middleY} L ${targetCenterX} ${endY}`
}

function DecisionEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const historyRef = useRef([])
  const panStartRef = useRef(null)
  const paletteDropHandledRef = useRef(false)
  const paletteDragRef = useRef(null)
  const suppressPaletteClickRef = useRef(false)
  const canvasNodeDragRef = useRef(null)
  const marqueeStartRef = useRef(null)
  const clipboardRef = useRef([])
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
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
  const [showDebug, setShowDebug] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dragPreview, setDragPreview] = useState(null)
  const [inputBindings, setInputBindings] = useState(initialInputBindings)
  const [bindingPicker, setBindingPicker] = useState(null)
  const [conditionValuePicker, setConditionValuePicker] = useState(null)
  const [startInputTypes, setStartInputTypes] = useState({
    user_id: 'String',
    shop_id: 'String',
  })
  const [conditionRows, setConditionRows] = useState({
    true: [{ id: 1, variable: 'Feature · credit_report_score', operator: '>=', valueType: 'Number', expression: '700' }],
  })
  const [conditionBranchOrder, setConditionBranchOrder] = useState(['true'])
  const [branchAssignments, setBranchAssignments] = useState({
    true: [
      { id: 'if-approved', name: 'approved', value: 'true' },
      { id: 'if-tier', name: 'customer_tier', value: '"A"' },
    ],
    else: [
      { id: 'fallback-approved', name: 'approved', value: 'false' },
      { id: 'fallback-tier', name: 'customer_tier', value: '"C"' },
    ],
  })
  const [actionOperations, setActionOperations] = useState({
    action1: [
      { id: 'op-limit', target: 'credit_limit', operator: '=', value: 'income * 5' },
      { id: 'op-rate', target: 'interest_rate', operator: '=', value: '0.12' },
      { id: 'op-term', target: 'loan_term', operator: '=', value: '12' },
    ],
  })

  const visibleNodeTypes = useMemo(() => {
    const query = nodeSearch.trim().toLowerCase()
    return nodeTypes.filter((item) => !query || item.label.toLowerCase().includes(query))
  }, [nodeSearch])

  const selectedNode = nodes.find((node) => node.id === selectedNodeId)

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
      x: Math.max(20, x),
      y: Math.max(20, y),
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
      setActionOperations((current) => ({ ...current, [node.id]: [] }))
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
        ? { ...node, x: Math.max(10, activeDrag.originX + deltaX), y: Math.max(10, activeDrag.originY + deltaY) }
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
      [branch]: [...current[branch], { id: Date.now(), variable: '', operator: '=', valueType: 'Number', expression: '' }],
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
      [branch]: current[branch].filter((row) => row.id !== rowId),
    }))
  }

  const addConditionBranch = () => {
    const branchId = `branch-${Date.now()}`
    setConditionRows((current) => ({
      ...current,
      [branchId]: [{ id: Date.now(), variable: '', operator: '=', valueType: 'Number', expression: '' }],
    }))
    setBranchAssignments((current) => ({ ...current, [branchId]: [] }))
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
    setBranchAssignments((current) => {
      const next = { ...current }
      delete next[branch]
      return next
    })
  }

  const addBranchAssignment = (branch) => {
    setBranchAssignments((current) => ({
      ...current,
      [branch]: [...current[branch], { id: `${branch}-${Date.now()}`, name: '', value: '' }],
    }))
  }

  const updateBranchAssignment = (branch, rowId, field, value) => {
    setBranchAssignments((current) => ({
      ...current,
      [branch]: current[branch].map((row) => row.id === rowId ? { ...row, [field]: value } : row),
    }))
  }

  const deleteBranchAssignment = (branch, rowId) => {
    setBranchAssignments((current) => ({
      ...current,
      [branch]: current[branch].filter((row) => row.id !== rowId),
    }))
  }

  const addActionOperation = (nodeId) => {
    setActionOperations((current) => ({
      ...current,
      [nodeId]: [
        ...(current[nodeId] || []),
        { id: `operation-${Date.now()}`, target: '', operator: '=', value: '' },
      ],
    }))
  }

  const updateActionOperation = (nodeId, rowId, field, value) => {
    setActionOperations((current) => ({
      ...current,
      [nodeId]: (current[nodeId] || []).map((row) => (
        row.id === rowId ? { ...row, [field]: value } : row
      )),
    }))
  }

  const deleteActionOperation = (nodeId, rowId) => {
    setActionOperations((current) => ({
      ...current,
      [nodeId]: (current[nodeId] || []).filter((row) => row.id !== rowId),
    }))
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

  const renderBranchAssignments = (branch) => (
    <div className="branch-assignment-block">
      <div>
        <strong>Branch actions</strong>
        <button onClick={() => addBranchAssignment(branch)}>＋</button>
      </div>
      {(branchAssignments[branch] || []).map((assignment) => (
        <div className="branch-assignment-row" key={assignment.id}>
          <input
            value={assignment.name}
            placeholder="Variable"
            onChange={(event) => updateBranchAssignment(branch, assignment.id, 'name', event.target.value)}
          />
          <span>=</span>
          <input
            value={assignment.value}
            placeholder="Value or expression"
            onChange={(event) => updateBranchAssignment(branch, assignment.id, 'value', event.target.value)}
          />
          <button onClick={() => deleteBranchAssignment(branch, assignment.id)}>−</button>
        </div>
      ))}
    </div>
  )

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
      {conditionRows[branch].map((row) => (
        <div className="condition-row" key={row.id}>
          <select className="condition-variable" value={row.variable} onChange={(event) => updateCondition(branch, row.id, 'variable', event.target.value)}>
            <option value="">Select Variable</option>
            <optgroup label="Feature">
              {featureVariables.map((feature) => <option key={feature.name}>{`Feature · ${feature.name}`}</option>)}
            </optgroup>
            {upstreamNodes.map((node) => (
              <optgroup label={node.label} key={node.id}>
                {(node.outputs || []).map((output) => <option key={output}>{`${node.label} · ${output}`}</option>)}
              </optgroup>
            ))}
          </select>
          <div className="condition-comparison">
            <select value={row.operator || '='} onChange={(event) => updateCondition(branch, row.id, 'operator', event.target.value)}>
              <option>=</option>
              <option>&gt;</option>
              <option>&gt;=</option>
              <option>&lt;</option>
              <option>&lt;=</option>
              <option>!=</option>
              <option>contains</option>
              <option>not contains</option>
            </select>
            <select value={row.valueType || 'Number'} onChange={(event) => updateCondition(branch, row.id, 'valueType', event.target.value)}>
              {variableTypeOptions.map((type) => <option key={type}>{type}</option>)}
            </select>
            <input
              value={row.expression}
              placeholder="Enter or reference a value"
              onChange={(event) => updateCondition(branch, row.id, 'expression', event.target.value)}
            />
            <button
              title="Reference variable"
              onClick={() => setConditionValuePicker((current) => (
                current?.branch === branch && current?.rowId === row.id ? null : { branch, rowId: row.id }
              ))}
            >
              ◇
            </button>
            {conditionValuePicker?.branch === branch && conditionValuePicker?.rowId === row.id && (
              <div className="condition-reference-picker">
                <strong>Reference variable</strong>
                <small>Feature</small>
                {featureVariables.map((feature) => (
                  <button
                    key={feature.name}
                    onClick={() => {
                      updateCondition(branch, row.id, 'expression', `Feature · ${feature.name}`)
                      setConditionValuePicker(null)
                    }}
                  >
                    <span>{feature.name}</span><code>{feature.type}</code>
                  </button>
                ))}
                {upstreamNodes.map((node) => (
                  <div key={node.id}>
                    <small>{node.label}</small>
                    {(node.outputs || []).map((output) => (
                      <button
                        key={output}
                        onClick={() => {
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
          <button aria-label={`Delete ${branch} condition`} onClick={() => deleteCondition(branch, row.id)}>−</button>
        </div>
      ))}
      <button className="condition-add" onClick={() => addCondition(branch)}>＋ Add condition (AND)</button>
      {renderBranchAssignments(branch)}
    </div>
  )}

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
      }}
      onMouseUp={(event) => {
        stopPaletteDrag(event)
        stopCanvasNodeDrag()
      }}
    >
      <aside className="editor-left-panel">
        <div className="editor-header">
          <button className="editor-icon-button" onClick={() => navigate(`/decision/${id}`)} aria-label="Close canvas">×</button>
          <button className="editor-panel-icon" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Fullscreen">▣</button>
          <div className="editor-title">
            <div>test_luke1</div>
            <small>1.0.0 · Autosaved just now</small>
            <span>Unsubmitted changes</span>
          </div>
        </div>

        <div className="node-panel">
          <label className="node-search">
            <strong>Node</strong>
            <input value={nodeSearch} aria-label="Search nodes" onChange={(event) => setNodeSearch(event.target.value)} />
            <span>⌕</span>
          </label>
          <div className="node-list">
            {visibleNodeTypes.map((definition) => (
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
        className={`editor-canvas ${panStartRef.current ? 'panning' : ''} ${panelMode ? 'has-drawer' : ''}`}
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
          <button
            className="submit-button"
            onClick={() => {
              setSubmitted(true)
              window.setTimeout(() => setSubmitted(false), 2200)
            }}
          >
            Submit
          </button>
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
              const targetSize = nodeSize(target)
              const labelX = (source.x + target.x + targetSize.width) / 2
              const labelY = (source.y + target.y) / 2 + 12
              const edgePath = connectionPath(source, target, edge)
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
                  <circle cx={target.x + targetSize.width / 2} cy={target.y} r="2.5" />
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
                className={`canvas-node ${node.type} ${selected ? 'selected' : ''}`}
                style={{ left: node.x, top: node.y }}
              >
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
                              <em>{condition?.variable ? `${condition.variable.replace('Feature · ', '')} ${condition.operator} ${condition.expression}` : 'Not configured'}</em>
                              <i />
                              <button
                                className="branch-add-button"
                                aria-label={`Add node to ${branchLabel} branch`}
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                  event.stopPropagation()
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
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation()
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
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation()
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

        <button className="debug-button canvas-toolbar" onClick={() => setShowDebug((current) => !current)}>
          {showDebug ? 'Close Debug' : 'Debug'}
        </button>

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

        {showDebug && (
          <div className="debug-console">
            <strong>Debug result</strong>
            <div><span>✓</span> Input validated</div>
            <div><span>✓</span> Assignment Rule 1 · 12 ms</div>
            <div><span>✓</span> Decision Table 1 · 8 ms</div>
            <div><span>✓</span> Workflow completed successfully</div>
          </div>
        )}

        {submitted && <div className="submit-toast">✓ Decision submitted for approval</div>}
      </main>

      {panelMode && (
        <aside className="editor-right-drawer">
          {panelMode === 'config' && selectedNode && (
            <>
              <div className="drawer-header">
                <button onClick={() => setPanelMode('')} aria-label="Close configuration">×</button>
                <h3>{selectedNode.label}</h3>
                <span>ⓘ</span>
                <button className="drawer-debug" onClick={() => setShowDebug(true)}>Debug</button>
              </div>
              <div className="drawer-body">
                <div className="node-summary-card">
                  <span className="canvas-node-icon" style={{ background: nodeTypes.find((item) => item.type === selectedNode.type)?.color || '#edf0f4' }}>
                    {selectedNode.type === 'start' ? '▶' : selectedNode.type === 'end' ? '■' : nodeTypes.find((item) => item.type === selectedNode.type)?.icon}
                  </span>
                  <div>
                    <small>NODE TYPE</small>
                    <strong>{selectedNode.type === 'start' ? 'Start' : selectedNode.type === 'end' ? 'End' : nodeTypes.find((item) => item.type === selectedNode.type)?.label}</strong>
                  </div>
                </div>
                {selectedNode.type === 'ifElse' ? (
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
                        {renderBranchAssignments('else')}
                      </div>
                    </section>
                  </>
                ) : selectedNode.type === 'action' ? (
                  <>
                    {renderInputBindings(selectedNode)}
                    <section className="action-operation-section">
                      <div className="action-section-title">
                        <div><strong>Operations</strong><span>Assign values or calculate with + − × ÷</span></div>
                        <button onClick={() => addActionOperation(selectedNode.id)}>＋</button>
                      </div>
                      <div className="action-operation-header"><span>Variable</span><span>Operation</span><span>Value / expression</span></div>
                      {(actionOperations[selectedNode.id] || []).map((operation) => (
                        <div className="action-operation-row" key={operation.id}>
                          <input
                            value={operation.target}
                            placeholder="Variable"
                            onChange={(event) => updateActionOperation(selectedNode.id, operation.id, 'target', event.target.value)}
                          />
                          <select
                            value={operation.operator}
                            onChange={(event) => updateActionOperation(selectedNode.id, operation.id, 'operator', event.target.value)}
                          >
                            <option value="=">Assign =</option>
                            <option value="+">Add +</option>
                            <option value="-">Subtract −</option>
                            <option value="*">Multiply ×</option>
                            <option value="/">Divide ÷</option>
                          </select>
                          <input
                            value={operation.value}
                            placeholder="Value or expression"
                            onChange={(event) => updateActionOperation(selectedNode.id, operation.id, 'value', event.target.value)}
                          />
                          <button onClick={() => deleteActionOperation(selectedNode.id, operation.id)}>−</button>
                        </div>
                      ))}
                    </section>
                    <section className="action-output-section">
                      <div className="action-section-title">
                        <div><strong>Outputs</strong><span>Create values available to downstream nodes</span></div>
                        <button onClick={() => addNodeOutput(selectedNode.id)}>＋</button>
                      </div>
                      {(selectedNode.outputs || []).map((output, index) => (
                        <div className="action-output-row" key={index}>
                          <input value={output} onChange={(event) => renameNodeOutput(selectedNode.id, output, event.target.value)} />
                          <select defaultValue="Number">
                            {variableTypeOptions.map((type) => <option key={type}>{type}</option>)}
                          </select>
                          <button onClick={() => deleteNodeOutput(selectedNode.id, output)}>−</button>
                        </div>
                      ))}
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
                    {renderInputBindings(selectedNode)}
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
