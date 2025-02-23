
/**
 * Implements an exponential backoff retry mechanism
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 200
): Promise<T> {
  let currentTry = 0;
  let lastError: Error | null = null;

  while (currentTry < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Operation failed');
      currentTry++;
      
      if (currentTry === maxRetries) break;
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, currentTry - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Operation failed after maximum retries');
}
