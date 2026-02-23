import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSchedule } from './custom-schedule';

describe('CustomSchedule', () => {
  let component: CustomSchedule;
  let fixture: ComponentFixture<CustomSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
