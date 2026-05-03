import { useState } from 'react'
import HostMode from './HostMode'
import ControllerMode from './ControllerMode'

export default function Home({ user }) {
  const [mode, setMode] = useState(null)

  if (mode === 'host') return <HostMode user={user} onBack={() => setMode(null)} />
  if (mode === 'controller') return <ControllerMode user={user} onBack={() => setMode(null)} />

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.badge}>● CONNECTED</span>
        <h1 style={styles.title}>⚡ IRCP</h1>
        <p style={styles.welcome}>Welcome, <span style={styles.name}>{user.username}</span></p>
        <p style={styles.role}>Role: {user.role.toUpperCase()}</p>
      </div>

      <div style={styles.cards}>
        <div style={styles.card} onClick={() => setMode('host')}>
          <div style={styles.cardIcon}>🖥️</div>
          <h2 style={styles.cardTitle}>Host Mode</h2>
          <p style={styles.cardDesc}>Share your screen and allow others to control your device with fine-grained permissions</p>
          <div style={styles.cardFeatures}>
            <span style={styles.feature}>✓ Screen sharing</span>
            <span style={styles.feature}>✓ Permission control</span>
            <span style={styles.feature}>✓ Kill switch</span>
          </div>
          <button style={styles.cardButton}>Start Hosting →</button>
        </div>

        <div style={styles.card} onClick={() => setMode('controller')}>
          <div style={styles.cardIcon}>🎮</div>
          <h2 style={styles.cardTitle}>Controller Mode</h2>
          <p style={styles.cardDesc}>Connect to a remote device, view their screen and control it with permission</p>
          <div style={styles.cardFeatures}>
            <span style={styles.feature}>✓ Remote control</span>
            <span style={styles.feature}>✓ Live stream view</span>
            <span style={styles.feature}>✓ Multi-user</span>
          </div>
          <button style={styles.cardButton}>Start Controlling →</button>
        </div>
      </div>

      <button style={styles.logout} onClick={() => {
        localStorage.removeItem('token')
        window.location.reload()
      }}>Logout</button>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
    padding: '40px'
  },
  header: { textAlign: 'center', marginBottom: '48px' },
  badge: { color: '#10b981', fontSize: '12px', letterSpacing: '2px' },
  title: { color: '#00e5ff', fontSize: '48px', margin: '8px 0' },
  welcome: { color: '#e8e8f0', fontSize: '18px', margin: '4px 0' },
  name: { color: '#00e5ff' },
  role: { color: '#6b6b80', fontSize: '12px', letterSpacing: '2px' },
  cards: { display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    background: '#16161f',
    border: '1px solid #22222e',
    borderRadius: '12px',
    padding: '32px',
    width: '280px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardIcon: { fontSize: '40px' },
  cardTitle: { color: '#e8e8f0', fontSize: '20px', margin: 0 },
  cardDesc: { color: '#6b6b80', fontSize: '13px', lineHeight: '1.6', margin: 0 },
  cardFeatures: { display: 'flex', flexDirection: 'column', gap: '4px' },
  feature: { color: '#10b981', fontSize: '12px' },
  cardButton: {
    background: 'transparent',
    border: '1px solid #00e5ff',
    color: '#00e5ff',
    borderRadius: '6px',
    padding: '10px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '13px',
    marginTop: '8px'
  },
  logout: {
    background: 'transparent',
    border: '1px solid #22222e',
    color: '#6b6b80',
    borderRadius: '6px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '12px',
    marginTop: '40px'
  }
}