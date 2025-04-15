export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export type ErrorHandler = (error: unknown) => AppError;

export const handleError: ErrorHandler = (error: unknown): AppError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
    };
  }

  return {
    message: typeof error === 'string' ? error : 'An unknown error occurred',
    details: error,
  };
};

