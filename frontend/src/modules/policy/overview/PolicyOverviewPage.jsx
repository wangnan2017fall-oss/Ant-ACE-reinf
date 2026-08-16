import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import './PolicyOverviewPage.css'

const policyProfiles = {
  '1': {
    name: 'kwai_disburse_policy',
    description: 'Kwai real-time credit eligibility, limit and pricing policy.',
    category: 'AE',
    createdBy: 'gaochaoxiang.gcx',
    createdAt: '2025-10-20 14:13:47',
    code: 'code_1760940824695',
  },
  '2': {
    name: 'bnpl_credit_policy',
    description: 'BNPL credit policy for customer eligibility, limit and pricing.',
    category: 'AE',
    createdBy: 'hushoufu.hsf',
    createdAt: '2025-10-20 14:13:47',
    code: 'code_1760940824702',
  },
}

const initialVersions = [
  { version: 'V1.0.3', updatedBy: 'gaochaoxiang.gcx', updatedAt: '2026-08-11 14:22', status: 'Active', online: true, traffic: 70 },
  { version: 'V1.0.2', updatedBy: 'gaochaoxiang.gcx', updatedAt: '2026-08-10 11:22', status: 'Active', online: true, traffic: 30 },
  { version: 'V1.0.1', updatedBy: 'luke.wn', updatedAt: '2026-08-04 15:06', status: 'Offline', online: false, traffic: 0 },
]

function PolicyOverviewPage() {
  const { id = '1' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(['details', 'traffic', 'monitoring'].includes(requestedTab) ? requestedTab : 'details')
  const [versionView, setVersionView] = useState('online')
  const [versions, setVersions] = useState(initialVersions)
  const [showMore, setShowMore] = useState(true)
  const [trafficEnvironment, setTrafficEnvironment] = useState('production')
  const profile = policyProfiles[id] || policyProfiles['1']

  const visibleVersions = useMemo(() => versions.filter((item) => versionView === 'online' ? item.online : !item.online), [versionView, versions])

  const changeTab = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'details' ? {} : { tab }, { replace: true })
  }

  const createVersion = () => {
    const nextPatch = Math.max(...versions.map((item) => Number(item.version.split('.').at(-1)))) + 1
    setVersions((current) => [{ version: `V1.0.${nextPatch}`, updatedBy: 'luke.wn', updatedAt: '2026-08-16 10:30', status: 'Draft', online: true, traffic: 0 }, ...current])
    setVersionView('online')
  }

  return (
    <div className="policy-overview-page">
      <div className="policy-overview-breadcrumb"><Link to="/policy">Policy</Link><span>/</span><span>{profile.name}</span></div>

      <div className="policy-overview-title">
        <Link to="/policy" aria-label="Back to Policy">‹</Link>
        <h1>{profile.name}</h1>
        <span className="policy-overview-status"><i />Online</span>
        <button onClick={createVersion}>＋ New Version</button>
      </div>

      <div className="policy-overview-tabs" role="tablist">
        {['details', 'traffic', 'monitoring'].map((tab) => (
          <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'active' : ''} onClick={() => changeTab(tab)}>
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <>
          <section className="policy-overview-card basic-information-card">
            <h2>Basic Information</h2>
            <dl>
              <div><dt>Name</dt><dd>{profile.name}<button aria-label="Edit policy name">⌕</button></dd></div>
              <div><dt>Description</dt><dd>{profile.description}<button aria-label="Edit description">⌕</button></dd></div>
              <div><dt>Category</dt><dd><select defaultValue={profile.category}><option>AE</option><option>BR</option><option>MX</option></select></dd></div>
              {showMore && <>
                <div><dt>Created By</dt><dd>{profile.createdBy}</dd></div>
                <div><dt>Created At</dt><dd>{profile.createdAt}</dd></div>
                <div><dt>Code</dt><dd>{profile.code}</dd></div>
              </>}
            </dl>
            <button className="policy-information-toggle" onClick={() => setShowMore((current) => !current)}>{showMore ? 'Collapse⌃' : 'Show All⌄'}</button>
          </section>

          <section className="policy-overview-card versions-card">
            <h2>Versions</h2>
            <div className="version-state-tabs" role="tablist">
              <button role="tab" aria-selected={versionView === 'online'} className={versionView === 'online' ? 'active' : ''} onClick={() => setVersionView('online')}>Online</button>
              <button role="tab" aria-selected={versionView === 'offline'} className={versionView === 'offline' ? 'active' : ''} onClick={() => setVersionView('offline')}>Offline</button>
            </div>
            <div className="policy-version-table-wrap">
              <table className="policy-version-table">
                <thead><tr><th>Version No.</th><th>Last Updated By</th><th>Last Updated At</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {visibleVersions.map((item) => (
                    <tr key={item.version}>
                      <td><span className="policy-version-pill">{item.version}</span></td>
                      <td><span className="policy-version-user"><i>{item.updatedBy[0].toUpperCase()}</i>{item.updatedBy}</span></td>
                      <td>{item.updatedAt}</td>
                      <td><span className={`policy-version-status ${item.status.toLowerCase()}`}><i />{item.status}</span></td>
                      <td>
                        <div className="policy-version-actions">
                          <Link to={`/policy/${id}/canvas?version=${item.version}`}>Details</Link>
                          <button onClick={() => changeTab('traffic')}>Adjust Traffic</button>
                          <button className="more" aria-label={`More actions for ${item.version}`}>•••</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === 'traffic' && (
        <section className="policy-overview-card overview-traffic-card">
          <div className="overview-traffic-heading"><h2>Traffic Configuration</h2><div><button>Adjustment History</button><button>Adjust Production Traffic</button></div></div>
          <div className="overview-environment-tabs">
            <button className={trafficEnvironment === 'production' ? 'active' : ''} onClick={() => setTrafficEnvironment('production')}>Production</button>
            <button className={trafficEnvironment === 'pre-production' ? 'active' : ''} onClick={() => setTrafficEnvironment('pre-production')}>Pre-Production</button>
          </div>
          <table className="overview-traffic-table">
            <thead><tr><th>Version No.</th><th>Traffic Configuration</th><th>Fallback Traffic</th></tr></thead>
            <tbody>
              {(trafficEnvironment === 'production' ? versions.filter((item) => item.online) : versions.slice(0, 2)).map((item, index) => (
                <tr key={item.version}><td><span>{item.version}</span></td><td>{trafficEnvironment === 'production' ? item.traffic : index === 0 ? 100 : 0}%</td><td>{trafficEnvironment === 'pre-production' && index === 0 ? versions[1]?.version : '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'monitoring' && (
        <section className="policy-overview-card overview-monitor-card">
          <div className="overview-monitor-toolbar"><button>Today</button><span>08 / 16 / 2026&nbsp;&nbsp;–&nbsp;&nbsp;08 / 16 / 2026</span></div>
          <div className="overview-metrics"><div><span>Success Rate</span><strong>—</strong></div><div className="blue"><span>Total Requests</span><strong>0</strong></div><div className="green"><span>Success</span><strong>0</strong></div><div className="violet"><span>Failed</span><strong>0</strong></div></div>
          <div className="overview-monitor-empty"><h3>Request Overview</h3><span>⌕</span><strong>No data available</strong><p>Requests for the selected period will appear here.</p></div>
        </section>
      )}
    </div>
  )
}

export default PolicyOverviewPage
