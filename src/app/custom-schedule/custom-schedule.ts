import { Component, Output, EventEmitter } from '@angular/core';
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
    const isDuplicate = this.myLectures.some(l => 
      l.name === lecture.name && 
      l.day === lecture.day && 
      l.startTime === lecture.startTime
    );
    if (isDuplicate) return;

    this.myLectures = [...this.myLectures, lecture];
  }

  public onLectureClick(lecture: Lecture) {
    this.lectureClicked.emit(lecture);
  }
}