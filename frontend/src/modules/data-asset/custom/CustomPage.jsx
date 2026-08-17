import { useState } from 'react'
import PageHeader from '../../../shared/components/common/PageHeader'
import DataTable from '../../../shared/components/common/DataTable'
import Avatar from '../../../shared/components/common/Avatar'
import '../feature/FeaturePage.css'

const columns = [
  { header: 'Custom Name', accessor: 'name', sortable: true, render: (row) => <span className="name-cell">{row.name}</span> },
  { header: 'Created By', accessor: 'createdBy', sortable: true, render: (row) => <div className="creator-cell"><Avatar name={row.createdBy} /><span>{row.createdBy}</span></div> },
  { header: 'Type', accessor: 'type', sortable: true },
  { header: 'Category', accessor: 'category', sortable: true },
  { header: 'Used In', accessor: 'usedIn', sortable: true },
  { header: 'Created At', accessor: 'createdAt', sortable: true },
  { header: 'Last Updated At', accessor: 'lastUpdatedAt', sortable: true },
  { header: 'Description', accessor: 'description' },
]

const customVariables = [
  { id: 1, name: 'requested_amount', createdBy: 'luke.wn', type: 'Number', category: 'Credit', usedIn: 8, createdAt: 'Jul 28, 2026', lastUpdatedAt: 'Aug 16, 2026', description: 'Requested credit amount' },
  { id: 2, name: 'application_channel', createdBy: 'gaochaoxiang.gcx', type: 'String', category: 'Application', usedIn: 12, createdAt: 'Jul 25, 2026', lastUpdatedAt: 'Aug 12, 2026', description: 'Application entry channel' },
  { id: 3, name: 'is_repeat_customer', createdBy: 'hushoufu.hsf', type: 'Boolean', category: 'Customer', usedIn: 6, createdAt: 'Jul 21, 2026', lastUpdatedAt: 'Aug 10, 2026', description: 'Repeat customer indicator' },
]

function CustomPage() {
  const [searchValue, setSearchValue] = useState('')
  const query = searchValue.trim().toLowerCase()
  const filteredData = customVariables.filter((item) => !query || item.name.toLowerCase().includes(query) || item.createdBy.toLowerCase().includes(query))

  return (
    <div className="feature-page">
      <PageHeader title="Custom" actionLabel="Create Custom" onAction={() => {}} />
      <div className="filter-bar">
        <div className="filter-actions"><button className="filter-btn">Filter<span className="filter-arrow">▾</span></button></div>
        <div className="search-box"><span className="search-icon">⌕</span><input type="text" placeholder="Search Name/Creator" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} /></div>
      </div>
      <DataTable columns={columns} data={filteredData} />
      <div className="pagination-bar"><span className="total-text">Total {filteredData.length} items</span></div>
    </div>
  )
}

export default CustomPage
