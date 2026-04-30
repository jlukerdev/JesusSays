import { useState } from 'react'
import './CatalogOptimizer.css'
import LoadPanel from './LoadPanel.jsx'
import OptimizerToolbar from './OptimizerToolbar.jsx'
import CategoryEditor from './CategoryEditor.jsx'
import OutlinePanel from './OutlinePanel.jsx'
import { stripHidden, renumberCatalog } from '../../utils/renumber.js'

export default function CatalogOptimizer() {
  const [workingCopy, setWorkingCopy] = useState(null)
  const [loadSource, setLoadSource] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [collapseGeneration, setCollapseGeneration] = useState(0)
  const [expandGeneration, setExpandGeneration]     = useState(0)

  function handleLoad({ data, source, fileName: name }) {
    setWorkingCopy(data)
    setLoadSource(source)
    setFileName(name)
    setLoadError(null)
  }

  function handleRestart() {
    setWorkingCopy(null)
    setLoadSource(null)
    setFileName(null)
    setLoadError(null)
    setIsLoading(false)
  }

  function handleDownload() {
    const output = renumberCatalog(stripHidden(workingCopy))
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'teachings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleCollapseAll() { setCollapseGeneration(g => g + 1) }
  function handleExpandAll()   { setExpandGeneration(g => g + 1) }

  // C3 — Category mutation handlers

  function updateCategory(catIndex, updatedCat) {
    setWorkingCopy(prev => {
      const cats = [...prev.categories]
      cats[catIndex] = updatedCat
      return { ...prev, categories: cats }
    })
  }

  function moveCategoryUp(catIndex) {
    setWorkingCopy(prev => {
      const cats = [...prev.categories]
      let swapIdx = catIndex - 1
      while (swapIdx >= 0 && cats[swapIdx]._hidden) swapIdx--
      if (swapIdx < 0) return prev
      ;[cats[swapIdx], cats[catIndex]] = [cats[catIndex], cats[swapIdx]]
      return { ...prev, categories: cats }
    })
  }

  function moveCategoryDown(catIndex) {
    setWorkingCopy(prev => {
      const cats = [...prev.categories]
      let swapIdx = catIndex + 1
      while (swapIdx < cats.length && cats[swapIdx]._hidden) swapIdx++
      if (swapIdx >= cats.length) return prev
      ;[cats[catIndex], cats[swapIdx]] = [cats[swapIdx], cats[catIndex]]
      return { ...prev, categories: cats }
    })
  }

  function deleteCategory(catIndex) {
    setWorkingCopy(prev => {
      const cats = [...prev.categories]
      cats[catIndex] = { ...cats[catIndex], _hidden: true }
      return { ...prev, categories: cats }
    })
  }

  function restoreCategory(catIndex) {
    setWorkingCopy(prev => {
      const cats = [...prev.categories]
      const { _hidden, ...rest } = cats[catIndex]
      cats[catIndex] = rest
      return { ...prev, categories: cats }
    })
  }

  function addCategory() {
    const newCat = {
      id: '__new__',
      slug: '__new__',
      title: 'New Category',
      sources: [],
      description: null,
      subcategories: [],
      _isNew: true
    }
    setWorkingCopy(prev => ({ ...prev, categories: [...prev.categories, newCat] }))
  }

  function addSubcategoryToCategory(catIndex) {
    const newSubcat = {
      id: '__new__',
      slug: '__new__',
      title: 'New Subcategory',
      teachings: [],
      _isNew: true
    }
    setWorkingCopy(prev => {
      const cats = [...prev.categories]
      cats[catIndex] = {
        ...cats[catIndex],
        subcategories: [...cats[catIndex].subcategories, newSubcat]
      }
      return { ...prev, categories: cats }
    })
  }

  function moveSubcategoryToCategory(fromCatIdx, fromSubcatIdx, toCatIdx) {
    if (fromCatIdx === toCatIdx) return
    setWorkingCopy(prev => {
      const cats = prev.categories.map(c => ({ ...c, subcategories: [...c.subcategories] }))
      const [subcat] = cats[fromCatIdx].subcategories.splice(fromSubcatIdx, 1)
      cats[toCatIdx].subcategories.push(subcat)
      return { ...prev, categories: cats }
    })
  }

  function updateSubcategory(catIdx, subcatIdx, updatedSubcat) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map((c, ci) => {
        if (ci !== catIdx) return c
        const subcats = [...c.subcategories]
        subcats[subcatIdx] = updatedSubcat
        return { ...c, subcategories: subcats }
      })
      return { ...prev, categories: cats }
    })
  }

  function moveSubcatUp(catIdx, subcatIdx) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map(c => ({ ...c, subcategories: [...c.subcategories] }))
      const subcats = cats[catIdx].subcategories
      let swapIdx = subcatIdx - 1
      while (swapIdx >= 0 && subcats[swapIdx]._hidden) swapIdx--
      if (swapIdx < 0) return prev
      ;[subcats[swapIdx], subcats[subcatIdx]] = [subcats[subcatIdx], subcats[swapIdx]]
      return { ...prev, categories: cats }
    })
  }

  function moveSubcatDown(catIdx, subcatIdx) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map(c => ({ ...c, subcategories: [...c.subcategories] }))
      const subcats = cats[catIdx].subcategories
      let swapIdx = subcatIdx + 1
      while (swapIdx < subcats.length && subcats[swapIdx]._hidden) swapIdx++
      if (swapIdx >= subcats.length) return prev
      ;[subcats[subcatIdx], subcats[swapIdx]] = [subcats[swapIdx], subcats[subcatIdx]]
      return { ...prev, categories: cats }
    })
  }

  function deleteSubcategory(catIdx, subcatIdx) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map((c, ci) => {
        if (ci !== catIdx) return c
        const subcats = [...c.subcategories]
        subcats[subcatIdx] = { ...subcats[subcatIdx], _hidden: true }
        return { ...c, subcategories: subcats }
      })
      return { ...prev, categories: cats }
    })
  }

  function restoreSubcategory(catIdx, subcatIdx) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map((c, ci) => {
        if (ci !== catIdx) return c
        const subcats = [...c.subcategories]
        const { _hidden, ...rest } = subcats[subcatIdx]
        subcats[subcatIdx] = rest
        return { ...c, subcategories: subcats }
      })
      return { ...prev, categories: cats }
    })
  }

  // D2 — Teaching mutation handlers

  function updateTeaching(catIdx, subcatIdx, teachingIdx, updatedTeaching) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map((c, ci) => {
        if (ci !== catIdx) return c
        return {
          ...c,
          subcategories: c.subcategories.map((s, si) => {
            if (si !== subcatIdx) return s
            const teachings = [...s.teachings]
            teachings[teachingIdx] = updatedTeaching
            return { ...s, teachings }
          })
        }
      })
      return { ...prev, categories: cats }
    })
  }

  function moveTeachingUp(catIdx, subcatIdx, teachingIdx) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map(c => ({
        ...c,
        subcategories: c.subcategories.map(s => ({ ...s, teachings: [...s.teachings] }))
      }))
      const teachings = cats[catIdx].subcategories[subcatIdx].teachings
      let swapIdx = teachingIdx - 1
      while (swapIdx >= 0 && teachings[swapIdx]._hidden) swapIdx--
      if (swapIdx < 0) return prev
      ;[teachings[swapIdx], teachings[teachingIdx]] = [teachings[teachingIdx], teachings[swapIdx]]
      return { ...prev, categories: cats }
    })
  }

  function moveTeachingDown(catIdx, subcatIdx, teachingIdx) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map(c => ({
        ...c,
        subcategories: c.subcategories.map(s => ({ ...s, teachings: [...s.teachings] }))
      }))
      const teachings = cats[catIdx].subcategories[subcatIdx].teachings
      let swapIdx = teachingIdx + 1
      while (swapIdx < teachings.length && teachings[swapIdx]._hidden) swapIdx++
      if (swapIdx >= teachings.length) return prev
      ;[teachings[teachingIdx], teachings[swapIdx]] = [teachings[swapIdx], teachings[teachingIdx]]
      return { ...prev, categories: cats }
    })
  }

  function deleteTeaching(catIdx, subcatIdx, teachingIdx) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map((c, ci) => {
        if (ci !== catIdx) return c
        return {
          ...c,
          subcategories: c.subcategories.map((s, si) => {
            if (si !== subcatIdx) return s
            const teachings = [...s.teachings]
            teachings[teachingIdx] = { ...teachings[teachingIdx], _hidden: true }
            return { ...s, teachings }
          })
        }
      })
      return { ...prev, categories: cats }
    })
  }

  function restoreTeaching(catIdx, subcatIdx, teachingIdx) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map((c, ci) => {
        if (ci !== catIdx) return c
        return {
          ...c,
          subcategories: c.subcategories.map((s, si) => {
            if (si !== subcatIdx) return s
            const teachings = [...s.teachings]
            const { _hidden, ...rest } = teachings[teachingIdx]
            teachings[teachingIdx] = rest
            return { ...s, teachings }
          })
        }
      })
      return { ...prev, categories: cats }
    })
  }

  function moveTeachingToSubcat(fromCatIdx, fromSubcatIdx, fromTeachingIdx, toCatIdx, toSubcatIdx) {
    setWorkingCopy(prev => {
      const cats = prev.categories.map(c => ({
        ...c,
        subcategories: c.subcategories.map(s => ({ ...s, teachings: [...s.teachings] }))
      }))
      const [teaching] = cats[fromCatIdx].subcategories[fromSubcatIdx].teachings.splice(fromTeachingIdx, 1)
      cats[toCatIdx].subcategories[toSubcatIdx].teachings.push(teaching)
      return { ...prev, categories: cats }
    })
  }

  function duplicateTeachingToSubcat(catIdx, subcatIdx, teachingIdx, toCatIdx, toSubcatIdx) {
    setWorkingCopy(prev => {
      const source = prev.categories[catIdx].subcategories[subcatIdx].teachings[teachingIdx]
      const copy = { ...JSON.parse(JSON.stringify(source)), id: '__new__', _isNew: true }
      const cats = prev.categories.map(c => ({
        ...c,
        subcategories: c.subcategories.map(s => ({ ...s, teachings: [...s.teachings] }))
      }))
      cats[toCatIdx].subcategories[toSubcatIdx].teachings.push(copy)
      return { ...prev, categories: cats }
    })
  }

  function addTeachingToSubcat(catIdx, subcatIdx) {
    const newTeaching = {
      id: '__new__',
      text: '',
      quote: '',
      tags: [],
      references: [],
      _isNew: true
    }
    setWorkingCopy(prev => {
      const cats = prev.categories.map((c, ci) => {
        if (ci !== catIdx) return c
        return {
          ...c,
          subcategories: c.subcategories.map((s, si) => {
            if (si !== subcatIdx) return s
            return { ...s, teachings: [...s.teachings, newTeaching] }
          })
        }
      })
      return { ...prev, categories: cats }
    })
  }

  // C1 — Compute visible positions for rendering
  const visibleCategories = workingCopy
    ? workingCopy.categories.filter(c => !c._hidden)
    : []
  const totalVisible = visibleCategories.length

  return (
    <div className="catalog-optimizer">
      {workingCopy === null ? (
        <LoadPanel
          onLoad={handleLoad}
          isLoading={isLoading}
          loadError={loadError}
        />
      ) : (
        <>
          <OptimizerToolbar
            loadSource={loadSource}
            fileName={fileName}
            onDownload={handleDownload}
            onCollapseAll={handleCollapseAll}
            onExpandAll={handleExpandAll}
            onRestart={handleRestart}
          />
          <div className="opt-split">
            <aside className="opt-outline-panel">
              <OutlinePanel
                workingCopy={workingCopy}
                collapseGeneration={collapseGeneration}
                expandGeneration={expandGeneration}
              />
            </aside>
            <div className="opt-editor-panel">
              <div className="opt-body">
                <button className="opt-btn" onClick={addCategory}>
                  + Add category
                </button>
                {(() => {
                  let visPos = 0
                  return workingCopy.categories.map((category, catIndex) => {
                    if (!category._hidden) visPos++
                    return (
                      <CategoryEditor
                        key={catIndex}
                        category={category}
                        catIndex={catIndex}
                        position={category._hidden ? null : visPos}
                        totalVisible={totalVisible}
                        collapseGeneration={collapseGeneration}
                        expandGeneration={expandGeneration}
                        onUpdate={(updatedCat) => updateCategory(catIndex, updatedCat)}
                        onMoveUp={() => moveCategoryUp(catIndex)}
                        onMoveDown={() => moveCategoryDown(catIndex)}
                        onDelete={() => deleteCategory(catIndex)}
                        onRestore={() => restoreCategory(catIndex)}
                        onAddSubcategory={() => addSubcategoryToCategory(catIndex)}
                        allCategories={workingCopy.categories}
                        onUpdateSubcategory={(subcatIdx, updatedSubcat) => updateSubcategory(catIndex, subcatIdx, updatedSubcat)}
                        onMoveSubcatUp={(subcatIdx) => moveSubcatUp(catIndex, subcatIdx)}
                        onMoveSubcatDown={(subcatIdx) => moveSubcatDown(catIndex, subcatIdx)}
                        onDeleteSubcategory={(subcatIdx) => deleteSubcategory(catIndex, subcatIdx)}
                        onRestoreSubcategory={(subcatIdx) => restoreSubcategory(catIndex, subcatIdx)}
                        onAddTeachingToSubcat={(subcatIdx) => addTeachingToSubcat(catIndex, subcatIdx)}
                        onMoveSubcatToCategory={(subcatIdx, toCatIdx) => moveSubcategoryToCategory(catIndex, subcatIdx, toCatIdx)}
                        onUpdateTeaching={(subcatIdx, teachingIdx, updated) => updateTeaching(catIndex, subcatIdx, teachingIdx, updated)}
                        onMoveTeachingUp={(subcatIdx, teachingIdx) => moveTeachingUp(catIndex, subcatIdx, teachingIdx)}
                        onMoveTeachingDown={(subcatIdx, teachingIdx) => moveTeachingDown(catIndex, subcatIdx, teachingIdx)}
                        onDeleteTeaching={(subcatIdx, teachingIdx) => deleteTeaching(catIndex, subcatIdx, teachingIdx)}
                        onRestoreTeaching={(subcatIdx, teachingIdx) => restoreTeaching(catIndex, subcatIdx, teachingIdx)}
                        onMoveTeachingToSubcat={(subcatIdx, teachingIdx, toCatIdx, toSubcatIdx) => moveTeachingToSubcat(catIndex, subcatIdx, teachingIdx, toCatIdx, toSubcatIdx)}
                        onDupTeachingToSubcat={(subcatIdx, teachingIdx, toCatIdx, toSubcatIdx) => duplicateTeachingToSubcat(catIndex, subcatIdx, teachingIdx, toCatIdx, toSubcatIdx)}
                      />
                    )
                  })
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
