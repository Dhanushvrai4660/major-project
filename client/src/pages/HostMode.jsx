import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export default function HostMode({ user, onBack }) {
  const [sessionId, setSessionId] = useState(null)
  const [status, setStatus] = useState('idle')
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)
  const peerRef = useRef(null)
  const streamRef = useRef(null)
  const sessionIdRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io('http://localhost:5000')
    const socket = socketRef.current

    socket.on('controller-joined', async (controllerId) => {
      console.log('Controller joined!', controllerId)
      setStatus('connected')

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      peerRef.current = peer

      streamRef.current.getTracks().forEach(track => {
        console.log('Adding track:', track)
        peer.addTrack(track, streamRef.current)
      })

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          console.log('Sending ICE candidate')
          socket.emit('ice-candidate', { sessionId: sessionIdRef.current, candidate: e.candidate })
        }
      }

      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      console.log('Sending offer...')
      socket.emit('offer', { sessionId: sessionIdRef.current, offer })
    })

    socket.on('answer', async ({ answer }) => {
      console.log('Answer received!')
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(answer)
      }
    })

    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerRef.current) {
        await peerRef.current.addIceCandidate(candidate)
      }
    })

    socket.on('session-killed', () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (peerRef.current) peerRef.current.close()
      streamRef.current = null
      sessionIdRef.current = null
      setStream(null)
      setSessionId(null)
      setStatus('idle')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const startSession = async () => {
    try {
      const id = 'session_' + Math.random().toString(36).substr(2, 9)

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      })

      streamRef.current = screenStream
      sessionIdRef.current = id
      setStream(screenStream)
      setSessionId(id)
      setStatus('hosting')

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream
      }

      socketRef.current.emit('create-session', id)

    } catch (err) {
      console.error('Error starting session:', err)
      setStatus('error')
    }
  }

  const stopSession = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (peerRef.current) peerRef.current.close()
    if (sessionIdRef.current) socketRef.current.emit('kill-session', sessionIdRef.current)
    streamRef.current = null
    sessionIdRef.current = null
    setStream(null)
    setSessionId(null)
    setStatus('idle')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.back}>← Back</button>
        <h1 style={styles.title}>🖥️ Host Mode</h1>
        <div style={styles.statusBadge(status)}>
          {status === 'idle' && '○ IDLE'}
          {status === 'hosting' && '● WAITING FOR CONTROLLER'}
          {status === 'connected' && '● CONTROLLER CONNECTED'}
          {status === 'error' && '✗ ERROR'}
        </div>
      </div>

      {sessionId && (
        <div style={styles.sessionBox}>
          <p style={styles.sessionLabel}>SESSION ID — share this with controller:</p>
          <p style={styles.sessionId}>{sessionId}</p>
        </div>
      )}

      <div style={styles.preview}>
        {stream ? (
          <video ref={videoRef} autoPlay muted style={styles.video} />
        ) : (
          <div style={styles.placeholder}>
            <p style={styles.placeholderText}>🖥️</p>
            <p style={styles.placeholderSub}>No screen sharing active</p>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        {status === 'idle' ? (
          <button style={styles.startBtn} onClick={startSession}>
            Start Screen Sharing
          </button>
        ) : (
          <button style={styles.stopBtn} onClick={stopSession}>
            ⬛ Stop & Kill Session
          </button>
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
    color: status === 'connected' ? '#10b981' : status === 'hosting' ? '#f59e0b' : status === 'error' ? '#ef4444' : '#6b6b80',
    border: `1px solid ${status === 'connected' ? '#10b981' : status === 'hosting' ? '#f59e0b' : status === 'error' ? '#ef4444' : '#22222e'}`
  }),
  sessionBox: {
    background: '#16161f',
    border: '1px solid #22222e',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center'
  },
  sessionLabel: { color: '#6b6b80', fontSize: '11px', margin: '0 0 8px 0', letterSpacing: '1px' },
  sessionId: { color: '#00e5ff', fontSize: '18px', margin: 0, letterSpacing: '2px' },
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
  placeholderSub: { color: '#6b6b80', fontSize: '13px' },
  controls: { display: 'flex', justifyContent: 'center' },
  startBtn: {
    background: '#00e5ff',
    color: '#0a0a0f',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 32px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'monospace'
  },
  stopBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 32px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'monospace'
  }
}