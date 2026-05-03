import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export default function ControllerMode({ user, onBack }) {
  const [sessionId, setSessionId] = useState('')
  const [status, setStatus] = useState('idle')
  const videoRef = useRef(null)
  const peerRef = useRef(null)
  const socketRef = useRef(null)
  const sessionIdRef = useRef('')

  useEffect(() => {
    socketRef.current = io('http://localhost:5000')
    const socket = socketRef.current

    socket.on('offer', async ({ offer }) => {
      console.log('Offer received!')
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      peerRef.current = peer

      peer.ontrack = (e) => {
        console.log('Track received!', e.streams)
        if (videoRef.current) {
          videoRef.current.srcObject = e.streams[0]
          setStatus('connected')
        }
      }

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('ice-candidate', { sessionId: sessionIdRef.current, candidate: e.candidate })
        }
      }

      await peer.setRemoteDescription(offer)
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      socket.emit('answer', { sessionId: sessionIdRef.current, answer })
    })

    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerRef.current) {
        await peerRef.current.addIceCandidate(candidate)
      }
    })

    socket.on('session-killed', () => {
      setStatus('idle')
      if (videoRef.current) videoRef.current.srcObject = null
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const joinSession = () => {
    if (!sessionId.trim()) return
    sessionIdRef.current = sessionId
    setStatus('connecting')
    socketRef.current.emit('join-session', sessionId)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.back}>← Back</button>
        <h1 style={styles.title}>🎮 Controller Mode</h1>
        <div style={styles.statusBadge(status)}>
          {status === 'idle' && '○ IDLE'}
          {status === 'connecting' && '◌ CONNECTING...'}
          {status === 'connected' && '● CONNECTED'}
        </div>
      </div>

      {(status === 'idle' || status === 'connecting') && (
        <div style={styles.joinBox}>
          <p style={styles.label}>ENTER SESSION ID FROM HOST:</p>
          <input
            style={styles.input}
            placeholder="session_xxxxxxxxx"
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
          />
          <button style={styles.joinBtn} onClick={joinSession}>
            Connect to Host →
          </button>
        </div>
      )}

      <div style={styles.preview}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ ...styles.video, display: status === 'connected' ? 'block' : 'none' }}
        />
        {status !== 'connected' && (
          <div style={styles.placeholder}>
            <p style={styles.placeholderText}>🎮</p>
            <p style={styles.placeholderSub}>
              {status === 'connecting' ? 'Waiting for host...' : 'Enter session ID to connect'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    fontFamily: 'monospace',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  back: {
    background: 'transparent',
    border: '1px solid #22222e',
    color: '#6b6b80',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'monospace'
  },
  title: { color: '#00e5ff', margin: 0, fontSize: '20px' },
  statusBadge: (status) => ({
    fontSize: '11px',
    letterSpacing: '1px',
    padding: '4px 12px',
    borderRadius: '4px',
    color: status === 'connected' ? '#10b981' : status === 'connecting' ? '#f59e0b' : '#6b6b80',
    border: `1px solid ${status === 'connected' ? '#10b981' : status === 'connecting' ? '#f59e0b' : '#22222e'}`
  }),
  joinBox: {
    background: '#16161f',
    border: '1px solid #22222e',
    borderRadius: '8px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '400px'
  },
  label: { color: '#6b6b80', fontSize: '11px', margin: 0, letterSpacing: '1px' },
  input: {
    background: '#0a0a0f',
    border: '1px solid #22222e',
    borderRadius: '6px',
    padding: '12px',
    color: '#e8e8f0',
    fontSize: '14px',
    fontFamily: 'monospace',
    outline: 'none'
  },
  joinBtn: {
    background: '#00e5ff',
    color: '#0a0a0f',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'monospace'
  },
  preview: {
    flex: 1,
    background: '#16161f',
    border: '1px solid #22222e',
    borderRadius: '8px',
    overflow: 'hidden',
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  video: { width: '100%', height: '100%', objectFit: 'contain' },
  placeholder: { textAlign: 'center' },
  placeholderText: { fontSize: '48px', margin: 0 },
  placeholderSub: { color: '#6b6b80', fontSize: '13px' }
}