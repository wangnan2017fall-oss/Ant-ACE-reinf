import GenericPage from '../../shared/components/GenericPage'

function CaseTrackerPage() {
  const columns = [
    { header: 'Case ID', accessor: 'caseId', sortable: true },
    { header: 'Decision', accessor: 'decision', sortable: false },
    { header: 'Status', accessor: 'status', sortable: true },
    { header: 'Created At', accessor: 'createdAt', sortable: true },
  ]

  const data = [
    { caseId: 'CASE-2026-001', decision: 'credit_decision_v1', status: 'Completed', createdAt: 'Jul 15, 2026' },
    { caseId: 'CASE-2026-002', decision: 'approval_policy_v2', status: 'In Review', createdAt: 'Jul 14, 2026' },
  ]

  return <GenericPage title="Case Tracker" icon="📄" columns={columns} data={data} onCreate={() => {}} />
}

export default CaseTrackerPage
