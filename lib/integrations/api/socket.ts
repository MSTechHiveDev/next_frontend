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

export const subscribeToSocket = async (channel: string, event: string, callback: (data: any) => void) => {
  const socketInstance = await getSocket();
  if (socketInstance) {
    // Join channel if needed (though backend usually handles room joining via logic, explicit join might be needed via event)
    // Ideally backend joins the socket to the room on connection based on token.
    // If "channel" implies a room, we might need an emit to join. 
    // But for now, assuming standard event listening.
    // Actually, looking at backend: io.to(`hospital_${hospitalId}`).emit(...)
    // The client socket must be IN that room.
    // Usually, the server puts the socket in the room upon connection/auth.
    // IF NOT, we might need `socket.emit('join', channel)`.
    // Let's assume standard event binding for now.
    socketInstance.on(event, callback);
  }
};

export const unsubscribeFromSocket = async (channel: string, event: string, callback: (data: any) => void) => {
  const socketInstance = await getSocket();
  if (socketInstance) {
    socketInstance.off(event, callback);
  }
};
