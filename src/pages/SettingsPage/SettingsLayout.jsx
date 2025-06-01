import { Outlet } from 'react-router-dom';
import SideBar from '../../components/SideBar/SideBar';
import { settingsSideBarOptions } from '../../config/SettingsSideBarOptions';
import { getLocale } from '../../Utils/localization';
import SettingsSidebar from '../../components/SettingsSidebar/SettingsSidebar';

export default function SettingsLayout() {
  return (
    <>
      <SettingsSidebar />
      <Outlet />
    </>
  );
}
