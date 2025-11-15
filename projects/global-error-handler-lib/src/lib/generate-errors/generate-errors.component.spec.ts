import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateErrorsComponent } from './generate-errors.component';

describe('GenerateErrorsComponent', () => {
  let component: GenerateErrorsComponent;
  let fixture: ComponentFixture<GenerateErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateErrorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
