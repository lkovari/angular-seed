import {
  Component,
  effect,
  EffectRef,
  OnDestroy,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnDestroy {
  private _sidebarVisible = signal(true);
  get sidebarVisible(): boolean {
    return this._sidebarVisible();
  }
  set sidebarVisible(value: boolean) {
    this._sidebarVisible.set(value);
  }

  onSidebarVisibleChange = output<boolean>();

  private _effectRef: EffectRef = effect(() => {
    this.onSidebarVisibleChange.emit(this._sidebarVisible());
  });

  constructor() {}

  toggleSidebar(): void {
    this._sidebarVisible.update((value) => !value);
  }

  ngOnDestroy(): void {
    if (this._effectRef) {
      this._effectRef.destroy();
    }
  }
}
