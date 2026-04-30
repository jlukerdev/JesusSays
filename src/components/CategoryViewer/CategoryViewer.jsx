import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useStore from '../../store.js'
import { ABBR_TO_FULL } from '../../utils/bookOrder.js'
import TeachingsTable from '../TeachingsTable/TeachingsTable.jsx'
import CategoryNav from './CategoryNav.jsx'

export default function CategoryViewer() {
  const { slug } = useParams()
  const categories = useStore((s) => s.categories)
  const setActiveCategorySlug = useStore((s) => s.setActiveCategorySlug)
  const setActiveMode = useStore((s) => s.setActiveMode)

  useEffect(() => {
    setActiveMode('category')
    if (slug) setActiveCategorySlug(slug)
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'instant' })
  }, [slug, setActiveCategorySlug, setActiveMode])

  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    return <div className="data-error">Category not found.</div>
  }

  const sourceBooks = (category.sources ?? [])
    .map((abbr) => ABBR_TO_FULL[abbr] ?? abbr)
    .join(' · ')

  return (
    <div className="category-viewer">
      <CategoryNav isBottom={false} />

      <section
        className="category-section"
        id={category.slug}
        data-sources={(category.sources ?? []).join(' ')}
      >
        <div className="category-header">
          <h2 className="category-title">
            <span className="cat-num-inline">{category.id}.</span>{' '}
            {category.title}
          </h2>
          {sourceBooks && (
            <span className="category-sources">{sourceBooks}</span>
          )}
        </div>

        {category.subcategories.map((subcat) => (
          <div
            key={subcat.slug}
            className="subcategory-section"
            id={subcat.slug}
          >
            <h3 className="subcategory-title">{subcat.title}</h3>
            <TeachingsTable teachings={subcat.teachings ?? []} />
          </div>
        ))}
      </section>

      <CategoryNav isBottom={true} />
    </div>
  )
}
