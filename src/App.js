import React from 'react';
import './App.css';
import 'bulma/css/bulma.css'
import { Title } from './components/Title'
import { SearchForm } from './components/SearchForm'


function App() {
  return (
    <div className="App">
      <Title>Search Movies</Title>
      <div className='SearchForm-wrapper'>
      <SearchForm />
      </div>
    </div>
  );
}

export default App;
