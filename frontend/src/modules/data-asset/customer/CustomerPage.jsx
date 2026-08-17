import { useState } from 'react'
import PageHeader from '../../../shared/components/common/PageHeader'
import DataTable from '../../../shared/components/common/DataTable'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import Avatar from '../../../shared/components/common/Avatar'
import '../feature/FeaturePage.css'
import './CustomerPage.css'

const tabs = [
  { key: 'realtime', label: 'Real-time', icon: '⏱️' },
  { key: 'batch', label: 'Batch', icon: '📦' },
]

const columns = [
  { header: 'Custom Variable', accessor: 'name', sortable: true, render: (row) => <span className="name-cell">{row.name}</span> },
  { header: 'Created By', accessor: 'createdBy', sortable: true, render: (row) => <div className="creator-cell"><Avatar name={row.createdBy} /><span>{row.createdBy}</span></div> },
  { header: 'Data Type', accessor: 'type', sortable: true },
  { header: 'Source', accessor: 'source', sortable: true },
  { header: 'Category', accessor: 'category', sortable: true },
  { header: 'Used In', accessor: 'usedIn', sortable: true },
  { header: 'Status', accessor: 'status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
  { header: 'Last Updated At', accessor: 'lastUpdatedAt', sortable: true },
  { header: 'Description', accessor: 'description' },
]

const customerVariables = [
  { id: 1, name: 'user_id', createdBy: 'luke.wn', type: 'String', source: 'Policy Request', category: 'Customer Identity', usedIn: 18, status: 'Active', lastUpdatedAt: 'Aug 16, 2026', description: 'Unique customer identifier passed by the upstream system' },
  { id: 2, name: 'shop_id', createdBy: 'gaochaoxiang.gcx', type: 'String', source: 'Policy Request', category: 'Merchant Identity', usedIn: 9, status: 'Active', lastUpdatedAt: 'Aug 15, 2026', description: 'Shop identifier passed by the upstream system' },
  { id: 3, name: 'requested_amount', createdBy: 'luke.wn', type: 'Number', source: 'Application Request', category: 'Credit', usedIn: 8, status: 'Active', lastUpdatedAt: 'Aug 14, 2026', description: 'Credit amount requested in the current application' },
  { id: 4, name: 'application_channel', createdBy: 'hushoufu.hsf', type: 'String', source: 'Application Request', category: 'Application', usedIn: 12, status: 'Active', lastUpdatedAt: 'Aug 12, 2026', description: 'Application entry channel supplied by upstream' },
  { id: 5, name: 'is_repeat_customer', createdBy: 'hushoufu.hsf', type: 'Boolean', source: 'Customer Context', category: 'Customer', usedIn: 6, status: 'Active', lastUpdatedAt: 'Aug 10, 2026', description: 'Repeat-customer indicator supplied by upstream' },
]

function CustomerPage() {
  const [activeTab, setActiveTab] = useState('realtime')
  const [searchValue, setSearchValue] = useState('')
  const [records, setRecords] = useState(customerVariables)
  const [showCreate, setShowCreate] = useState(false)
  const [draft, setDraft] = useState({ name: '', type: 'String', defaultValue: '', description: '' })
  const [formError, setFormError] = useState('')
  const query = searchValue.trim().toLowerCase()
  const filteredData = records.filter((item) => !query || Object.values(item).some((value) => String(value).toLowerCase().includes(query)))

  const closeCreate = () => {
    setShowCreate(false)
    setFormError('')
  }

  const createCustomVariable = () => {
    const name = draft.name.trim()
    if (!name) {
      setFormError('Custom Name is required.')
      return
    }
    if (records.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setFormError('A Custom variable with this name already exists.')
      return
    }
    setRecords((current) => [{
      id: Math.max(...current.map((item) => item.id), 0) + 1,
      name,
      createdBy: 'luke.wn',
      type: draft.type,
      defaultValue: draft.defaultValue,
      source: 'Custom',
      category: 'Custom',
      usedIn: 0,
      status: 'Active',
      lastUpdatedAt: 'Aug 17, 2026',
      description: draft.description.trim(),
    }, ...current])
    setDraft({ name: '', type: 'String', defaultValue: '', description: '' })
    closeCreate()
  }

  return (
    <div className="feature-page">
      <PageHeader title="Custom" tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} actionLabel="Create Custom Variable" onAction={() => setShowCreate(true)} />
      <div className="filter-bar">
        <div className="filter-actions">
          <button className="filter-btn">Filter<span className="filter-arrow">▾</span></button>
          <button className="bulk-action-btn">Bulk Action<span className="filter-arrow">▾</span></button>
        </div>
        <div className="search-box"><span className="search-icon">⌕</span><input type="text" placeholder="Search Name/Creator" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} /></div>
      </div>
      <DataTable columns={columns} data={filteredData} />
      <div className="pagination-bar"><span className="total-text">Total {filteredData.length} items</span><div className="pagination-controls"><select className="page-size-select"><option>10 / page</option><option>20 / page</option></select><button className="page-btn" disabled>{'<'}</button><span className="page-number active">1</span><button className="page-btn" disabled>{'>'}</button></div></div>

      {showCreate && (
        <div className="custom-modal-backdrop" role="presentation" onMouseDown={closeCreate}>
          <section className="custom-create-modal" role="dialog" aria-modal="true" aria-labelledby="create-custom-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="custom-modal-header">
              <div><h2 id="create-custom-title">Create Custom Variable</h2><p>Define a reusable variable supplied by an upstream workflow.</p></div>
              <button onClick={closeCreate} aria-label="Close create Custom variable dialog">×</button>
            </div>
            <div className="custom-modal-form">
              <label>
                <span>Custom Name <b>*</b></span>
                <input autoFocus value={draft.name} placeholder="Enter Custom name" onChange={(event) => { setDraft({ ...draft, name: event.target.value }); setFormError('') }} />
              </label>
              <label>
                <span>Data Type <b>*</b></span>
                <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value, defaultValue: '' })}>
                  <option>String</option><option>Number</option><option>Integer</option><option>Boolean</option><option>Time</option><option>Object</option><option>Array</option>
                </select>
              </label>
              <label>
                <span>Default Value</span>
                {draft.type === 'Boolean' ? (
                  <select value={draft.defaultValue} onChange={(event) => setDraft({ ...draft, defaultValue: event.target.value })}><option value="">No default value</option><option value="true">true</option><option value="false">false</option></select>
                ) : (
                  <input value={draft.defaultValue} placeholder="Enter default value (optional)" onChange={(event) => setDraft({ ...draft, defaultValue: event.target.value })} />
                )}
                <small>Used when the upstream workflow does not provide a value.</small>
              </label>
              <label>
                <span>Description</span>
                <textarea value={draft.description} placeholder="Describe the purpose of this variable" onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
              </label>
              {formError && <p className="custom-form-error" role="alert">{formError}</p>}
            </div>
            <div className="custom-modal-actions"><button className="secondary" onClick={closeCreate}>Cancel</button><button className="primary" onClick={createCustomVariable}>Create</button></div>
          </section>
        </div>
      )}
    </div>
  )
}

export default CustomerPage
