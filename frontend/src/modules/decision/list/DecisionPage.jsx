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
  { id: 1, name: 'white_roster_decision', createdBy: 'gongzhi.gong', category: 'AE', status: 'Online', createdAt: 'Oct 26, 2025', lastModified: 'Aug 4, 2026', description: '白名单测试用户' },
  { id: 2, name: 'bnpl_credit_active_user_decision', createdBy: 'hushoufu.hsf', category: 'AE', status: 'Online', createdAt: 'Jul 17, 2026', lastModified: 'Aug 4, 2026', description: 'bnpl年活用户策略包' },
  { id: 3, name: 'app_credit_new_customer_decision', createdBy: 'gaochaoxiang.gcx', category: 'AE', status: 'Draft', createdAt: 'Jul 28, 2026', lastModified: 'Aug 4, 2026', description: 'batter app新客decision' },
  { id: 4, name: 'bnpl_credit_not_active_user_decision', createdBy: 'hushoufu.hsf', category: 'AE', status: 'Online', createdAt: 'Jul 19, 2026', lastModified: 'Aug 3, 2026', description: 'bnpl非年活用户策略包' },
  { id: 5, name: 'bnpl_credit_new_ae_user_decision', createdBy: 'hushoufu.hsf', category: 'AE', status: 'Online', createdAt: 'Jul 19, 2026', lastModified: 'Aug 3, 2026', description: 'new to AE用户策略包' },
  { id: 6, name: 'overdue_temp_limit_disposal_decision', createdBy: 'xuyangzhang.zxy', category: 'AE', status: 'Online', createdAt: 'Jul 15, 2026', lastModified: 'Jul 31, 2026', description: '逾期用户临额失效决策' },
  { id: 7, name: 'app_credit_white_list_decision', createdBy: 'gaochaoxiang.gcx', category: 'AE', status: 'Online', createdAt: 'Jul 16, 2026', lastModified: 'Jul 31, 2026', description: 'batter_app授信全通(全部通过)decision' },
  { id: 8, name: 'kwai_credit_decision', createdBy: 'gaochaoxiang.gcx', category: 'AE', status: 'Online', createdAt: 'Jul 7, 2026', lastModified: 'Jul 30, 2026', description: 'kwai授信decision' },
  { id: 9, name: 'app_credit_param_decision', createdBy: 'gaochaoxiang.gcx', category: 'AE', status: 'Draft', createdAt: 'Jul 29, 2026', lastModified: 'Jul 29, 2026', description: 'batter app 解析入参decision' },
]

function DecisionPage({ embedded = false }) {
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
    <div className={`decision-page ${embedded ? 'embedded' : ''}`}>
      {embedded ? (
        <div className="embedded-decision-toolbar">
          <div className="tabs" role="tablist" aria-label="Decision type">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <button className="create-btn" onClick={() => setShowCreate(true)}>Create Decision</button>
        </div>
      ) : (
        <PageHeader
          title="Decision"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          actionLabel="Create Decision"
          onAction={() => setShowCreate(true)}
        />
      )}

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
