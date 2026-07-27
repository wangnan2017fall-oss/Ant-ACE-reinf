import { useMemo, useState } from 'react'
import PageHeader from '../../../shared/components/common/PageHeader'
import DataTable from '../../../shared/components/common/DataTable'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import Avatar from '../../../shared/components/common/Avatar'
import './PolicyPage.css'

const columns = [
  { header: 'Name', accessor: 'name', sortable: true, render: (row) => <span className="name-cell">{row.name}</span> },
  {
    header: 'Created By',
    accessor: 'createdBy',
    render: (row) => (
      <div className="creator-cell">
        <Avatar name={row.createdBy} />
        <span>{row.createdBy}</span>
      </div>
    ),
  },
  { header: 'Category', accessor: 'category', sortable: true },
  { header: 'Status', accessor: 'status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
  { header: 'Created At', accessor: 'createdAt', sortable: true },
  { header: 'Last Modified', accessor: 'lastModified', sortable: true },
  { header: 'Description', accessor: 'description' },
]

const policies = [
  { id: 1, name: 'kwai_credit_policy', createdBy: 'gaochaoxiang.gcx', category: 'AE', status: 'Online', createdAt: 'Jul 7, 2026', lastModified: 'Jul 15, 2026', description: 'kwai credit main policy' },
  { id: 2, name: 'bnpl_credit_policy', createdBy: 'hushoufu.hsf', category: 'AE', status: 'Online', createdAt: 'Jul 3, 2026', lastModified: 'Jul 14, 2026', description: 'BNPL credit policy' },
  { id: 3, name: 'credit_pay_policy', createdBy: 'lishutian.lst', category: 'AE', status: 'Online', createdAt: 'Jun 28, 2026', lastModified: 'Jul 13, 2026', description: 'Credit Pay strategy' },
  { id: 4, name: 'test_policy_luke', createdBy: 'luke.wn', category: 'AE', status: 'Draft', createdAt: 'Jul 15, 2026', lastModified: 'Jul 15, 2026', description: 'Policy test' },
  { id: 5, name: 'bnpl_disburse_policy', createdBy: 'gaochaoxiang.gcx', category: 'AE', status: 'Online', createdAt: 'May 9, 2026', lastModified: 'Jul 12, 2026', description: 'Real-time disbursement' },
]

function PolicyPage() {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [draft, setDraft] = useState({ name: '', description: '', category: 'AE' })
  const [records, setRecords] = useState(policies)
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return records
    return records.filter((row) => row.name.toLowerCase().includes(query) || row.createdBy.toLowerCase().includes(query))
  }, [records, search])

  return (
    <div className="policy-page">
      <PageHeader title="Policy" actionLabel="Create Policy" onAction={() => setShowCreate(true)} />

      <div className="filter-bar">
        <button className="filter-btn">Filter <span className="filter-arrow">▾</span></button>
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            value={search}
            placeholder="Search Name/Creator"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} detailsLink={(row) => `/policy/${row.id}`} />

      {showCreate && (
        <div className="modal-backdrop" onMouseDown={() => setShowCreate(false)}>
          <div className="create-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="create-modal-header">
              <h2>Create Policy</h2>
              <button onClick={() => setShowCreate(false)} aria-label="Close">×</button>
            </div>
            <label>
              <span>Policy Name <b>*</b></span>
              <input
                autoFocus
                placeholder="Enter policy name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                placeholder="Enter description"
                value={draft.description}
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

export default PolicyPage
