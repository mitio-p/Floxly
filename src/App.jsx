import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import RootLayout, { loader as rootLoader } from './components/RootLayout/RootLayout';
import HomePage from './pages/HomePage/HomePage';
import AuthPage, { action as authAction, loader as authLoader } from './pages/AuthPage/AuthPage';
import UserCTX from './Context/UserCTX';
import { useState } from 'react';
import UserPage, { loader as userLoader } from './pages/UserPage/UserPage';
import { action as pictureUploadAction } from './components/Dialogs/PictureDialog';
import NotificationCTX from './Context/NotificationCTX';
import Notification from './components/Notification/Notification';
import ResetPasswordPage, {
  loader as resetPasswordLoader,
  action as resetPasswordAction,
} from './pages/ResetPasswordPage/ResetPasswordPage';
import ErrorElement from './components/ErrorElement/ErrorElement';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    loader: rootLoader,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'search',
      },
      {
        path: 'messages',
      },
      {
        path: 'notifications',
      },
      {
        path: 'create',
      },
      {
        path: 'user/:username',
        loader: userLoader,
        action: pictureUploadAction,
        element: <UserPage />,
      },
    ],
  },
  {
    path: 'auth',
    element: <AuthPage />,
    loader: authLoader,
    action: authAction,
  },
  {
    path: 'reset-password',
    element: <ResetPasswordPage />,
    loader: resetPasswordLoader,
    action: resetPasswordAction,
  },
]);

function App() {
  const [userData, setUserData] = useState({});
  const [notification, setNotification] = useState();
  return (
    <UserCTX.Provider value={{ user: userData, setUser: setUserData }}>
      <NotificationCTX.Provider value={setNotification}>
        <Notification message={notification} onClose={() => setNotification('')} />
        <RouterProvider router={router} />
      </NotificationCTX.Provider>
    </UserCTX.Provider>
  );
}

export default App;
