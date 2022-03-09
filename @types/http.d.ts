import { Session } from 'next-iron-session';

declare module 'http' {
  export interface IncomingMessage {
    session: Session;
    user?: {
      merchantId: string;
      authorizedAppId: string;
    };
  }
}
