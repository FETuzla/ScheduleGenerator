import { Component, Input } from '@angular/core';
import { Lecture } from '../models/schedule.model'

@Component({
  selector: 'app-custom-schedule',
  imports: [],
  templateUrl: './custom-schedule.html',
  styleUrl: './custom-schedule.scss',
})
export class CustomSchedule {
  @Input() lectures: Lecture[] = [];
  hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
}
