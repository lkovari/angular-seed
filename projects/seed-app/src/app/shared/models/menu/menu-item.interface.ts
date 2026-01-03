export interface MenuItem {
  id?: string;
  label: string;
  icon?: string;
  url?: string;
  routerLink?: string | string[];
  style?: Record<string, unknown> | null | undefined;
  iconStyle?: Record<string, unknown> | null | undefined;
  children?: MenuItem[];
}
