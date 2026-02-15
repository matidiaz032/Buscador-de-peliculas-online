import React from 'react';
import { Link } from 'react-router-dom';
import { Title } from '../components/Title';
import { PageHead } from '../components/PageHead';
import { useUserListsContext } from '../context/UserListsContext';
import { StatsCards } from '../components/dashboard/StatsCards';
import { GenreBars } from '../components/dashboard/GenreBars';
import { RatingDistribution } from '../components/dashboard/RatingDistribution';
import { DataControls } from '../components/dashboard/DataControls';
import { Top9Section } from '../components/dashboard/Top9Section';
import { ParaVosSection } from '../components/dashboard/ParaVosSection';

export const Dashboard = () => {
  const { favorites, watchlist, watched, ratings } = useUserListsContext();

  return (
    <div className="container app-content dashboard-page">
      <PageHead
        title="Perfil"
        description="Tu dashboard de películas y series"
      />
      <Link to="/" className="btn-back" style={{ marginBottom: '1rem' }}>
        ← Volver
      </Link>
      <Title>Tu perfil</Title>

      <StatsCards
        favorites={favorites}
        watchlist={watchlist}
        watched={watched}
        ratings={ratings}
      />

      <GenreBars favorites={favorites} watched={watched} />

      <ParaVosSection />

      <RatingDistribution ratings={ratings} />

      <Top9Section favorites={favorites} watched={watched} />

      <DataControls />
    </div>
  );
};
