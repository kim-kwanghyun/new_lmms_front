/**
 * Manual pages styles plugin
 * Loads common CSS for manual pages
 */
export default defineNuxtPlugin(() => {
  // Import manual-specific CSS
  if (typeof window !== 'undefined') {
    import('~/assets/css/manual.css')
  }
})
