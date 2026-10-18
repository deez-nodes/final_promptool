import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    /** Set only when the page is served by bridge.js. */
    __PROMPTOR_TOKEN__?: string
  }
}

export const MODELS = ['sonnet', 'opus', 'fable']
export const EFFORTS = ['low', 'medium', 'high']

export interface ChatMessage {
  role: 'you' | 'bot' | 'sys' | 'cost'
  text: string
}

interface BridgeEvent {
  type: string
  subtype?: string
  model?: string
  code?: number
  total_cost_usd?: number
  message?: { content?: { type: string; text?: string }[] }
}

/** One live claude session behind bridge.js: health check, event stream, send and restart. */
export function useBridge() {
  const token = window.__PROMPTOR_TOKEN__
  const [up, setUp] = useState(false)
  const [model, setModel] = useState('sonnet')
  const [effort, setEffort] = useState('medium')
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'sys', text: 'start the bridge, then Optimize ✦ or Run ▶' }])

  const engine = useRef({ model, effort })
  engine.current = { model, effort }

  const say = (role: ChatMessage['role'], text: string) => setMessages((all) => [...all, { role, text }])

  const post = (path: string, body: object, failure: string) =>
    fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-promptor-token': token ?? '' },
      body: JSON.stringify(body),
    })
      .then(
        (r) => r.ok,
        () => false,
      )
      .then((ok) => {
        if (!ok) say('sys', failure)
        return ok
      })

  useEffect(() => {
    if (!token) return
    let stream: EventSource | undefined
    let cancelled = false

    const onEvent = (evt: BridgeEvent) => {
      if (evt.type === 'system' && evt.subtype === 'init') {
        const alias = MODELS.find((m) => m !== 'sonnet' && evt.model?.includes(m)) ?? 'sonnet'
        if (evt.model) setModel(alias)
      } else if (evt.type === 'assistant') {
        const text = (evt.message?.content ?? []).filter((c) => c.type === 'text').map((c) => c.text).join('')
        if (text) say('bot', text)
      } else if (evt.type === 'result') {
        const cost = evt.total_cost_usd ? ` · $${evt.total_cost_usd.toFixed(4)}` : ''
        say('cost', `— ${evt.subtype ?? 'done'}${cost} · ${engine.current.model}/${engine.current.effort}`)
      } else if (evt.type === 'system' && evt.subtype === 'engine_exit') {
        say('sys', `engine exited (code ${evt.code})`)
        setUp(false)
      }
    }

    fetch('/health')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((health) => {
        if (cancelled || !health?.ok) return
        setUp(true)
        if (EFFORTS.includes(health.effort)) setEffort(health.effort)
        stream = new EventSource(`/stream?t=${encodeURIComponent(token)}`)
        stream.onmessage = (e) => {
          try {
            onEvent(JSON.parse(e.data))
          } catch {
            // a malformed event is dropped; the stream stays open
          }
        }
      })
      .catch(() => setUp(false))

    return () => {
      cancelled = true
      stream?.close()
    }
  }, [token])

  return {
    up,
    model,
    effort,
    messages,
    /** Send text to the session; `shown` is what appears in the thread when it differs. Resolves to whether it went through. */
    send(text: string, shown = text) {
      say('you', shown)
      return post('/send', { text }, 'send failed')
    },
    restart(next: { model?: string; effort?: string }) {
      const cfg = { ...engine.current, ...next }
      setModel(cfg.model)
      setEffort(cfg.effort)
      say('sys', `restarting session → ${cfg.model} / ${cfg.effort}`)
      post('/restart', cfg, 'restart failed')
    },
  }
}

export type Bridge = ReturnType<typeof useBridge>
