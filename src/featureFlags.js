// Feature flags for Jesus Says app
//
// ENABLE_CLASSIC_NAV: Set to true to re-enable the classic navigation style
// and show the nav style switcher in the Settings menu.
// When false, the app always renders ModernApp and the classic nav option is hidden.
export const ENABLE_CLASSIC_NAV = false

// ENABLE_CATALOG_OPTIMIZER: Set to true to expose the /catalog-optimizer route
// and the "Catalog Optimizer" button in the Settings menu.
// When false, the route is removed and the menu option is hidden.
export const ENABLE_CATALOG_OPTIMIZER = false

// ENABLE_ABOUT_PAGE: About panel with app info, creator bio, and version details.
// Active in development only; tree-shaken out of production builds.
export const ENABLE_ABOUT_PAGE = true // import.meta.env.DEV
