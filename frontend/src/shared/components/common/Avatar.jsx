import './Avatar.css'

function Avatar({ name }) {
  const initial = name?.charAt(0).toUpperCase() || '?'
  return (
    <div className="avatar">
      {initial}
    </div>
  )
}

export default Avatar
