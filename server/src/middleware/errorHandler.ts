import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Prisma unique constraint violation
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  ) {
    res.status(409).json({ success: false, error: 'A record with that value already exists.' });
    return;
  }

  // Prisma record not found
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2025'
  ) {
    res.status(404).json({ success: false, error: 'Record not found.' });
    return;
  }

  console.error('[Unhandled Error]', err);
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ success: false, error: message });
}
