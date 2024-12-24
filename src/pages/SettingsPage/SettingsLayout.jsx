import SideBar from '../../components/SideBar/SideBar';
import { settingsSideBarOptions } from '../../config/SettingsSideBarOptions';

export default function SettingsLayout() {
  return (
    <>
      <SideBar title="Settings" options={settingsSideBarOptions} />
    </>
  );
}
