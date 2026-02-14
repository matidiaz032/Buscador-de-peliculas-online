import React from 'react';
import { UserListPage } from '../components/UserListPage';

export const Favorites = () => (
  <UserListPage
    title="Mis Favoritos"
    pageTitle="Favoritos"
    description="Tus películas y series favoritas"
    listKey="favorites"
    emptyMessage="No tienes películas guardadas. Busca y añade algunas."
    showUserRating={false}
    showExportImport={true}
  />
);
