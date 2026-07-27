import GenericPage from '../../shared/components/GenericPage'

function AIDecisionPage() {
  const columns = [
    { header: 'Model Name', accessor: 'name', sortable: true },
    { header: 'Type', accessor: 'type', sortable: true },
    { header: 'Accuracy', accessor: 'accuracy', sortable: true },
    { header: 'Status', accessor: 'status', sortable: true },
  ]

  const data = [
    { name: 'credit_risk_model_v2', type: 'XGBoost', accuracy: '94.5%', status: 'Online' },
    { name: 'fraud_detection_nn', type: 'Neural Network', accuracy: '96.2%', status: 'Training' },
  ]

  return <GenericPage title="AI Decision" icon="🤖" columns={columns} data={data} onCreate={() => {}} />
}

export default AIDecisionPage
