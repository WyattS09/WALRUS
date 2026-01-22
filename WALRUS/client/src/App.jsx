import React, { useState } from 'react'
import Home from './views/Home';
import Questions from './views/Questions';
import Host from './views/Host';
import Player from './views/Player';
export default function App() {
  const roleParam = new URLSearchParams(window.location.search).get('role')
  const [username, setUsername] = useState('')
  const [customQuestions, setCustomQuestions] = useState([])

  // Projector / whiteboard view
  if (roleParam === 'display') return <Display />

  const [view, setView] = useState('home')

  if (view === 'host') return <Host username={username} customQuestions={customQuestions} />
  if (view === 'player') return <Player username={username} />
  if (view === 'questions') return <Questions questions={customQuestions} setQuestions={setCustomQuestions} onDone={() => setView('home')} />

  return <Home setView={setView} username={username} setUsername={setUsername} />
}

