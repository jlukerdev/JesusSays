export default function OptimizerToolbar({ loadSource, fileName, onDownload, onCollapseAll, onExpandAll, onRestart }) {
  const label = loadSource === 'file'
    ? `Loaded from file: ${fileName}`
    : 'Loaded from server'

  return (
    <div className="opt-toolbar">
      <button className="opt-toolbar__btn" onClick={onRestart}>Restart</button>
      <span className="opt-toolbar__label">{label}</span>
      <button className="opt-toolbar__btn" onClick={onCollapseAll}>Collapse all</button>
      <button className="opt-toolbar__btn" onClick={onExpandAll}>Expand all</button>
      <button className="opt-toolbar__btn opt-toolbar__btn--primary" onClick={onDownload}>
        Download teachings.json
      </button>
    </div>
  )
}
