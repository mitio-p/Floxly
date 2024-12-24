import { createContext } from 'react';

const UserCTX = createContext({ user: null, setUser: () => {} });

export default UserCTX;
