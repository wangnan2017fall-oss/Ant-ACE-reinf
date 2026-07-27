import './GenericPage.css'

function GenericPage({ title, icon, columns, data, onCreate }) {
  return (
    <div className="generic-page">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">{icon} {title}</h1>
        </div>
        {onCreate && (
          <button className="create-btn" onClick={onCreate}>
            Create {title}
          </button>
        )}
      </div>

      <div className="filter-bar">
        <button className="filter-btn">
          Filter
          <span className="filter-arrow">▾</span>
        </button>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>
                  {col.header}
                  {col.sortable && <span className="sort-icon">↕</span>}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  <td>
                    <a href="#" className="action-link">View</a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="empty-state">
                  No {title.toLowerCase()} found. Click "Create {title}" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GenericPage