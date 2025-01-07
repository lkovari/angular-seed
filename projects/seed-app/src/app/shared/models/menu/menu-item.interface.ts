export interface MenuItem {
  id?: string;
  label: string;
  icon?: string;
  url?: string;
  routerLink?: any;
  style?: { [klass: string]: any } | null | undefined;
  iconStyle?: { [klass: string]: any } | null | undefined;
  children?: MenuItem[];
}
