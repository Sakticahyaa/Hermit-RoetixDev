import { GanttChart } from '../components/seer/GanttChart'
import { useRoetixDevCtx } from '../context/RoetixDevContext'

export function SeerPage() {
  const { projects, seerEntries, addSeerEntry, editSeerEntry, removeSeerEntry } = useRoetixDevCtx()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <GanttChart
        entries={seerEntries}
        projects={projects}
        onAdd={addSeerEntry}
        onEdit={editSeerEntry}
        onDelete={removeSeerEntry}
      />
    </div>
  )
}
