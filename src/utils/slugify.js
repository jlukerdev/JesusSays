export function catId(categoryIndex) {
  return `cat-${categoryIndex}`
}

export function subcatId(categoryIndex, subcatIndex) {
  return `cat-${categoryIndex}-${subcatIndex}`
}

export function teachingAnchorId(teachingId) {
  return `t-${teachingId.replace(/\./g, '-')}`
}

export function parseTeachingId(id) {
  const parts = id.split('.')
  return {
    category: parseInt(parts[0], 10),
    subcategory: parseInt(parts[1], 10),
    teaching: parseInt(parts[2], 10)
  }
}
