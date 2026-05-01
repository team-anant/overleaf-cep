import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import RegisterForm from './register-form'
import OLRow from '@/shared/components/ol/ol-row'
import OLCol from '@/shared/components/ol/ol-col'
import OLCard from '@/shared/components/ol/ol-card'
import OLButton from '@/shared/components/ol/ol-button'
import Notification from '@/shared/components/notification'
import { getJSON, deleteJSON } from '@/infrastructure/fetch-json'

function UserActivateRegister() {
  const [emails, setEmails] = useState([])
  const [failedEmails, setFailedEmails] = useState([])
  const [registerError, setRegisterError] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState(null)

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const data = await getJSON('/admin/register/users')
      setUsers(data.users)
    } catch {
      setUsersError('Failed to load users.')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  function handleRegistrationSuccess(value) {
    setRegistrationSuccess(value)
    if (value) fetchUsers()
  }

  return (
    <OLRow>
      <OLCol>
        <OLCard>
          <div className="page-header">
            <h1>Register new users</h1>
          </div>
          <RegisterForm
            setRegistrationSuccess={handleRegistrationSuccess}
            setEmails={setEmails}
            setRegisterError={setRegisterError}
            setFailedEmails={setFailedEmails}
          />
          {registerError ? (
            <UserActivateError failedEmails={failedEmails} />
          ) : null}
          {registrationSuccess ? (
            <>
              <SuccessfulRegistrationMessage />
              <hr />
              <DisplayEmailsList emails={emails} />
            </>
          ) : null}
        </OLCard>

        <OLCard className="mt-4">
          <div className="page-header">
            <h2>Existing Users</h2>
          </div>
          {usersError && (
            <Notification type="error" content={usersError} className="mb-3" />
          )}
          <UsersTable
            users={users}
            loading={usersLoading}
            onUserDeleted={fetchUsers}
          />
        </OLCard>
      </OLCol>
    </OLRow>
  )
}

function UsersTable({ users, loading, onUserDeleted }) {
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  async function handleDelete(userId, email) {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return
    setDeletingId(userId)
    setDeleteError(null)
    try {
      await deleteJSON(`/admin/register/user/${userId}`)
      onUserDeleted()
    } catch {
      setDeleteError(`Failed to delete ${email}.`)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <p className="text-muted">Loading users...</p>
  }

  if (users.length === 0) {
    return <p className="text-muted">No users found.</p>
  }

  return (
    <>
      {deleteError && (
        <Notification type="error" content={deleteError} className="mb-3" />
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Admin</th>
              <th>Sign Up Date</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.firstName || '—'}</td>
                <td>{user.lastName || '—'}</td>
                <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                <td>
                  {user.signUpDate
                    ? new Date(user.signUpDate).toLocaleDateString()
                    : '—'}
                </td>
                <td>
                  {user.lastLoggedIn
                    ? new Date(user.lastLoggedIn).toLocaleDateString()
                    : '—'}
                </td>
                <td>
                  <OLButton
                    variant="danger"
                    size="sm"
                    isLoading={deletingId === user.id}
                    loadingLabel="Deleting..."
                    onClick={() => handleDelete(user.id, user.email)}
                  >
                    Delete
                  </OLButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function UserActivateError({ failedEmails }) {
  return (
    <div className="row-spaced">
      <Notification
        type="error"
        content="Sorry, an error occured, failed to register these email:"
        className="mb-3"
      />
      <ul>
        {failedEmails.map(email => (
          <li key={email}>{email}</li>
        ))}
      </ul>
    </div>
  )
}

function SuccessfulRegistrationMessage() {
  return (
    <div className="row-spaced text-success">
      <p>We've sent out welcome emails to the registered users.</p>
      <p>
        You can also manually send them URLs below to allow them to reset their
        password and log in for the first time.
      </p>
      <p>
        (Password reset tokens will expire after one week and the user will need
        registering again).
      </p>
    </div>
  )
}

function DisplayEmailsList({ emails }) {
  return (
    <table className="table table-striped ">
      <tbody>
        <tr>
          <th>Email</th>
          <th>Set Password Url</th>
        </tr>
        {emails.map(user => (
          <tr key={user.email}>
            <td>{user.email}</td>
            <td style={{ wordBreak: 'break-all' }}>{user.setNewPasswordUrl}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

DisplayEmailsList.propTypes = {
  emails: PropTypes.array,
}
UserActivateError.propTypes = {
  failedEmails: PropTypes.array,
}
UsersTable.propTypes = {
  users: PropTypes.array,
  loading: PropTypes.bool,
  onUserDeleted: PropTypes.func,
}

export default UserActivateRegister
