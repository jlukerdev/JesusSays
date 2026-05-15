import { useEffect } from 'react'
import { HashRouter, useLocation } from 'react-router-dom'
import { loadTeachings } from './data/loader.js'
import { buildReverseIndex } from './data/reverseIndex.js'
import { buildSearchIndex } from './utils/search.js'
import useStore from './store.js'
import { useLocalPreference } from './hooks/useLocalPreference.js'
import ModernApp from './components/ModernApp/ModernApp.jsx'
import { ENABLE_ABOUT_PAGE } from './featureFlags.js'

function AppRoutes() {
  const setData = useStore((s) => s.setData)
  const setDataError = useStore((s) => s.setDataError)

  const setShowAbout = useStore((s) => s.setShowAbout)
  const [viewedVersion] = useLocalPreference('aboutViewedVersion', null)

  useEffect(() => {
    if (ENABLE_ABOUT_PAGE && viewedVersion === null) {
      setShowAbout(true)
    }
  }, [])

  useEffect(() => {
    loadTeachings()
      .then(({ categories, meta }) => {
        buildReverseIndex(categories)
        buildSearchIndex(categories)
        setData({ categories, meta })
      })
      .catch((err) => setDataError(err.message))
  }, [])

  return <ModernApp />
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
