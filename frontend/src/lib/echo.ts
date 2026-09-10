import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo?: Echo<'reverb'>
  }
}

window.Pusher = Pusher

let echoInstance: Echo<'reverb'> | null = null

export function getEcho(): Echo<'reverb'> {
  if (!echoInstance) {
    const wsHost = import.meta.env.VITE_REVERB_HOST || window.location.hostname || 'localhost'
    const wsPort = Number(import.meta.env.VITE_REVERB_PORT || 8080)
    const isHttps = (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https'

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY || 'chessmasterkey',
      wsHost: wsHost,
      wsPort: wsPort,
      wssPort: wsPort,
      forceTLS: isHttps,
      enabledTransports: ['ws', 'wss'],
    })

    window.Echo = echoInstance
  }

  return echoInstance
}
