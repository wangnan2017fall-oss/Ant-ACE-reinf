import GenericPage from '../../shared/components/GenericPage'

function TicketPage() {
  const columns = [
    { header: 'Ticket ID', accessor: 'id', sortable: true },
    { header: 'Title', accessor: 'title', sortable: false },
    { header: 'Priority', accessor: 'priority', sortable: true },
    { header: 'Status', accessor: 'status', sortable: true },
    { header: 'Assignee', accessor: 'assignee', sortable: false },
  ]

  const data = [
    { id: 'TKT-001', title: 'Data sync issue', priority: 'High', status: 'Open', assignee: 'John' },
    { id: 'TKT-002', title: 'Feature request: bulk export', priority: 'Medium', status: 'In Progress', assignee: 'Sarah' },
  ]

  return <GenericPage title="Ticket" icon="📋" columns={columns} data={data} onCreate={() => {}} />
}

export default TicketPage
