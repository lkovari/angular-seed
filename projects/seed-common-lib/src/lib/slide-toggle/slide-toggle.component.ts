import { ChangeDetectionStrategy, Component, computed, effect, input, model, output } from '@angular/core';
import { type FormCheckboxControl, type ValidationError, type DisabledReason, type WithOptionalField } from '@angular/forms/signals';

@Component({
  selector: 'lib-slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrl: './slide-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
  // SignalForm - FormCheckboxControl or FormValueControl implementation (replaces ControlValueAccessor)
export class SlideToggleComponent implements FormCheckboxControl {
  checked = model<boolean>(false);
  touched = model<boolean>(false);

  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  invalid = input<boolean>(false);
  errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  disabledReasons = input<readonly WithOptionalField<DisabledReason>[]>([]);

  orientation = input<'horizontal' | 'vertical'>('horizontal');
  spin = input<boolean>(false);
  validValue = input<boolean | null>(null);
  knobColor = input<string>('magenta');
  knobWaitSpinnerColor = input<string>('blue');
  toggleOnStyle = input<Record<string, string>>({});
  toggleOffStyle = input<Record<string, string>>({});

  valueChanged = output<boolean>();
  orientationChanged = output<'horizontal' | 'vertical'>();
  spinChanged = output<boolean>();
  disabledChanged = output<boolean>();

  private previousState: boolean | undefined = undefined;

  constructor() {
    effect(() => {
      this.valueChanged.emit(this.checked());
    });

    effect(() => {
      const v = this.spin();
      if (v) {
        this.storePreviousState();
        this.checked.set(false);
      } else {
        this.restorePreviousState();
      }
    });
  }

  showErrors = computed(() => this.touched() && this.invalid());

  status = computed(() => {
    if (this.spin()) {
      return 'wait';
    } else {
      if (this.checked()) {
        return 'on';
      } else {
        return 'off';
      }
    }
  });

  onToggle(): void {
    if (this.disabled() || this.readonly()) return;
    this.checked.update(v => !v);
    this.touched.set(true);
  }

  toggleClick(): void {
    this.onToggle();
  }

  private storePreviousState() {
    this.previousState ??= this.checked();
  }

  private restorePreviousState() {
    if (this.previousState !== undefined) {
      this.checked.set(this.previousState);
      this.previousState = undefined;
    }
  }

  private isInputElement(target: EventTarget | null): target is HTMLInputElement {
    return target instanceof HTMLInputElement;
  }

  onToggleChange(event: Event): void {
    if (this.disabled() || this.readonly()) return;
    if (!this.isInputElement(event.target)) return;
    this.checked.set(event.target.checked);
    this.touched.set(true);
  }

  onSpinChange(event: Event): void {
    if (!this.isInputElement(event.target)) return;
    this.spinChanged.emit(event.target.checked);
  }

  onOrientationChange(value: 'horizontal' | 'vertical'): void {
    this.orientationChanged.emit(value);
  }

  onDisabledChange(event: Event): void {
    if (!this.isInputElement(event.target)) return;
    this.disabledChanged.emit(event.target.checked);
  }
}

