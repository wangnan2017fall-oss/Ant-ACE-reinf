import GenericPage from '../../shared/components/GenericPage'

function CreditAdjustmentPage() {
  const columns = [
    { header: 'Adjustment ID', accessor: 'id', sortable: true },
    { header: 'User', accessor: 'user', sortable: false },
    { header: 'Amount', accessor: 'amount', sortable: true },
    { header: 'Status', accessor: 'status', sortable: true },
  ]

  const data = [
    { id: 'ADJ-001', user: 'user_123', amount: '+5000', status: 'Approved' },
    { id: 'ADJ-002', user: 'user_456', amount: '-2000', status: 'Pending' },
  ]

  return <GenericPage title="Credit Adjustment" icon="🔺" columns={columns} data={data} onCreate={() => {}} />
}

export default CreditAdjustmentPage
