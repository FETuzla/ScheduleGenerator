import { Injectable } from '@angular/core';
import {
  Schedule,
  Lecture,
  FirstSelector,
  SecondSelector,
  DayType,
  LectureType,
} from '../models/schedule.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private readonly CSV_URL =
    'https://raspored.adnanmaleskic.com/api/schedule.csv';
  async getSchedules(): Promise<Schedule[]> {
    const response = await fetch(`${this.CSV_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch schedule CSV');
    const text = await response.text();
    return this.parseCSV(text);
  }

  private parseCSV(csv: string): Schedule[] {
    const lines = csv.trim().split('\n');
    const rows = lines.slice(1);
    const scheduleMap = new Map<string, Schedule>();

    for (const row of rows) {
      const cols = this.splitCSVRow(row);
      if (cols.length < 10) continue;

      const [
        year,
        orientation,
        name,
        displayName,
        day,
        startTime,
        endTime,
        location,
        teacher,
        type,
      ] = cols;
      const key = `${year}__${orientation}`;

      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, {
          firstSelector: year as FirstSelector,
          secondSelector: orientation ? (orientation as SecondSelector) : undefined,
          lectures: [],
        });
      }

      scheduleMap.get(key)!.lectures.push({
        name,
        displayName,
        day: day as DayType,
        startTime,
        endTime,
        location,
        teacher,
        type: type.trim() as LectureType,
      });
    }

    return Array.from(scheduleMap.values());
  }

  private splitCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }
}
