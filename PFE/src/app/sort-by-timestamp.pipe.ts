// sort-by-timestamp.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
export interface Message {
  sender: string;
  content: string;
  timestamp: string;
}
@Pipe({
  name: 'sortByTimestamp'
})
export class SortByTimestampPipe implements PipeTransform {
  transform(messages: Message[]): Message[] {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Sort messages by timestamp in ascending order
    return messages.sort((a, b) => {
      const timeA = this.getTimeFromString(a.timestamp);
      const timeB = this.getTimeFromString(b.timestamp);
      return timeA - timeB;
    });
  }

  private getTimeFromString(timestamp: string): number {
    const [hours, minutes, seconds] = timestamp.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }
}
