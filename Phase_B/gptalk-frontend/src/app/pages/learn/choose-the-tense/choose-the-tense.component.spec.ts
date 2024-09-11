import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseTheTenseComponent } from './choose-the-tense.component';

describe('ChooseTheTenseComponent', () => {
  let component: ChooseTheTenseComponent;
  let fixture: ComponentFixture<ChooseTheTenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseTheTenseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseTheTenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
