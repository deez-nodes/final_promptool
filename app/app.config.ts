// Theme overrides for Nuxt UI components (the tailwind-variants layer).
// Compact density: minimal paddings/gaps so the shell uses the full viewport.
// Responsive variants (sm:) are restated because overrides are merged with the
// defaults by tailwind-merge, which only replaces classes with the same variant.
export default defineAppConfig({
  ui: {
    dashboardPanel: {
      slots: {
        body: 'gap-2 sm:gap-2 p-2 sm:p-2'
      }
    },
    dashboardNavbar: {
      slots: {
        root: 'px-2 sm:px-2'
      }
    },
    dashboardSidebar: {
      slots: {
        header: 'px-2',
        body: 'gap-2 px-2 py-1',
        footer: 'px-2 py-1'
      },
      variants: {
        menu: {
          true: {
            header: 'sm:px-2',
            body: 'sm:px-2',
            footer: 'sm:px-2'
          }
        }
      }
    }
  }
})
