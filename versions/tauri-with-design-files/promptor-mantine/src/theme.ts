import { Badge, Button, colorsTuple, createTheme, Kbd, Modal, Notification } from '@mantine/core'

export const LOGO_FONT = "'Orbitron', sans-serif"

const color = (name: string) => `var(--mantine-color-${name})`

/** Soft halo in a theme colour, for the wordmark and outlined controls. */
export const glow = (name: string) => `0 0 12px color-mix(in srgb, ${color(`${name}-filled`)} 40%, transparent)`

/** The wide uppercase lettering on buttons and titles. */
const display = { fontFamily: LOGO_FONT, textTransform: 'uppercase', letterSpacing: '0.08em' } as const

export const theme = createTheme({
  primaryColor: 'acid',
  autoContrast: true,
  fontFamily: "'JetBrains Mono', monospace",
  fontFamilyMonospace: "'JetBrains Mono', monospace",
  headings: { fontFamily: "'Rajdhani', sans-serif" },
  colors: {
    acid: colorsTuple('#e8ff47'),
    miku: colorsTuple('#39d4c8'),
    sky: colorsTuple('#5cc8ff'),
    hot: colorsTuple('#ff4da6'),
    mint: colorsTuple('#5dffb0'),
    amber: colorsTuple('#f5a524'),
    green: colorsTuple('#22d46a'),
    sand: colorsTuple('#d6d9a6'),
    dark: ['#dfe6f0', '#b3bdd0', '#808ea8', '#54607a', '#222a3c', '#161a26', '#0f1119', '#07080e', '#05060a', '#030406'],
    navy: ['#c9d4ea', '#8b98b8', '#5f6f96', '#2f4a86', '#1f3f80', '#1c3566', '#12224f', '#0c1738', '#091230', '#060c22'],
  },
  components: {
    Button: Button.extend({
      defaultProps: { variant: 'outline' },
      styles: { label: display },
    }),
    Badge: Badge.extend({
      defaultProps: { variant: 'outline', radius: 'sm' },
      styles: { label: { letterSpacing: '0.08em' } },
    }),
    Kbd: Kbd.extend({
      styles: { root: { background: color('navy-8'), borderColor: color('navy-4'), color: color('acid-filled') } },
    }),
    Modal: Modal.extend({
      styles: {
        content: { background: color('navy-7'), border: `1px solid ${color('navy-5')}` },
        header: { background: color('navy-8'), borderBottom: `1px solid ${color('navy-5')}` },
        title: { ...display, fontSize: 'var(--mantine-font-size-xl)', color: color('green-filled') },
      },
    }),
    Notification: Notification.extend({
      defaultProps: { withCloseButton: false },
      vars: () => ({ root: { '--notification-color': 'transparent' } }),
      styles: (_theme, props) => {
        const outcome = color(`${props.color ?? 'green'}-filled`)
        return {
          root: {
            width: 'fit-content',
            marginInlineStart: 'auto',
            paddingInline: 'var(--mantine-spacing-md)',
            background: color('body'),
            border: `1px solid ${outcome}`,
          },
          description: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: outcome },
        }
      },
    }),
  },
})
