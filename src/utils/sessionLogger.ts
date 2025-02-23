
type LogLevel = 'info' | 'warn' | 'error';

interface LogMessage {
  event: string;
  data?: any;
  timestamp: string;
  sessionId?: string | null;
}

const formatLogMessage = (message: LogMessage): string => {
  const { event, data, timestamp, sessionId } = message;
  return `[${timestamp}]${sessionId ? ` [Session: ${sessionId}]` : ''} ${event}${data ? `: ${JSON.stringify(data, null, 2)}` : ''}`;
};

const log = (level: LogLevel, message: LogMessage) => {
  const formattedMessage = formatLogMessage(message);
  switch (level) {
    case 'info':
      console.log(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'error':
      console.error(formattedMessage);
      break;
  }
};

export const sessionLogger = {
  info: (event: string, data?: any, sessionId?: string | null) => {
    log('info', {
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId
    });
  },

  warn: (event: string, data?: any, sessionId?: string | null) => {
    log('warn', {
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId
    });
  },

  error: (event: string, data?: any, sessionId?: string | null) => {
    log('error', {
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId
    });
  }
};
