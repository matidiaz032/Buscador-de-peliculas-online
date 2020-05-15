import React, { Component } from "react";
import { Title } from "../components/Title";
import { SearchForm } from "../components/SearchForm";
import { MoviesList } from "../components/MoviesList";

export class Home extends Component {
  state = { usedSearch: false, results: [] };

  handleResults = (results) => {
    this.setState({ results, usedSearch: true });
  };

  renderResults() {
    return this.state.results.length === 0 ? (
      <p>Sin Resultados</p>
    ) : (
      <MoviesList movies={this.state.results} />
    );
  }

  render() {
    return (
      <div>
        <Title>Search Movies</Title>
        <div className="SearchForm-wrapper">
          <SearchForm onResults={this.handleResults} />
        </div>
        {this.state.usedSearch ? (
          this.renderResults()
        ) : (
          <small>Use el formulario para buscar una pelicula(en ingles)</small>
        )}
      </div>
    );
  }
}
