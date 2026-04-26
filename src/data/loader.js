let _data = null

export async function loadTeachings() {
  if (_data) return _data

  const res = await fetch('/JesusSays/teachings.json')
  if (!res.ok) throw new Error(`Failed to load teachings.json: ${res.status}`)
  const json = await res.json()

  const teachingsMap = new Map()
  for (const category of json.categories) {
    for (const subcat of category.subcategories) {
      for (const teaching of subcat.teachings) {
        teachingsMap.set(teaching.id, teaching)
      }
    }
  }

  _data = {
    meta: json.meta,
    categories: json.categories,
    teachingsMap
  }

  return _data
}

export function getCategories() {
  return _data?.categories ?? []
}

export function getTeachingById(id) {
  return _data?.teachingsMap.get(id) ?? null
}
