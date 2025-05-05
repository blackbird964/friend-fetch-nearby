
import { format, isToday, isYesterday } from 'date-fns';

export const formatMessageTime = (timestamp: number) => {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return format(date, 'h:mm a'); // Changed from 'HH:mm' to 'h:mm a' for AM/PM format
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d');
  }
};
