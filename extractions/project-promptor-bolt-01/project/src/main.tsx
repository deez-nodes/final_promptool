import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "@/components/ui/provider"
import { Toaster } from "@/components/ui/toaster"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider defaultTheme="system" storageKey="promptor-color-mode">
      <App />
      <Toaster />
    </Provider>
  </StrictMode>,
)
