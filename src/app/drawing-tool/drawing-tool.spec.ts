import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingTool } from './drawing-tool';

describe('DrawingTool', () => {
  let component: DrawingTool;
  let fixture: ComponentFixture<DrawingTool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingTool]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingTool);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
