import GenericPage from '../../shared/components/GenericPage'

const columns = [
  { header: 'View Name', accessor: 'name', sortable: true },
  { header: 'Type', accessor: 'type', sortable: true },
  { header: 'Status', accessor: 'status', sortable: true },
  { header: 'Last Updated', accessor: 'updatedAt', sortable: true },
]

const data = [
  { name: 'user_base_view', type: 'Offline', status: 'Active', updatedAt: 'Jul 14, 2026' },
  { name: 'credit_score_view', type: 'Real-time', status: 'Active', updatedAt: 'Jul 13, 2026' },
  { name: 'transaction_history', type: 'Offline', status: 'Inactive', updatedAt: 'Jul 10, 2026' },
]

function DataPage() {
  return (
    <GenericPage
      title="Data"
      icon="🗄️"
      columns={columns}
      data={data}
      onCreate={() => console.log('Create Data View')}
    />
  )
}

export default DataPage
