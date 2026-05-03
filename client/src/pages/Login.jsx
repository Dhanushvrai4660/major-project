import { useState } from 'react'

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'host' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const endpoint = isSignup ? 'signup' : 'login'
      const body = isSignup
        ? { username: form.username, email: form.email, password: form.password, role: form.role }
        : { email: form.email, password: form.password }

      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
      } else {
        if (isSignup) {
          setIsSignup(false)
          setError('Account created! Please login.')
        } else {
          localStorage.setItem('token', data.token)
          onLogin(data.user)
        }
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure server is running.')
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚡</div>
        <h1 style={styles.title}>IRCP</h1>
        <p style={styles.subtitle}>Intelligent Remote Collaboration Platform</p>

        {isSignup && (
          <input
            style={styles.input}
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
        )}

        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        {isSignup && (
          <select
            style={styles.input}
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option value="host">Host</option>
            <option value="controller">Controller</option>
            <option value="admin">Admin</option>
          </select>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
        </button>

        <p style={styles.toggle}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <span style={styles.link} onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace'
  },
  card: {
    background: '#16161f',
    border: '1px solid #22222e',
    borderRadius: '12px',
    padding: '40px',
    width: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  logo: { fontSize: '40px', textAlign: 'center' },
  title: { color: '#00e5ff', textAlign: 'center', fontSize: '28px', margin: 0 },
  subtitle: { color: '#6b6b80', textAlign: 'center', fontSize: '12px', margin: 0 },
  input: {
    background: '#0a0a0f',
    border: '1px solid #22222e',
    borderRadius: '6px',
    padding: '12px',
    color: '#e8e8f0',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'monospace'
  },
  button: {
    background: '#00e5ff',
    color: '#0a0a0f',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'monospace',
    marginTop: '8px'
  },
  error: { color: '#ef4444', fontSize: '12px', margin: 0 },
  toggle: { color: '#6b6b80', fontSize: '12px', textAlign: 'center', margin: 0 },
  link: { color: '#00e5ff', cursor: 'pointer' }
}