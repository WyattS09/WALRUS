export default function Home({ setView }) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1>Realtime Quiz</h1>
  
        <button onClick={() => setView('host')}>
          Create Room
        </button>
  
        <button onClick={() => setView('player')}>
          Join Room
        </button>
  
        <button onClick={() => setView('questions')}>
          Questions
        </button>
      </div>
    )
  }
  