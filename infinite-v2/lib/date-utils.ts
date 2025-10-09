/**
 * Date formatting utilities that ensure consistent server/client rendering
 * to prevent hydration mismatches
 */

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Use a consistent format that works the same on server and client
  return dateObj.toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC' // Ensure consistent timezone
  });
}

export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Short format for cards and compact displays
  return dateObj.toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function formatDateForDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // ISO format for datetime attributes
  return dateObj.toISOString();
}
