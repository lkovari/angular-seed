import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsTestsComponent } from './components-tests.component';

describe('ComponentsTestsComponent', () => {
  let component: ComponentsTestsComponent;
  let fixture: ComponentFixture<ComponentsTestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentsTestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentsTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

