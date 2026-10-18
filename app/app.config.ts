// Theme overrides for Nuxt UI components (the tailwind-variants layer).
//
// Colors: the default theme "Acid Obsidian" (extractions/component_designs) maps
// every semantic color to a palette defined in app/assets/css/main.css. Other
// themes override the resulting `--ui-*` variables on `:root.theme-<id>`.
//
// Glows and badges are variants of the library components: outlined, lit
// controls as on the sheets. Glow utilities come from the `--shadow-glow-*`
// tokens in main.css; class strings stay literal so Tailwind can find them.
//
// Compact density: minimal paddings/gaps so the shell uses the full viewport.
// Responsive variants (sm:) are restated because overrides are merged with the
// defaults by tailwind-merge, which only replaces classes with the same variant.
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'acid',
      secondary: 'miku',
      tertiary: 'ember',
      magenta: 'hot',
      info: 'azure',
      success: 'jade',
      warning: 'ember',
      error: 'scarlet',
      neutral: 'navy'
    },
    tv: {
      // Teach tailwind-merge that glow-* are box shadows, so a glow replaces
      // (and is replaced by) other shadow utilities instead of stacking.
      twMergeConfig: {
        extend: {
          theme: {
            shadow: ['glow-primary', 'glow-secondary', 'glow-tertiary', 'glow-magenta', 'glow-cyan', 'glow-amber', 'glow-acid']
          }
        }
      }
    },
    button: {
      slots: {
        base: 'font-display uppercase tracking-[0.12em]'
      },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: 'ring-primary shadow-glow-primary' },
        { color: 'secondary', variant: 'outline', class: 'ring-secondary shadow-glow-secondary' },
        { color: 'tertiary', variant: 'outline', class: 'ring-tertiary shadow-glow-tertiary' },
        { color: 'magenta', variant: 'outline', class: 'ring-magenta shadow-glow-magenta' },
        { color: 'info', variant: 'outline', class: 'ring-info shadow-glow-cyan' },
        { color: 'warning', variant: 'outline', class: 'ring-warning shadow-glow-amber' },
        { color: 'success', variant: 'outline', class: 'ring-success' },
        { color: 'error', variant: 'outline', class: 'ring-error' }
      ],
      defaultVariants: {
        variant: 'outline'
      }
    },
    badge: {
      // Sheet badges (PROMPT, DONE, BLOCKED, FAILED...): outlined, mono, bold,
      // letter-spaced capitals, full-strength border, no glow.
      slots: {
        base: 'font-mono font-bold uppercase tracking-[0.08em]'
      },
      compoundVariants: [
        { color: 'primary', variant: 'outline', class: 'ring-primary' },
        { color: 'secondary', variant: 'outline', class: 'ring-secondary' },
        { color: 'tertiary', variant: 'outline', class: 'ring-tertiary' },
        { color: 'magenta', variant: 'outline', class: 'ring-magenta' },
        { color: 'info', variant: 'outline', class: 'ring-info' },
        { color: 'success', variant: 'outline', class: 'ring-success' },
        { color: 'warning', variant: 'outline', class: 'ring-warning' },
        { color: 'error', variant: 'outline', class: 'ring-error' }
      ],
      defaultVariants: {
        variant: 'outline'
      }
    },
    toast: {
      // Sheet toast: "COPIED TO CLIPBOARD", outlined and glowing in its color.
      slots: {
        title: 'font-display uppercase tracking-[0.12em]'
      },
      variants: {
        color: {
          primary: { root: 'ring-primary shadow-glow-primary', title: 'text-primary' },
          secondary: { root: 'ring-secondary shadow-glow-secondary', title: 'text-secondary' },
          tertiary: { root: 'ring-tertiary shadow-glow-tertiary', title: 'text-tertiary' },
          magenta: { root: 'ring-magenta shadow-glow-magenta', title: 'text-magenta' },
          info: { root: 'ring-info shadow-glow-cyan', title: 'text-info' },
          success: { root: 'ring-success', title: 'text-success' },
          warning: { root: 'ring-warning shadow-glow-amber', title: 'text-warning' },
          error: { root: 'ring-error', title: 'text-error' }
        }
      }
    },
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
