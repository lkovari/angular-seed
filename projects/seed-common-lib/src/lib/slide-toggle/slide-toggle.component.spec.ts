import { describe, it, expect, beforeEach, vi } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { type ValidationError, type DisabledReason, type WithOptionalField } from '@angular/forms/signals';

import { SlideToggleComponent } from './slide-toggle.component';

describe('SlideToggleComponent', () => {
  let component: SlideToggleComponent;
  let fixture: ComponentFixture<SlideToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlideToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should implement FormCheckboxControl interface', () => {
      expect(component).toBeDefined();
      expect(component.checked).toBeDefined();
      expect(component.touched).toBeDefined();
      expect(component.disabled).toBeDefined();
      expect(component.readonly).toBeDefined();
    });

    it('should initialize with default values', () => {
      expect(component.checked()).toBe(false);
      expect(component.touched()).toBe(false);
      expect(component.disabled()).toBe(false);
      expect(component.readonly()).toBe(false);
      expect(component.orientation()).toBe('horizontal');
      expect(component.spin()).toBe(false);
    });
  });

  describe('Checked Model (FormCheckboxControl)', () => {
    it('should initialize checked as false', () => {
      expect(component.checked()).toBe(false);
    });

    it('should update checked value', () => {
      component.checked.set(true);
      expect(component.checked()).toBe(true);

      component.checked.set(false);
      expect(component.checked()).toBe(false);
    });

    it('should update checked using update method', () => {
      component.checked.update(v => !v);
      expect(component.checked()).toBe(true);

      component.checked.update(v => !v);
      expect(component.checked()).toBe(false);
    });
  });

  describe('Touched Model', () => {
    it('should initialize touched as false', () => {
      expect(component.touched()).toBe(false);
    });

    it('should set touched to true when toggled', () => {
      component.onToggle();
      expect(component.touched()).toBe(true);
    });

    it('should set touched when checked changes via onToggleChange', () => {
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        writable: false,
      });
      component.onToggleChange(event as unknown as Event);
      expect(component.touched()).toBe(true);
    });
  });

  describe('Disabled State', () => {
    it('should not toggle when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const initialChecked = component.checked();
      component.onToggle();
      expect(component.checked()).toBe(initialChecked);
      expect(component.touched()).toBe(false);
    });

    it('should not toggle when readonly', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      const initialChecked = component.checked();
      component.onToggle();
      expect(component.checked()).toBe(initialChecked);
      expect(component.touched()).toBe(false);
    });

    it('should allow toggle when not disabled and not readonly', () => {
      fixture.componentRef.setInput('disabled', false);
      fixture.componentRef.setInput('readonly', false);
      fixture.detectChanges();
      component.onToggle();
      expect(component.checked()).toBe(true);
      expect(component.touched()).toBe(true);
    });
  });

  describe('Orientation Input', () => {
    it('should default to horizontal', () => {
      expect(component.orientation()).toBe('horizontal');
    });

    it('should accept horizontal orientation', () => {
      fixture.componentRef.setInput('orientation', 'horizontal');
      fixture.detectChanges();
      expect(component.orientation()).toBe('horizontal');
    });

    it('should accept vertical orientation', () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      fixture.detectChanges();
      expect(component.orientation()).toBe('vertical');
    });

    it('should emit orientationChanged event', () => {
      let emittedValue: 'horizontal' | 'vertical' | undefined;
      const subscription = component.orientationChanged.subscribe((value) => {
        emittedValue = value;
      });

      component.onOrientationChange('vertical');
      expect(emittedValue).toBe('vertical');
      subscription.unsubscribe();
    });
  });

  describe('Spin State Management', () => {
    it('should default to false', () => {
      expect(component.spin()).toBe(false);
    });

    it('should store previous state when spin is enabled', () => {
      component.checked.set(true);
      fixture.componentRef.setInput('spin', true);
      fixture.detectChanges();

      expect(component.checked()).toBe(false);
      expect(component.spin()).toBe(true);
    });

    it('should restore previous state when spin is disabled', () => {
      component.checked.set(true);
      fixture.componentRef.setInput('spin', true);
      fixture.detectChanges();
      expect(component.checked()).toBe(false);

      fixture.componentRef.setInput('spin', false);
      fixture.detectChanges();
      expect(component.checked()).toBe(true);
    });

    it('should emit spinChanged event', () => {
      let emittedValue: boolean | undefined;
      const subscription = component.spinChanged.subscribe((value) => {
        emittedValue = value;
      });

      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        writable: false,
      });
      component.onSpinChange(event as unknown as Event);
      expect(emittedValue).toBe(true);
      subscription.unsubscribe();
    });
  });

  describe('Status Computed Signal', () => {
    it('should return "off" when checked is false and spin is false', () => {
      component.checked.set(false);
      fixture.componentRef.setInput('spin', false);
      fixture.detectChanges();
      expect(component.status()).toBe('off');
    });

    it('should return "on" when checked is true and spin is false', () => {
      component.checked.set(true);
      fixture.componentRef.setInput('spin', false);
      fixture.detectChanges();
      expect(component.status()).toBe('on');
    });

    it('should return "wait" when spin is true', () => {
      fixture.componentRef.setInput('spin', true);
      fixture.detectChanges();
      expect(component.status()).toBe('wait');
    });

    it('should return "wait" when spin is true regardless of checked state', () => {
      component.checked.set(true);
      fixture.componentRef.setInput('spin', true);
      fixture.detectChanges();
      expect(component.status()).toBe('wait');
    });
  });

  describe('ShowErrors Computed Signal', () => {
    it('should return false when not touched and not invalid', () => {
      component.touched.set(false);
      fixture.componentRef.setInput('invalid', false);
      fixture.detectChanges();
      expect(component.showErrors()).toBe(false);
    });

    it('should return false when touched but not invalid', () => {
      component.touched.set(true);
      fixture.componentRef.setInput('invalid', false);
      fixture.detectChanges();
      expect(component.showErrors()).toBe(false);
    });

    it('should return false when invalid but not touched', () => {
      component.touched.set(false);
      fixture.componentRef.setInput('invalid', true);
      fixture.detectChanges();
      expect(component.showErrors()).toBe(false);
    });

    it('should return true when both touched and invalid', () => {
      component.touched.set(true);
      fixture.componentRef.setInput('invalid', true);
      fixture.detectChanges();
      expect(component.showErrors()).toBe(true);
    });
  });

  describe('Toggle Functionality', () => {
    it('should toggle checked state on onToggle', () => {
      expect(component.checked()).toBe(false);
      component.onToggle();
      expect(component.checked()).toBe(true);
      component.onToggle();
      expect(component.checked()).toBe(false);
    });

    it('should set touched when toggled', () => {
      expect(component.touched()).toBe(false);
      component.onToggle();
      expect(component.touched()).toBe(true);
    });

    it('should call onToggle from toggleClick', () => {
      const onToggleSpy = vi.spyOn(component, 'onToggle');
      component.toggleClick();
      expect(onToggleSpy).toHaveBeenCalled();
    });
  });

  describe('onToggleChange Event Handler', () => {
    it('should update checked from event target', () => {
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        writable: false,
      });

      component.onToggleChange(event as unknown as Event);
      expect(component.checked()).toBe(true);
      expect(component.touched()).toBe(true);
    });

    it('should not update when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const initialChecked = component.checked();

      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        writable: false,
      });

      component.onToggleChange(event as unknown as Event);
      expect(component.checked()).toBe(initialChecked);
    });

    it('should not update when readonly', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      const initialChecked = component.checked();

      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        writable: false,
      });

      component.onToggleChange(event as unknown as Event);
      expect(component.checked()).toBe(initialChecked);
    });
  });

  describe('Output Events', () => {
    it('should emit valueChanged when checked changes', () => {
      const emittedValues: boolean[] = [];
      const subscription = component.valueChanged.subscribe((value) => {
        emittedValues.push(value);
      });

      // Initial state is false, so effect may have already emitted
      const initialCount = emittedValues.length;

      component.checked.set(true);
      fixture.detectChanges();

      // Should have emitted at least one more time (the true value)
      expect(emittedValues.length).toBeGreaterThan(initialCount);
      expect(emittedValues).toContain(true);
      subscription.unsubscribe();
    });

    it('should emit disabledChanged event', () => {
      let emittedValue: boolean | undefined;
      const subscription = component.disabledChanged.subscribe((value) => {
        emittedValue = value;
      });

      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { checked: true },
        writable: false,
      });
      component.onDisabledChange(event as unknown as Event);
      expect(emittedValue).toBe(true);
      subscription.unsubscribe();
    });
  });

  describe('Template Rendering', () => {
    it('should render slide toggle input', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('[data-test-id="slide-toggle-input"]');
      expect(input).toBeTruthy();
    });

    it('should bind checked state to input', () => {
      component.checked.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('[data-test-id="slide-toggle-input"]');
      expect(input).toBeTruthy();
      expect((input as HTMLInputElement).checked).toBe(true);
    });

    it('should apply disabled attribute when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('[data-test-id="slide-toggle-input"]');
      expect(input).toBeTruthy();
      expect((input as HTMLInputElement).disabled).toBe(true);
    });

    it('should apply vertical class when orientation is vertical', () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const layout = compiled.querySelector('.slide-toggle-layout');
      expect(layout?.classList.contains('vertical')).toBe(true);
    });

    it('should apply disabled class when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const layout = compiled.querySelector('.slide-toggle-layout');
      expect(layout?.classList.contains('disabled')).toBe(true);
    });

    it('should apply spin class when spin is true', () => {
      fixture.componentRef.setInput('spin', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const layout = compiled.querySelector('.slide-toggle-layout');
      expect(layout?.classList.contains('spin')).toBe(true);
    });
  });

  describe('Signal Forms Integration', () => {
    it('should implement FormCheckboxControl for Field directive binding', () => {
      // FormCheckboxControl interface allows the component to work with [field] binding
      // The Field directive is applied in templates, not as a component input
      expect(component.checked).toBeDefined();
      expect(component.touched).toBeDefined();
      expect(component.disabled).toBeDefined();
      expect(component.readonly).toBeDefined();
      expect(component.invalid).toBeDefined();
      expect(component.errors).toBeDefined();
    });

    it('should have model signals for two-way binding', () => {
      // Models allow two-way binding with form fields via Field directive
      expect(component.checked).toBeDefined();
      expect(component.touched).toBeDefined();

      // Verify models can be updated
      component.checked.set(true);
      expect(component.checked()).toBe(true);

      component.touched.set(true);
      expect(component.touched()).toBe(true);
    });
  });

  describe('Input Properties', () => {
    it('should accept knobColor input', () => {
      fixture.componentRef.setInput('knobColor', 'red');
      fixture.detectChanges();
      expect(component.knobColor()).toBe('red');
    });

    it('should accept knobWaitSpinnerColor input', () => {
      fixture.componentRef.setInput('knobWaitSpinnerColor', 'green');
      fixture.detectChanges();
      expect(component.knobWaitSpinnerColor()).toBe('green');
    });

    it('should accept toggleOnStyle input', () => {
      const style = { backgroundColor: 'blue' };
      fixture.componentRef.setInput('toggleOnStyle', style);
      fixture.detectChanges();
      expect(component.toggleOnStyle()).toEqual(style);
    });

    it('should accept toggleOffStyle input', () => {
      const style = { backgroundColor: 'gray' };
      fixture.componentRef.setInput('toggleOffStyle', style);
      fixture.detectChanges();
      expect(component.toggleOffStyle()).toEqual(style);
    });

    it('should accept validValue input', () => {
      fixture.componentRef.setInput('validValue', true);
      fixture.detectChanges();
      expect(component.validValue()).toBe(true);
    });

    it('should accept errors input', () => {
      const errors: readonly WithOptionalField<ValidationError>[] = [];
      fixture.componentRef.setInput('errors', errors);
      fixture.detectChanges();
      expect(component.errors()).toEqual(errors);
    });

    it('should accept disabledReasons input', () => {
      const reasons: readonly WithOptionalField<DisabledReason>[] = [];
      fixture.componentRef.setInput('disabledReasons', reasons);
      fixture.detectChanges();
      expect(component.disabledReasons()).toEqual(reasons);
    });

    it('should accept hidden input', () => {
      fixture.componentRef.setInput('hidden', true);
      fixture.detectChanges();
      expect(component.hidden()).toBe(true);
    });
  });
});

