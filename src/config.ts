// Site-wide settings. Change these without touching any component.
export const config = {
  /** 'dark' (default) or 'light' colour theme for every code viewer. */
  codeTheme: 'dark' as 'dark' | 'light',
  /** Resume file, served from /public. PLACEHOLDER: replace public/Brian-Kelley-Resume.pdf with your real resume. */
  resumeFile: 'Brian-Kelley-Resume.pdf',
  /** localStorage key used to remember the visitor's theme choice. */
  themeStorageKey: 'bk-portfolio-theme',
}

/** Resolves a /public file against Vite's base path, so it works on any host. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
