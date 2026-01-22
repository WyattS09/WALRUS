import '../styles/kahoot.css'

export default function FeedbackOverlay({ correct, points }) {
  return (
    <div
      className={`feedback-overlay ${
        correct ? 'feedback-correct' : 'feedback-wrong'
      }`}
    >
      <div>
        {correct ? 'Correct!' : 'Wrong'}
        {correct && (
          <div className="feedback-points">+{points}</div>
        )}
      </div>
    </div>
  )
}
