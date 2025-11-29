export interface MenuItem {
  id?: string;
  label: string;
  icon?: string;
  url?: string;
  routerLink?: string | string[];
  style?: { [klass: string]: unknown } | null | undefined;
  iconStyle?: { [klass: string]: unknown } | null | undefined;
  children?: MenuItem[];
}
