import { useIsMobile } from '../../../hooks/useBreakpoint.js'
import BiblePanel from './BiblePanel.jsx'
import BibleDrawer from './BibleDrawer.jsx'

export default function BibleViewer({ bibleRef, open, pinned, onClose, onTogglePin }) {
  const isMobile = useIsMobile()
  return isMobile
    ? <BibleDrawer bibleRef={bibleRef} open={open} onClose={onClose} />
    : <BiblePanel  bibleRef={bibleRef} open={open} pinned={pinned} onClose={onClose} onTogglePin={onTogglePin} />
}
