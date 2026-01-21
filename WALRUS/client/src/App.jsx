import Host from './views/Host'
import Player from './views/Player'
import Display from './views/Display'


export default function App() {
const role = new URLSearchParams(window.location.search).get('role')
if (role === 'host') return <Host />
if (role === 'display') return <Display />
return <Player />
}