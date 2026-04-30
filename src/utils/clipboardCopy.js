export async function copyPermalink(teachingId) {
  const anchor = `t-${teachingId.replace(/\./g, '-')}`
  const url = `${window.location.origin}${window.location.pathname}#/category/${anchor}`
  await navigator.clipboard.writeText(url)
}
