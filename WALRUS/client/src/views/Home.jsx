export default function Home({ setView, username, setUsername }) {
    const handleRoleSelect = (role) => {
      if (!username.trim()) {
        alert('Please enter a username')
        return
      }
      setView(role)
    }

    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1>Realtime Quiz</h1>
  
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRoleSelect('player')}
            style={{
              padding: '10px',
              fontSize: '16px',
              width: '200px',
              border: '2px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
  
        <button 
          onClick={() => handleRoleSelect('host')}
          style={{ marginRight: '10px', padding: '10px 20px', fontSize: '16px' }}
        >
          Create Room
        </button>
  
        <button 
          onClick={() => handleRoleSelect('player')}
          style={{ marginRight: '10px', padding: '10px 20px', fontSize: '16px' }}
        >
          Join Room
        </button>
  
        <button 
          onClick={() => handleRoleSelect('questions')}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Questions
        </button>
      </div>
    )
  }
  