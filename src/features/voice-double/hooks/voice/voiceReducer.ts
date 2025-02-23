
import { VoiceState, VoiceAction } from '../../types/voice';

export const initialVoiceState: VoiceState = {
  status: 'idle',
  conversationId: null,
};

export function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case 'INIT_CONNECTION':
      return { ...state, status: 'connecting', error: undefined };
    case 'CONNECTION_SUCCESS':
      return { 
        ...state, 
        status: 'connected',
        conversationId: action.conversationId,
        error: undefined
      };
    case 'CONNECTION_FAILED':
      return { 
        ...state, 
        status: 'error',
        error: action.error
      };
    case 'BEGIN_DISCONNECT':
      return { ...state, status: 'disconnecting' };
    case 'DISCONNECTED':
      return initialVoiceState;
    default:
      return state;
  }
}
