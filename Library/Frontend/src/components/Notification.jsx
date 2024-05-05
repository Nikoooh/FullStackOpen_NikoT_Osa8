
const Notification = ({ notification }) => {

  if (!notification.show) return null

  return (
    <div style={{marginTop: '15px', border: '1px solid black', borderRadius: '4px', padding: '15px'}}>
      <h3>
        Book {notification.notification.data.bookAdded.title} by {notification.notification.data.bookAdded.author.name} added
      </h3>
    </div>
  )
}

export default Notification