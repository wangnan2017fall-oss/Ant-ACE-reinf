import GenericPage from '../../shared/components/GenericPage'

function ApprovalCenterPage() {
  const columns = [
    { header: 'Request ID', accessor: 'id', sortable: true },
    { header: 'Policy', accessor: 'policy', sortable: true },
    { header: 'Submitted By', accessor: 'submittedBy' },
    { header: 'Submitted At', accessor: 'submittedAt', sortable: true },
    { header: 'Status', accessor: 'status', sortable: true },
  ]

  const data = [
    {
      id: 'APR-20260727-018',
      policy: 'kwai_disburse_policy',
      submittedBy: 'luke.wn',
      submittedAt: '2026-07-27 10:32',
      status: 'Pending',
    },
    {
      id: 'APR-20260726-041',
      policy: 'bnpl_credit_policy',
      submittedBy: 'gaochaoxiang.gcx',
      submittedAt: '2026-07-26 16:08',
      status: 'Approved',
    },
  ]

  return <GenericPage title="Approval" icon="✓" columns={columns} data={data} />
}

export default ApprovalCenterPage
