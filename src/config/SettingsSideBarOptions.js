import profileIcon from '../assets/icons/profileIcon.svg';
import lockIcon from '../assets/icons/lock.svg';
import starIcon from '../assets/icons/star.svg';

export const settingsSideBarOptions = [
  {
    label: 'Edit profile',
    type: 'link',
    iconType: 'static',
    icon: profileIcon,
    routeType: 'static',
    route: 'edit',
    place: 'start',
  },
  {
    label: 'Account privacy',
    type: 'link',
    iconType: 'static',
    icon: lockIcon,
    routeType: 'static',
    route: 'privacy',
    place: 'start',
  },
  {
    label: 'Best friends',
    type: 'link',
    iconType: 'static',
    icon: starIcon,
    routeType: 'static',
    route: 'best_friends',
    place: 'start',
  },
];
