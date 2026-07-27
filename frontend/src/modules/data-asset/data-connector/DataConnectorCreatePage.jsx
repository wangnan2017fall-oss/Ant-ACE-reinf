import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './DataConnectorCreatePage.css'

const dataSourceTypes = ['Http', 'PMML', 'Marketplace', 'File', 'RPC', 'MYSQL']
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE']
const queryOptions = ['feature_info', 'user_profile', 'transaction_history']

function DataConnectorCreatePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    description: '',
    dataSourceType: 'Http',
    httpMethod: 'GET',
    url: '',
    requestHeaders: '',
    query: 'feature_info',
    script: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Please enter.'
    else if (/^\d/.test(form.name)) newErrors.name = 'View name cannot begin with a number.'
    if (!form.description.trim()) newErrors.description = 'Please enter.'
    if (form.dataSourceType === 'Http' && !form.url.trim()) newErrors.url = 'Please enter.'
    if (form.dataSourceType === 'MYSQL' && !form.script.trim()) newErrors.script = 'Please enter.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validate()) return
    if (step < 2) {
      setStep((current) => current + 1)
      return
    }
    navigate('/data-connector')
  }

  return (
    <div className="data-connector-create-page">
      <div className="breadcrumb">
        <Link to="/data-connector">Data Connector</Link>
        <span>/</span>
        <span>Create Data</span>
      </div>

      <div className="create-header">
        <div className="create-header-left">
          <button className="back-btn" onClick={() => navigate('/data-connector')}>‹</button>
          <h1 className="create-title">Create Data</h1>
        </div>
        <button className="create-btn" onClick={handleNext}>{step === 2 ? 'Submit' : 'Next'}</button>
      </div>

      <div className="stepper">
        {['Configuration', 'Verification', 'Approval'].map((label, index) => (
          <div key={label} className={`step ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}>
            <div className="step-dot">{index < step ? '✓' : index + 1}</div>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="form-card">
          <h3 className="form-section-title">Basic Information</h3>

          <div className="form-group">
            <label className="form-label">Name <span className="required">*</span></label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description <span className="required">*</span></label>
            <input
              type="text"
              className={`form-input ${errors.description ? 'error' : ''}`}
              placeholder="Enter"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Data Source Type <span className="required">*</span></label>
            <div className="radio-group">
              {dataSourceTypes.map((type) => (
                <label key={type} className="radio-item">
                  <input
                    type="radio"
                    name="dataSourceType"
                    value={type}
                    checked={form.dataSourceType === type}
                    onChange={() => handleChange('dataSourceType', type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {form.dataSourceType === 'Http' && (
            <>
              <div className="form-group">
                <label className="form-label">HTTP Method <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={form.httpMethod}
                  onChange={(e) => handleChange('httpMethod', e.target.value)}
                >
                  {httpMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">URL <span className="required">*</span></label>
                <input
                  type="text"
                  className={`form-input ${errors.url ? 'error' : ''}`}
                  placeholder="Enter"
                  value={form.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                />
                {errors.url && <span className="error-text">{errors.url}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Request Headers</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter"
                  value={form.requestHeaders}
                  onChange={(e) => handleChange('requestHeaders', e.target.value)}
                />
              </div>
            </>
          )}

          {form.dataSourceType === 'MYSQL' && (
            <>
              <div className="form-group">
                <label className="form-label">Query the data source <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={form.query}
                  onChange={(e) => handleChange('query', e.target.value)}
                >
                  {queryOptions.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Script(sql) <span className="required">*</span></label>
                <textarea
                  className={`form-textarea ${errors.script ? 'error' : ''}`}
                  rows="8"
                  value={form.script}
                  onChange={(e) => handleChange('script', e.target.value)}
                />
                {errors.script && <span className="error-text">{errors.script}</span>}
              </div>
            </>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="form-card">
          <h3 className="form-section-title">Verification</h3>
          <div className="verification-summary">
            <div><span>Name</span><strong>{form.name}</strong></div>
            <div><span>Data Source Type</span><strong>{form.dataSourceType}</strong></div>
            <div>
              <span>Connection</span>
              <strong>{form.dataSourceType === 'Http' ? `${form.httpMethod} ${form.url}` : form.query}</strong>
            </div>
          </div>
          <div className="verification-success">✓ Configuration is valid and ready for approval.</div>
        </div>
      )}

      {step === 2 && (
        <div className="form-card">
          <h3 className="form-section-title">Approval</h3>
          <p className="approval-copy">Submit this data connector for approval. It will remain in Draft status until the review is completed.</p>
          <label className="approval-check">
            <input type="checkbox" defaultChecked />
            <span>I confirm that the connection information has been verified.</span>
          </label>
        </div>
      )}
    </div>
  )
}

export default DataConnectorCreatePage
