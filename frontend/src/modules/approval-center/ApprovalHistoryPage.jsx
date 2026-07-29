import GenericPage from '../../shared/components/GenericPage'

function ApprovalHistoryPage() {
  const columns = [
    { header: 'Request ID', accessor: 'id', sortable: true },
    { header: 'Policy', accessor: 'policy', sortable: true },
    { header: 'Reviewed By', accessor: 'reviewedBy' },
    { header: 'Reviewed At', accessor: 'reviewedAt', sortable: true },
    { header: 'Result', accessor: 'result', sortable: true },
  ]

  const data = [
    { id: 'APR-20260726-041', policy: 'bnpl_credit_policy', reviewedBy: 'luke.wn', reviewedAt: '2026-07-26 18:21', result: 'Approved' },
    { id: 'APR-20260725-063', policy: 'kwai_disburse_policy', reviewedBy: 'risk.admin', reviewedAt: '2026-07-25 15:42', result: 'Rejected' },
  ]

  return <GenericPage title="My Task" icon="✓" columns={columns} data={data} />
}

export default ApprovalHistoryPage
