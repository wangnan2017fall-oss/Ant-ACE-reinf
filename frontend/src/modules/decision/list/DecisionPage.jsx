import { useState } from 'react'
import PageHeader from '../../../shared/components/common/PageHeader'
import DataTable from '../../../shared/components/common/DataTable'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import Avatar from '../../../shared/components/common/Avatar'
import './DecisionPage.css'

const tabs = [
  { key: 'realtime', label: 'Real-time', icon: '⏱️' },
  { key: 'batch', label: 'Batch', icon: '📦' },
]

const columns = [
  { header: 'Name', accessor: 'name', sortable: true, render: (row) => <span className="name-cell">{row.name}</span> },
  { header: 'Created By', accessor: 'createdBy', sortable: true, render: (row) => (
    <div className="creator-cell">
      <Avatar name={row.createdBy} />
      <span>{row.createdBy}</span>
    </div>
  )},
  { header: 'Category', accessor: 'category', sortable: true },
  { header: 'Status', accessor: 'status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
  { header: 'Created At', accessor: 'createdAt', sortable: true },
  { header: 'Last Modified', accessor: 'lastModified', sortable: true },
  { header: 'Description', accessor: 'description' },
]

const data = [
  { id: 1, name: 'test_luke1', createdBy: 'luke.wn', category: 'AE', status: 'Draft', createdAt: 'Jul 15, 2026', lastModified: 'Jul 15, 2026', description: '1' },
  { id: 2, name: 'overdue_temp_limit_dispos...', createdBy: 'xuyangzhang.zxy', category: 'AE', status: 'Draft', createdAt: 'Jul 15, 2026', lastModified: 'Jul 15, 2026', description: '逾期用户临额失效决策' },
  { id: 3, name: 'test', createdBy: 'luke.wn', category: 'AE', status: 'Draft', createdAt: 'Jul 15, 2026', lastModified: 'Jul 15, 2026', description: '' },
  { id: 4, name: 'kwai_credit_decision', createdBy: 'gaochaoxiang.gcx', category: 'AE', status: 'Online', createdAt: 'Jul 7, 2026', lastModified: 'Jul 15, 2026', description: 'kwai授信decision' },
  { id: 5, name: 'kwai_credit_param_decisoi...', createdBy: 'gaochaoxiang.gcx', category: 'AE', status: 'Online', createdAt: 'Jul 9, 2026', lastModified: 'Jul 14, 2026', description: 'kwai授信decision入参处理' },
  { id: 6, name: 'bnpl_expenditure_intercept...', createdBy: 'lishutian.lst', category: 'AE', status: 'Online', createdAt: 'Jul 3, 2026', lastModified: 'Jul 14, 2026', description: '实时支用拦截' },
  { id: 7, name: 'bnpl_credit_bvs_rule_decisi...', createdBy: 'gaochaoxiang.gcx', category: 'AE', status: 'Online', createdAt: 'Dec 8, 2025', lastModified: 'Jul 13, 2026', description: 'bnpl授信-bvs数据源规则decision' },
  { id: 8, name: 'bnpl_non_active_user_deci...', createdBy: 'hushoufu.hsf', category: 'AE', status: 'Online', createdAt: 'Jul 3, 2026', lastModified: 'Jul 13, 2026', description: '获取非年活标签decision' },
  { id: 9, name: 'bnpl_default_param_decisi...', createdBy: 'hushoufu.hsf', category: 'AE', status: 'Online', createdAt: 'Jul 3, 2026', lastModified: 'Jul 13, 2026', description: '一口价默认参数赋值decision' },
]

function DecisionPage() {
  const [activeTab, setActiveTab] = useState('realtime')
  const [searchValue, setSearchValue] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [draft, setDraft] = useState({ name: '', description: '', category: 'AE' })
  const [records, setRecords] = useState(data)

  const filteredData = records.filter((row) => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return true
    return row.name.toLowerCase().includes(query) || row.createdBy.toLowerCase().includes(query)
  })

  return (
    <div className="decision-page">
      <PageHeader
        title="Decision"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionLabel="Create Decision"
        onAction={() => setShowCreate(true)}
      />

      <div className="filter-bar">
        <button className="filter-btn">
          Filter
          <span className="filter-arrow">▾</span>
        </button>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search Name/Creator"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} detailsLink={(row) => `/decision/${row.id}`} />

      <div className="pagination-bar">
        <span className="total-text">Total {filteredData.length} items</span>
        <div className="pagination-controls">
          <select className="page-size-select">
            <option>10 / page</option>
            <option>20 / page</option>
            <option>50 / page</option>
          </select>
          <button className="page-btn" disabled>{'<'}</button>
          <span className="page-number active">1</span>
          <button className="page-btn" disabled>{'>'}</button>
        </div>
      </div>

      {showCreate && (
        <div className="modal-backdrop" onMouseDown={() => setShowCreate(false)}>
          <div className="create-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="create-modal-header">
              <h2>Create Decision</h2>
              <button onClick={() => setShowCreate(false)} aria-label="Close">×</button>
            </div>
            <label>
              <span>Name <b>*</b></span>
              <input
                autoFocus
                value={draft.name}
                placeholder="Enter decision name"
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                value={draft.description}
                placeholder="Enter description"
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </label>
            <label>
              <span>Category <b>*</b></span>
              <select
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              >
                <option>AE</option>
                <option>BR</option>
                <option>MX</option>
              </select>
            </label>
            <div className="create-modal-actions">
              <button className="secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button
                className="primary"
                disabled={!draft.name.trim()}
                onClick={() => {
                  setRecords((current) => [
                    {
                      id: Math.max(...current.map((item) => item.id), 0) + 1,
                      name: draft.name.trim(),
                      createdBy: 'luke.wn',
                      category: draft.category,
                      status: 'Draft',
                      createdAt: 'Jul 23, 2026',
                      lastModified: 'Jul 23, 2026',
                      description: draft.description.trim(),
                    },
                    ...current,
                  ])
                  setDraft({ name: '', description: '', category: 'AE' })
                  setShowCreate(false)
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DecisionPage
