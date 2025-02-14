import profileIcon from '../assets/icons/profileIcon.svg';
import lockIcon from '../assets/icons/lock.svg';
import starIcon from '../assets/icons/star.svg';
import { getLocale } from '../Utils/localization';

export const settingsSideBarOptions = [
  {
    label: getLocale('edit_profile'),
    type: 'link',
    iconType: 'static',
    icon: profileIcon,
    routeType: 'static',
    route: 'edit',
    place: 'start',
  },
  {
    label: getLocale('account_privacy'),
    type: 'link',
    iconType: 'static',
    icon: lockIcon,
    routeType: 'static',
    route: 'privacy',
    place: 'start',
  },
  {
    label: getLocale('best_friends'),
    type: 'link',
    iconType: 'static',
    icon: starIcon,
    routeType: 'static',
    route: 'best-friends',
    place: 'start',
  },
];
