import { Component } from '@angular/core';
import { SUBJECTS } from '../data/subjects.data';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule-component.html',
  styleUrls: ['./schedule-component.scss'],
})
export class ScheduleComponent {

	subjects = SUBJECTS;

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  startHour = 8;
  endHour = 20;

  // Convert HH:mm → total minutes
  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  // Grid row start (30-min steps)
  getGridRow(start: string): number {
    const totalMinutes = this.timeToMinutes(start);
    const startMinutes = this.startHour * 60;

    return Math.floor((totalMinutes - startMinutes) / 30) + 2;
    // +2 because:
    // row 1 = header
    // row 2 = first time slot
  }

  // How many 30-min blocks it spans
  getRowSpan(start: string, end: string): number {
    const duration = this.timeToMinutes(end) - this.timeToMinutes(start);
    return duration / 30;
  }

  getGridColumn(day: string): number {
    return this.days.indexOf(day) + 2;
  }

  get timeSlots(): string[] {
    const slots: string[] = [];

    for (let h = this.startHour; h < this.endHour; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }

    return slots;
  }
}
