import { useState } from 'react'
import Home from './views/Home'
import Host from './views/Host'
import Player from './views/Player'
import Display from './views/Display'
import Questions from './views/Questions'

export default function App() {
  const roleParam = new URLSearchParams(window.location.search).get('role')
  const [username, setUsername] = useState('')

  // Projector / whiteboard view
  if (roleParam === 'display') return <Display />

  const [view, setView] = useState('home')

  if (view === 'host') return <Host username={username} />
  if (view === 'player') return <Player username={username} />
  if (view === 'questions') return <Questions />

  return <Home setView={setView} username={username} setUsername={setUsername} />
}

