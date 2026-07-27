import GenericPage from '../../shared/components/GenericPage'

function TestingPage() {
  const columns = [
    { header: 'Experiment Name', accessor: 'name', sortable: true },
    { header: 'Type', accessor: 'type', sortable: true },
    { header: 'Status', accessor: 'status', sortable: true },
    { header: 'Duration', accessor: 'duration', sortable: false },
  ]

  const data = [
    { name: 'credit_limit_test', type: 'A/B Test', status: 'Running', duration: '14 days' },
    { name: 'approval_rate_optimization', type: 'Champion/Challenger', status: 'Completed', duration: '30 days' },
  ]

  return <GenericPage title="A/B Testing" icon="⏱️" columns={columns} data={data} onCreate={() => {}} />
}

export default TestingPage
