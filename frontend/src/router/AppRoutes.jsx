import { Route, Routes } from 'react-router-dom'
import AIDecisionPage from '../modules/ai-decision/AIDecisionPage'
import TestingPage from '../modules/ab-testing/TestingPage'
import BlockagePage from '../modules/blockage-handling/BlockagePage'
import CaseTrackerPage from '../modules/case-tracker/CaseTrackerPage'
import CreditAdjustmentPage from '../modules/credit-adjustment/CreditAdjustmentPage'
import DataConnectorCreatePage from '../modules/data-asset/data-connector/DataConnectorCreatePage'
import DataConnectorDetailPage from '../modules/data-asset/data-connector/DataConnectorDetailPage'
import DataConnectorPage from '../modules/data-asset/data-connector/DataConnectorPage'
import DataSourceDetailPage from '../modules/data-asset/data-source/DataSourceDetailPage'
import DataSourcePage from '../modules/data-asset/data-source/DataSourcePage'
import FeatureDetailPage from '../modules/data-asset/feature/FeatureDetailPage'
import FeaturePage from '../modules/data-asset/feature/FeaturePage'
import CustomerPage from '../modules/data-asset/customer/CustomerPage'
import DecisionEditorPage from '../modules/decision/canvas/DecisionEditorPage'
import DecisionDetailPage from '../modules/decision/detail/DecisionDetailPage'
import DecisionPage from '../modules/decision/list/DecisionPage'
import PolicyOverviewPage from '../modules/policy/overview/PolicyOverviewPage'
import PolicyCanvasEditorPage from '../modules/policy/canvas/PolicyCanvasEditorPage'
import PolicyPage from '../modules/policy/list/PolicyPage'
import TicketPage from '../modules/ticket/TicketPage'
import ApprovalCenterPage from '../modules/approval-center/ApprovalCenterPage'
import ApprovalHistoryPage from '../modules/approval-center/ApprovalHistoryPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DecisionPage />} />
      <Route path="/decision" element={<DecisionPage />} />
      <Route path="/decision/:id" element={<DecisionDetailPage />} />
      <Route path="/decision/:id/edit" element={<DecisionEditorPage />} />
      <Route path="/data" element={<DataSourcePage />} />
      <Route path="/data-source" element={<DataSourcePage />} />
      <Route path="/data-source/:id" element={<DataSourceDetailPage />} />
      <Route path="/data-connector" element={<DataConnectorPage />} />
      <Route path="/data-connector/create" element={<DataConnectorCreatePage />} />
      <Route path="/data-connector/:id" element={<DataConnectorDetailPage />} />
      <Route path="/feature" element={<FeaturePage />} />
      <Route path="/feature/:id" element={<FeatureDetailPage />} />
      <Route path="/customer" element={<CustomerPage />} />
      <Route path="/custom" element={<CustomerPage />} />
      <Route path="/policy" element={<PolicyPage />} />
      <Route path="/policy/:id/edit" element={<PolicyCanvasEditorPage />} />
      <Route path="/policy/:id/canvas" element={<PolicyCanvasEditorPage />} />
      <Route path="/policy/:id" element={<PolicyOverviewPage />} />
      <Route path="/testing" element={<TestingPage />} />
      <Route path="/case-tracker" element={<CaseTrackerPage />} />
      <Route path="/credit-adjustment" element={<CreditAdjustmentPage />} />
      <Route path="/blockage" element={<BlockagePage />} />
      <Route path="/ai-decision" element={<AIDecisionPage />} />
      <Route path="/ticket" element={<TicketPage />} />
      <Route path="/approval" element={<ApprovalCenterPage />} />
      <Route path="/approval/progress" element={<ApprovalCenterPage />} />
      <Route path="/approval/my-task" element={<ApprovalHistoryPage />} />
    </Routes>
  )
}

export default AppRoutes
