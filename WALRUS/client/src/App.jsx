import React, { useState, useEffect } from 'react'
import Home from './views/Home';
import Questions from './views/Questions';
import Host from './views/Host';
import Player from './views/Player';
export default function App() {
  const roleParam = new URLSearchParams(window.location.search).get('role')
  const [username, setUsername] = useState('')
  const [customQuestions, setCustomQuestions] = useState([])
  const [view, setView] = useState('home')

  useEffect(() => {
    console.log('App.jsx: customQuestions state:', customQuestions)
    console.log('App.jsx: current view:', view)
  }, [customQuestions, view])

  // Projector / whiteboard view
  if (roleParam === 'display') return <Display />



  if (view === 'host') return <Host username={username} customQuestions={customQuestions} />
  if (view === 'player') return <Player username={username} />
  if (view === 'questions') return <Questions questions={customQuestions} setQuestions={setCustomQuestions} onDone={() => setView('home')} />

  return <Home setView={setView} username={username} setUsername={setUsername} />
}

