import { useState } from 'react'
import PageHeader from '../../../shared/components/common/PageHeader'
import DataTable from '../../../shared/components/common/DataTable'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import Avatar from '../../../shared/components/common/Avatar'
import '../feature/FeaturePage.css'

const tabs = [
  { key: 'realtime', label: 'Real-time', icon: '⏱️' },
  { key: 'batch', label: 'Batch', icon: '📦' },
]

const columns = [
  { header: 'Customer Variable', accessor: 'name', sortable: true, render: (row) => <span className="name-cell">{row.name}</span> },
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
  const query = searchValue.trim().toLowerCase()
  const filteredData = customerVariables.filter((item) => !query || Object.values(item).some((value) => String(value).toLowerCase().includes(query)))

  return (
    <div className="feature-page">
      <PageHeader title="Customer" tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} actionLabel="Create Customer Variable" onAction={() => {}} />
      <div className="filter-bar">
        <div className="filter-actions">
          <button className="filter-btn">Filter<span className="filter-arrow">▾</span></button>
          <button className="bulk-action-btn">Bulk Action<span className="filter-arrow">▾</span></button>
        </div>
        <div className="search-box"><span className="search-icon">⌕</span><input type="text" placeholder="Search Name/Creator" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} /></div>
      </div>
      <DataTable columns={columns} data={filteredData} />
      <div className="pagination-bar"><span className="total-text">Total {filteredData.length} items</span><div className="pagination-controls"><select className="page-size-select"><option>10 / page</option><option>20 / page</option></select><button className="page-btn" disabled>{'<'}</button><span className="page-number active">1</span><button className="page-btn" disabled>{'>'}</button></div></div>
    </div>
  )
}

export default CustomerPage
