import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Detail } from './pages/Detail';
import { Favorites } from './pages/Favorites';
import { Watchlist } from './pages/Watchlist';
import { Watched } from './pages/Watched';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { Nav } from './components/Nav';
import 'bulma/css/bulma.css';
import './App.css';

function App() {
  return (
    <div className="app">
      <Nav />
      <main className="section">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/watched" element={<Watched />} />
          <Route path="/perfil" element={<Dashboard />} />
          <Route path="/detail/:movieId" element={<Detail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
