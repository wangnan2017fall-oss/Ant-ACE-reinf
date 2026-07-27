import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../shared/components/common/PageHeader'
import DataTable from '../../../shared/components/common/DataTable'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import './DataConnectorPage.css'

const columns = [
  { header: 'Connector Name', accessor: 'name', sortable: true, render: (row) => <span className="name-cell">{row.name}</span> },
  { header: 'Type', accessor: 'type', sortable: true },
  { header: 'Status', accessor: 'status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
  { header: 'Created At', accessor: 'createdAt', sortable: true },
  { header: 'Last Updated', accessor: 'lastUpdated', sortable: true },
]

const data = [
  { id: 1, name: 'antom_score_connector', type: 'Http', status: 'Active', createdAt: 'Jul 15, 2026', lastUpdated: 'Jul 15, 2026' },
  { id: 2, name: 'user_profile_mysql', type: 'MYSQL', status: 'Active', createdAt: 'Jul 14, 2026', lastUpdated: 'Jul 14, 2026' },
  { id: 3, name: 'bnpl_whitelist_rpc', type: 'RPC', status: 'Draft', createdAt: 'Jul 10, 2026', lastUpdated: 'Jul 10, 2026' },
]

function DataConnectorPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const filteredData = data.filter((row) => {
    const query = searchValue.trim().toLowerCase()
    return !query || row.name.toLowerCase().includes(query) || row.type.toLowerCase().includes(query)
  })

  return (
    <div className="data-connector-page">
      <PageHeader
        title="Data Connector"
        actionLabel="Create Data"
        onAction={() => navigate('/data-connector/create')}
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
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} detailsLink={(row) => `/data-connector/${row.id}`} />
    </div>
  )
}

export default DataConnectorPage
