import { API_CONFIG } from '../config/api-config';

let socket: any = null;

export const getSocket = async (token?: string): Promise<any> => {
  if (!socket) {
    // @ts-ignore
    const { io } = await import('socket.io-client');
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    socket = io(baseUrl, {
      auth: {
        token: token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('📡 Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('📡 Disconnected from WebSocket server');
    });

    socket.on('error', (err: any) => {
      console.error('📡 WebSocket error:', err);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
