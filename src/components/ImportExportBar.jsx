import { useRef } from 'react'

export default function ImportExportBar({ onExport, onImport, totalPrompts }) {
  const fileRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
      e.target.value = ''
    }
  }

  return (
    <div className="import-export-bar">
      <span className="import-export-bar__label">Vault tools</span>
      <button className="btn-secondary" onClick={onExport} disabled={totalPrompts === 0}>
        Export JSON
      </button>
      <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
        Import JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="import-export-bar__file-input"
        onChange={handleFileChange}
      />
    </div>
  )
}
