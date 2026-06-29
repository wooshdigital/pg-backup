import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  try {
    return uuidv4();
  } catch {
    // Fallback for environments without crypto support
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}