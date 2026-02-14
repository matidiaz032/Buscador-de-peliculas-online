import React from 'react';
import { Helmet } from 'react-helmet-async';

export const PageHead = ({ title, description }) => (
  <Helmet>
    <title>{title} | Buscador de Películas</title>
    <meta name="description" content={description} />
  </Helmet>
);
