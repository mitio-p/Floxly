import houseIcon from '../assets/icons/house.svg';
import searchIcon from '../assets/icons/search.svg';
import messagesIcon from '../assets/icons/message.svg';
import notificationsIcon from '../assets/icons/notifications.svg';
import createIcon from '../assets/icons/create.svg';
import logoutIcon from '../assets/icons/exit.svg';

export const rootSideBarOptions = [
  { label: 'Home', type: 'link', iconType: 'static', icon: houseIcon, routeType: 'static', route: '/', place: 'start' },
  {
    label: 'Search',
    type: 'link',
    iconType: 'static',
    icon: searchIcon,
    routeType: 'static',
    route: '/search',
    place: 'start',
  },
  {
    label: 'Messages',
    type: 'link',
    iconType: 'static',
    icon: messagesIcon,
    routeType: 'static',
    route: '/messages',
    place: 'start',
  },
  {
    label: 'Notifications',
    type: 'link',
    iconType: 'static',
    icon: notificationsIcon,
    routeType: 'static',
    route: '/notifications',
    place: 'start',
  },
  {
    label: 'Create',
    type: 'link',
    iconType: 'static',
    icon: createIcon,
    routeType: 'static',
    route: '/create',
    place: 'start',
  },
  { label: 'Profile', type: 'link', iconType: 'profileIcon', routeType: 'profileRoute', place: 'start' },
  { label: 'Log out', type: 'button', iconType: 'static', icon: logoutIcon, onClick: logOut, place: 'end' },
];

async function logOut(navigate) {
  const response = await fetch('http://localhost:3000/auth/logout', { credentials: 'include' });

  if (response.ok) {
    navigate('/auth?mode=login');
  }
}
