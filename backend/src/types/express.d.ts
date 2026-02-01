import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
    };
  }
}
