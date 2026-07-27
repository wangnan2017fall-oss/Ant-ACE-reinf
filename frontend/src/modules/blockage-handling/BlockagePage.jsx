import GenericPage from '../../shared/components/GenericPage'

function BlockagePage() {
  const columns = [
    { header: 'Blockage ID', accessor: 'id', sortable: true },
    { header: 'Type', accessor: 'type', sortable: true },
    { header: 'Reason', accessor: 'reason', sortable: false },
    { header: 'Status', accessor: 'status', sortable: true },
  ]

  const data = [
    { id: 'BLK-001', type: 'System', reason: 'API timeout', status: 'Resolved' },
    { id: 'BLK-002', type: 'Business', reason: 'Credit limit exceeded', status: 'Active' },
  ]

  return <GenericPage title="Blockage Handling" icon="🔒" columns={columns} data={data} onCreate={() => {}} />
}

export default BlockagePage
