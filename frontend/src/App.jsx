import { BrowserRouter, HashRouter, useLocation } from 'react-router-dom'
import AppRoutes from './router/AppRoutes'
import Sidebar from './shell/Sidebar/Sidebar'
import './App.css'

function AppShell() {
  const location = useLocation()
  const isCanvas = /^\/decision\/[^/]+\/edit$/.test(location.pathname)

  if (isCanvas) {
    return <AppRoutes />
  }

  return (
    <div className="app-container">
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="main-wrapper">
        <header className="top-header">
          <div className="top-header-right">
            <div className="user-avatar">鹿</div>
            <span className="user-name">鹿刻</span>
          </div>
        </header>
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
    </div>
  )
}

function App() {
  const Router = import.meta.env.BASE_URL === '/' ? BrowserRouter : HashRouter

  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
