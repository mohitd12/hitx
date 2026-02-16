export type AuthStatus =
  | 'not_connected'
  | 'connecting'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'error';

export type RequestStatus = 'idle' | 'pending' | 'success' | 'error';