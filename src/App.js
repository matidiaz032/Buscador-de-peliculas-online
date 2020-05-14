import React, { Component } from "react";
import "./App.css";
import "bulma/css/bulma.css";
import { Title } from "./components/Title";
import { SearchForm } from "./components/SearchForm";
import { MoviesList } from "./components/MoviesList";
import { Detail } from './pages/Detail'

class App extends Component {
  state = { usedSearch: false, results: [] };

  handleResults = (results) => {
    this.setState({ results, usedSearch: true });
  };

  renderResults () {
    return this.state.results.length === 0 
      ? <p>Sin Resultados</p>
      : <MoviesList movies={this.state.results} /> 
      }

  render() {
    const url = new URL(document.location)
    const hasId = url.searchParams.has('id')

    if (hasId) {
      return <Detail id={url.searchParams.get('id')} />
    }

    return (
      <div className="App">
        <Title>Search Movies</Title>
        <div className="SearchForm-wrapper">
          <SearchForm onResults={this.handleResults} />
        </div>
        {this.state.usedSearch
        ? this.renderResults()
        : <small>Use el formulario para buscar una pelicula(en ingles)</small>
        }
      </div>
    );
  }
}

export default App;
