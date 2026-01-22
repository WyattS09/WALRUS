import '../styles/kahoot.css'
export default function FeedbackScreen({ correct, points, streak, message }) {
return (
<div className={`feedback-screen ${correct ? 'feedback-correct' : 'feedback-wrong'}`}>
<div className="feedback-content">
<div className="feedback-title">{correct ? 'Correct' : 'Wrong'}</div>
<div className="feedback-icon">{correct ? '✓' : '✕'}</div>
{correct && <div className="feedback-streak">Answer Streak<div className="streak-badge">{streak}</div></div>}
<div className="feedback-points-box">{correct ? `+ ${points}` : '+ 0'}</div>
{message && <div className="feedback-subtext">{message}</div>}
</div>
</div>
)
}
