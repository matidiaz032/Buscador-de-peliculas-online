import React, { createContext, useContext } from 'react';
import { useUserLists } from '../hooks/useUserLists';

const UserListsContext = createContext(null);

export const UserListsProvider = ({ children }) => {
  const lists = useUserLists();
  return (
    <UserListsContext.Provider value={lists}>
      {children}
    </UserListsContext.Provider>
  );
};

export const useUserListsContext = () => {
  const ctx = useContext(UserListsContext);
  if (!ctx) {
    throw new Error('useUserListsContext must be used within UserListsProvider');
  }
  return ctx;
};
