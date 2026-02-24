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
        wsPort: Number(port),
        wssPort: Number(port),
        forceTLS,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${window.location.origin}/broadcasting/auth`,
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
        },
        authorizer: (channel: { name: string }) => ({
            authorize: (socketId: string, callback: (error: boolean, data?: any) => void) => {
                fetch(`${window.location.origin}/broadcasting/auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }),
                    credentials: 'include', // ensures laravel_session cookie is sent (required for cross-origin)
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