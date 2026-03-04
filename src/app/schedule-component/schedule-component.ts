import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Schedule, Lecture } from '../models/schedule.model';
import { DrawingTool } from '../drawing-tool/drawing-tool';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, DrawingTool],
  templateUrl: './schedule-component.html',
  styleUrl: './schedule-component.scss',
})
export class ScheduleComponent {
  @Input() lectures: Lecture[] | null = null;
  @Output() lectureSelected = new EventEmitter<Lecture>();

  public onLectureClick(lecture: Lecture) {
    this.lectureSelected.emit(lecture);
  }
}
