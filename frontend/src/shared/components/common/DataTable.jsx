import { Link } from 'react-router-dom'
import './DataTable.css'

function DataTable({ columns, data, emptyText = 'No data found', detailsLink }) {
  return (
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
                  {detailsLink ? (
                    <Link to={detailsLink(row, index)} className="details-link">
                      Details
                    </Link>
                  ) : (
                    <a href="#" className="details-link">Details</a>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="empty-state">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
