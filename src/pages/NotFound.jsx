import React from 'react';
import { ButtonBackToHome } from '../components/ButtonBackToHome';
import { PageHead } from '../components/PageHead';

export const NotFound = () => (
  <div className="container not-found-page">
    <PageHead title="404" description="Página no encontrada" />
    <h1 className="title">404</h1>
    <h2 className="subtitle">No existe la página</h2>
    <ButtonBackToHome />
  </div>
);
