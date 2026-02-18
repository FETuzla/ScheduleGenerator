import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Schedule, Lecture } from '../models/schedule.model';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-component.html',
  styleUrl: './schedule-component.scss',
})
export class ScheduleComponent {
  @Input({ required: true })
  schedule!: Schedule | null;

  selectedLecture = signal<Lecture | null>(null);

  selectLecture(lecture: Lecture) {
    this.selectedLecture.set(lecture);
  }
}
