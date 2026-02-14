import React from 'react';
import { UserListPage } from '../components/UserListPage';

export const Watched = () => (
  <UserListPage
    title="Ya vistas"
    pageTitle="Ya vistas"
    description="Películas y series que ya has visto"
    listKey="watched"
    emptyMessage="Aún no has marcado ninguna película o serie como vista."
    showUserRating={true}
    showExportImport={true}
  />
);
