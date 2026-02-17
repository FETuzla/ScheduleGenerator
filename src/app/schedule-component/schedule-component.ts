import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SUBJECTS } from '../data/subjects.data';
import { Subject } from '../models/subject.model';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-component.html',
  styleUrl: './schedule-component.scss',
})
export class ScheduleComponent {

  // Using signal (modern Angular 17)
  subjects = signal<Subject[]>(SUBJECTS);

  selectedSubject = signal<Subject | null>(null);

  selectSubject(subject: Subject) {
    this.selectedSubject.set(subject);
  }
}
