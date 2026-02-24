import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Echo?: Echo;
        Pusher?: typeof Pusher;
    }
}

const key = import.meta.env.VITE_REVERB_APP_KEY;
const host = import.meta.env.VITE_REVERB_HOST ?? window.location.hostname;
const port = import.meta.env.VITE_REVERB_PORT ?? '8080';
const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';
const forceTLS = scheme === 'https';

if (key) {
    window.Pusher = Pusher;

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key,
        wsHost: host,
        wsPort: port,
        wssPort: port,
        forceTLS,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {},
        },
        authorizer: (channel: { name: string }) => ({
            authorize: (socketId: string, callback: (a: boolean, b?: unknown) => void) => {
                const csrfToken =
                    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
                    (typeof document !== 'undefined' && document.cookie
                        ? decodeURIComponent(
                              document.cookie
                                  .split('; ')
                                  .find((row) => row.startsWith('XSRF-TOKEN='))
                                  ?.split('=')[1] ?? '',
                          )
                        : '');
                fetch('/broadcasting/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': csrfToken,
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }),
                    credentials: 'include',
                })
                    .then((res) => {
                        if (!res.ok) {
                            return res.text().then((text) => {
                                throw new Error(`Broadcast auth ${res.status}: ${text}`);
                            });
                        }
                        return res.json();
                    })
                    .then((data) => callback(false, data))
                    .catch((err) => callback(true, err));
            },
        }),
    });
}

export const getEcho = (): Echo | undefined => window.Echo;
