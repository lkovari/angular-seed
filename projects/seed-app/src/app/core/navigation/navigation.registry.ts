import { type NavigationItem } from './navigation.types';
import { HOME_NAV_ITEM } from '../../features/home/home.navigation';
import { FEATURE_A_NAV_ITEM } from '../../features/feature-a/feature-a.navigation';
import { FEATURE_B_NAV_ITEM } from '../../features/feature-b/feature-b.navigation';

export const APP_NAV_ITEMS: NavigationItem[] = [
  HOME_NAV_ITEM,
  FEATURE_A_NAV_ITEM,
  FEATURE_B_NAV_ITEM,
];
