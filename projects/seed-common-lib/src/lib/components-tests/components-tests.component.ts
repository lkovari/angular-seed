import {
  Component,
  computed,
  effect,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Field, form, disabled } from '@angular/forms/signals';
import { SlideToggleComponent } from '../slide-toggle';

interface SlideToggleFormValue {
  toggle: boolean;
  orientation: 'horizontal' | 'vertical';
  spin: boolean;
}

@Component({
  selector: 'lib-components-tests',
  imports: [
    CommonModule,
    Field,
    SlideToggleComponent,
  ],
  templateUrl: './components-tests.component.html',
  styleUrl: './components-tests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentsTestsComponent {
  showModal = signal(false);

  slideToggleModel = signal<SlideToggleFormValue>({
    toggle: false,
    orientation: 'horizontal',
    spin: false,
  });

  isToggleDisabled = signal<boolean>(false);

  // SignalForm
  slideToggleForm = form(this.slideToggleModel, (fieldPath) => {
    disabled(fieldPath.toggle, () => this.isToggleDisabled());
  });

  slideToggleStatus = signal<string>('off');

  formStatus = computed(() => {
    return this.slideToggleForm().valid() ? 'VALID' : 'INVALID';
  });

  formValue = computed(() => {
    return this.slideToggleModel();
  });

  orientationValue = computed(() => {
    return this.slideToggleModel().orientation;
  });

  spinValue = computed(() => {
    return this.slideToggleModel().spin;
  });

  constructor() {
    this.updateSlideToggleStatus();
    
    effect(() => {
      this.slideToggleModel();
      this.updateSlideToggleStatus();
    });
  }

  private updateSlideToggleStatus(): void {
    const model = this.slideToggleModel();
    const toggleValue = model.toggle;
    const spinValue = model.spin;

    if (spinValue) {
      this.slideToggleStatus.set('wait');
    } else {
      this.slideToggleStatus.set(toggleValue ? 'on' : 'off');
    }
  }

  onToggleValueChange(value: boolean): void {
    this.slideToggleModel.update(model => ({ ...model, toggle: value }));
    this.updateSlideToggleStatus();
  }

  onOrientationChange(orientation: 'horizontal' | 'vertical'): void {
    this.slideToggleModel.update(model => ({ ...model, orientation }));
  }

  onSpinChange(spin: boolean): void {
    this.slideToggleModel.update(model => ({ ...model, spin }));
    this.updateSlideToggleStatus();
  }

  onDisabledChange(disabled: boolean): void {
    this.isToggleDisabled.set(disabled);
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }
}

