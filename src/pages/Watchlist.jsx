import React from 'react';
import { UserListPage } from '../components/UserListPage';

export const Watchlist = () => (
  <UserListPage
    title="Ver después"
    pageTitle="Ver después"
    description="Películas y series que quieres ver"
    listKey="watchlist"
    emptyMessage="No tienes nada en tu lista. Añade películas o series para ver más tarde."
    showUserRating={false}
    showExportImport={true}
  />
);
