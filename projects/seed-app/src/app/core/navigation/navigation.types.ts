export interface NavigationItem {
  id?: string;
  labelKey: string;
  icon?: string;
  url?: string;
  routerLink?: string | string[];
  style?: Record<string, unknown> | null | undefined;
  iconStyle?: Record<string, unknown> | null | undefined;
  children?: NavigationItem[];
}
