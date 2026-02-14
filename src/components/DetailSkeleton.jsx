import React from 'react';
import { ButtonBackToHome } from './ButtonBackToHome';

export const DetailSkeleton = () => (
  <div className="container app-content detail-page">
    <ButtonBackToHome />
    <div className="detail-skeleton">
      <div className="detail-skeleton__poster" />
      <div className="detail-skeleton__title" />
      <div className="detail-skeleton__meta">
        <div className="detail-skeleton__line" />
        <div className="detail-skeleton__line" />
        <div className="detail-skeleton__line" />
      </div>
      <div className="detail-skeleton__plot">
        <div className="detail-skeleton__line" />
        <div className="detail-skeleton__line" />
        <div className="detail-skeleton__line" style={{ width: '60%' }} />
      </div>
    </div>
  </div>
);
