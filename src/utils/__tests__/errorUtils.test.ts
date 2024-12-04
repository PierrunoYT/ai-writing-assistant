import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatAPIError, sanitizeInput, RateLimiter, retryOperation } from '../errorUtils';
import { ERROR_MESSAGES } from '../../config/constants';

describe('errorUtils', () => {
  describe('formatAPIError', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error');
      expect(formatAPIError(error)).toBe('Test error');
    });

    it('should format string errors', () => {
      expect(formatAPIError('Test error')).toBe('Test error');
    });

    it('should return unknown error for other types', () => {
      expect(formatAPIError(null)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
      expect(formatAPIError(undefined)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
      expect(formatAPIError({})).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should handle strings without special characters', () => {
      const input = 'Hello World';
      expect(sanitizeInput(input)).toBe(input);
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;
    
    beforeEach(() => {
      vi.useFakeTimers();
      rateLimiter = new RateLimiter(2, 1000); // 2 requests per second
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.canMakeRequest()).toBe(true);
      expect(rateLimiter.canMakeRequest()).toBe(true);
      expect(rateLimiter.canMakeRequest()).toBe(false);
    });

    it('should reset after time window', () => {
      expect(rateLimiter.canMakeRequest()).toBe(true);
      expect(rateLimiter.canMakeRequest()).toBe(true);
      expect(rateLimiter.canMakeRequest()).toBe(false);
      
      vi.advanceTimersByTime(1000);
      
      expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    it('should calculate correct time until next window', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      rateLimiter.canMakeRequest();
      const timeUntilNext = rateLimiter.getTimeUntilNextWindow();
      
      expect(timeUntilNext).toBeGreaterThan(0);
      expect(timeUntilNext).toBeLessThanOrEqual(1000);
    });
  });

  describe('retryOperation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should retry failed operations', async () => {
      let attempts = 0;
      const operation = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve('success');
      });

      const resultPromise = retryOperation(operation, 3, 100);
      
      // Handle all the retries
      await vi.runAllTimersAsync();

      const result = await resultPromise;
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Persistent error'));

      const promise = retryOperation(operation, 3, 100);
      
      // Handle all the retries
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Persistent error');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should succeed immediately if operation succeeds', async () => {
      const operation = vi.fn().mockResolvedValue('immediate success');

      const result = await retryOperation(operation, 3, 100);
      expect(result).toBe('immediate success');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
});
