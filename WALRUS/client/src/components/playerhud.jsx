import '../styles/kahoot.css'
export default function PlayerHUD({ username, totalScore }) {
return (
<div className="player-hud">
<div className="player-hud-left">{username}</div>
<div className="player-hud-right">{totalScore}</div>
</div>
)
}
