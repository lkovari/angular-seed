import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ThemeSettingsComponent } from './theme-settings.component';
import { ThemeService } from '../../services/theme.service';
import { ColorScheduleService } from '../../services/color-schedule.service';
import { provideThemeTesting } from '../../testing/provide-theme-testing';

describe('ThemeSettingsComponent', () => {
  let component: ThemeSettingsComponent;
  let fixture: ComponentFixture<ThemeSettingsComponent>;
  let themeService: ThemeService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ThemeSettingsComponent],
      providers: [...provideThemeTesting(), ThemeService, ColorScheduleService],
    }).compileComponents();

    themeService = TestBed.inject(ThemeService);
    themeService.initialize();

    const createdFixture = TestBed.createComponent(ThemeSettingsComponent);
    fixture = createdFixture;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.inject(ColorScheduleService).stopWatcher();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close modal', () => {
    expect(component.showModal()).toBe(false);
    component.openModal();
    expect(component.showModal()).toBe(true);
    component.closeModal();
    expect(component.showModal()).toBe(false);
  });

  it('should apply selected settings', () => {
    component.openModal();
    component.draftTheme.set('meadow');
    component.draftAutoColorMode.set(false);
    component.selectManualColorMode('dark');
    component.applySettings();

    expect(themeService.activeTheme()).toBe('meadow');
    expect(themeService.autoColorMode()).toBe(false);
    expect(themeService.manualColorMode()).toBe('dark');
    expect(component.showModal()).toBe(false);
  });

  it('should show current theme when reopening modal', () => {
    themeService.applySettings({
      theme: 'magenta-dream',
      autoColorMode: true,
      manualColorMode: 'light',
    });

    component.openModal();

    expect(component.draftTheme()).toBe('magenta-dream');
  });
});
