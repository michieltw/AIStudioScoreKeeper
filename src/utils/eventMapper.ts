import { EventType } from '../types';

export function mapDbEventTypeToApp(dbEventType: string): EventType {
  if (dbEventType.startsWith('goal')) {
    return 'goal';
  } else if (dbEventType === 'shot_on_goal') {
    return 'shot';
  } else if (dbEventType === 'faceoff_won') {
    return 'faceoff';
  } else if (dbEventType === 'penalty') {
    return 'penalty';
  } else if (dbEventType === 'icing') {
    return 'icing';
  } else if (dbEventType === 'offside') {
    return 'offside';
  }

  return 'shot'; // fallback
}
