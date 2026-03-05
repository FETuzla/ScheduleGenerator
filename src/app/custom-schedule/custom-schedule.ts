import { Component, Output, EventEmitter, viewChild, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lecture } from '../models/schedule.model';
import { DrawingTool } from '../drawing-tool/drawing-tool';

@Component({
  selector: 'app-custom-schedule',
  standalone: true,
  imports: [CommonModule, DrawingTool],
  templateUrl: './custom-schedule.html',
  styleUrl: './custom-schedule.scss',
})
export class CustomSchedule {
  public myLectures: Lecture[] = [];

  @Output() lectureClicked = new EventEmitter<Lecture>();

  public addLecture(lecture: Lecture) {
    const isDuplicate = this.myLectures.some(
      (l) => l.name === lecture.name && l.displayName === lecture.displayName && l.day === lecture.day && l.startTime === lecture.startTime && l.endTime === lecture.endTime,
    );
    if (isDuplicate) {
      this.removeLecture(lecture);
      return;
    }

    this.myLectures = [...this.myLectures, lecture];
  }

  public removeLecture(lecture: Lecture) {
    this.myLectures = this.myLectures.filter(
      (l) =>
        !(l.name === lecture.name && l.displayName === lecture.displayName && l.day === lecture.day && l.startTime === lecture.startTime && l.endTime === lecture.endTime),
    );
  }

  public onLectureClick(lecture: Lecture) {
    this.removeLecture(lecture);
  }
}
