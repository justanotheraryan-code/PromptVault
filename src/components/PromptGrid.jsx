import PromptCard from './PromptCard'

export default function PromptGrid({ prompts, onEdit, onDelete, onCopy }) {
  if (prompts.length === 0) {
    return (
      <div className="prompt-grid">
        <div className="empty-state">
          <div className="empty-state__line">&gt; NO PROMPTS FOUND.</div>
          <div className="empty-state__line">// BUILD YOUR VAULT.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="prompt-grid">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      ))}
    </div>
  )
}
