import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { theme } from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Notifications position="bottom-right" autoClose={2000} />
      <App />
    </MantineProvider>
  </StrictMode>,
)
