import PromptCard from './PromptCard'

export default function PromptGrid({ prompts, onEdit, onDelete, onCopy }) {
  if (prompts.length === 0) {
    return (
      <div className="prompt-grid">
        <div className="empty-state">
          <div className="empty-state__primary">No prompts found</div>
          <div className="empty-state__secondary">Add your first prompt to get started</div>
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
