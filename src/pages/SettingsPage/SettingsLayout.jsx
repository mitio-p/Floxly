import { Outlet } from 'react-router-dom';
import SideBar from '../../components/SideBar/SideBar';
import { settingsSideBarOptions } from '../../config/SettingsSideBarOptions';
import { getLocale } from '../../Utils/localization';

export default function SettingsLayout() {
  return (
    <>
      <SideBar title={getLocale('settings')} options={settingsSideBarOptions} />
      <Outlet />
    </>
  );
}
