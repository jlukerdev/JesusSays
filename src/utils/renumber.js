export function stripHidden(catalog) {
  const categories = catalog.categories
    .filter(c => !c._hidden)
    .map(c => ({
      ...c,
      subcategories: c.subcategories
        .filter(s => !s._hidden)
        .map(s => ({
          ...s,
          teachings: s.teachings.filter(t => !t._hidden)
        }))
    }))
  return { ...catalog, categories }
}

export function renumberCatalog(catalog) {
  const result = JSON.parse(JSON.stringify(catalog))
  result.meta.totalCategories = result.categories.length
  result.categories.forEach((cat, ci) => {
    cat.id = ci + 1
    cat.slug = `cat-${ci + 1}`
    delete cat._hidden
    delete cat._isNew
    cat.subcategories.forEach((subcat, si) => {
      subcat.id = `${ci + 1}.${si + 1}`
      subcat.slug = `cat-${ci + 1}-${si + 1}`
      delete subcat._hidden
      delete subcat._isNew
      subcat.teachings.forEach((teaching, ti) => {
        teaching.id = `${ci + 1}.${si + 1}.${ti + 1}`
        delete teaching._hidden
        delete teaching._isNew
      })
    })
  })
  return result
}
