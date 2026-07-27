import { useState } from 'react'
import PageHeader from '../../../shared/components/common/PageHeader'
import DataTable from '../../../shared/components/common/DataTable'
import StatusBadge from '../../../shared/components/common/StatusBadge'
import Avatar from '../../../shared/components/common/Avatar'
import './FeaturePage.css'

const tabs = [
  { key: 'realtime', label: 'Real-time', icon: '⏱️' },
  { key: 'batch', label: 'Batch', icon: '📦' },
]

const columns = [
  { header: 'Feature Name', accessor: 'name', sortable: true, render: (row) => <span className="name-cell">{row.name}</span> },
  { header: 'Created By', accessor: 'createdBy', sortable: true, render: (row) => (
    <div className="creator-cell">
      <Avatar name={row.createdBy} />
      <span>{row.createdBy}</span>
    </div>
  )},
  { header: 'Creation Type', accessor: 'creationType', sortable: true },
  { header: 'Category', accessor: 'category', sortable: true },
  { header: 'Processing Time', accessor: 'processingTime', sortable: true },
  { header: 'Used In', accessor: 'usedIn', sortable: true },
  { header: 'Status', accessor: 'status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
  { header: 'Created At', accessor: 'createdAt', sortable: true },
  { header: 'Last Updated At', accessor: 'lastUpdatedAt', sortable: true },
  { header: 'Description', accessor: 'description' },
]

const data = [
  { id: 1, name: 'utcToday', createdBy: 'xuyangzhang.zxy', creationType: 'Data Connector', category: 'Common', processingTime: '< 1 ms', usedIn: 18, status: 'Active', createdAt: 'Jul 15, 2026', lastUpdatedAt: 'Jul 15, 2026', description: '当前零时区时间，格...' },
  { id: 2, name: 'tempLimitStartDate...', createdBy: 'xuyangzhang.zxy', creationType: 'Data Connector', category: 'Credit Limit', processingTime: '8 ms', usedIn: 5, status: 'Active', createdAt: 'Jul 15, 2026', lastUpdatedAt: 'Jul 15, 2026', description: '临时额度生效时间，...' },
  { id: 3, name: 'kwai_scr_cc_total...', createdBy: 'gaochaoxiang.gcx', creationType: 'Custom', category: 'Credit Report', processingTime: '3 ms', usedIn: 12, status: 'Active', createdAt: 'Jul 15, 2026', lastUpdatedAt: 'Jul 15, 2026', description: 'SCR信用卡总额度（BR...' },
  { id: 4, name: 'kwai_scr_current...', createdBy: 'gaochaoxiang.gcx', creationType: 'Custom', category: 'Credit Report', processingTime: '3 ms', usedIn: 9, status: 'Active', createdAt: 'Jul 14, 2026', lastUpdatedAt: 'Jul 14, 2026', description: 'SCR当前逾期金额（BR...' },
  { id: 5, name: 'kwai_scr_total_ou...', createdBy: 'gaochaoxiang.gcx', creationType: 'Custom', category: 'Credit Report', processingTime: '4 ms', usedIn: 7, status: 'Active', createdAt: 'Jul 14, 2026', lastUpdatedAt: 'Jul 14, 2026', description: 'SCR当前在贷金额（BR...' },
  { id: 6, name: 'creditPayTestGrou...', createdBy: 'hushoufu.hsf', creationType: 'Data Connector', category: 'Experiment', processingTime: '12 ms', usedIn: 3, status: 'Active', createdAt: 'Jul 10, 2026', lastUpdatedAt: 'Jul 10, 2026', description: 'Credit Pay 测试组标记' },
  { id: 7, name: 'preSetPaymentInst...', createdBy: 'hushoufu.hsf', creationType: 'Data Connector', category: 'Pricing', processingTime: '10 ms', usedIn: 6, status: 'Active', createdAt: 'Jul 10, 2026', lastUpdatedAt: 'Jul 10, 2026', description: '预设CreditPay分期月...' },
  { id: 8, name: 'preSetCreditPayMo...', createdBy: 'hushoufu.hsf', creationType: 'Data Connector', category: 'Pricing', processingTime: '9 ms', usedIn: 4, status: 'Active', createdAt: 'Jul 10, 2026', lastUpdatedAt: 'Jul 10, 2026', description: '预设CreditPay月利率' },
  { id: 9, name: 'preSetPaymentInst...', createdBy: 'hushoufu.hsf', creationType: 'Data Connector', category: 'Pricing', processingTime: '11 ms', usedIn: 4, status: 'Active', createdAt: 'Jul 10, 2026', lastUpdatedAt: 'Jul 10, 2026', description: '预设CreditPay分期期...' },
]

function FeaturePage() {
  const [activeTab, setActiveTab] = useState('realtime')
  const [searchValue, setSearchValue] = useState('')
  const filteredData = data.filter((row) => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return true
    return row.name.toLowerCase().includes(query) || row.createdBy.toLowerCase().includes(query)
  })

  return (
    <div className="feature-page">
      <PageHeader
        title="Feature"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionLabel="Create Feature"
        onAction={() => console.log('Create Feature')}
      />

      <div className="filter-bar">
        <div className="filter-actions">
          <button className="filter-btn">
            Filter
            <span className="filter-arrow">▾</span>
          </button>
          <button className="bulk-action-btn">
            Bulk Action
            <span className="filter-arrow">▾</span>
          </button>
        </div>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search Name/Creator"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <span className="search-tag">
              {searchValue}
              <button onClick={() => setSearchValue('')}>×</button>
            </span>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} detailsLink={(row) => `/feature/${row.id}`} />

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
    </div>
  )
}

export default FeaturePage
