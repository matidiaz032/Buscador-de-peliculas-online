import React, { Component } from "react";

const API_KEY = "78b820a7";
export class SearchForm extends Component {
  state = {
    inputMovie: "",
  };

  handleChange = (e) => {
    this.setState({ inputMovie: e.target.value }); //obtiene el valor del input despues de realizar el cambio de estado
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { inputMovie } = this.state;

    fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${inputMovie}`)
      .then(res => res.json())
      .then(results => {
        const { Search = [], totalResults = "0" } = results
        console.log({ Search, totalResults })
        this.props.onResults(Search)
      })
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field has-addons">
          <div className="control">
            <input
              className="input"
              onChange={this.handleChange}
              type="text"
              placeholder="Buscar Pelicula"
            />
          </div>
          <div className="control">
            <button className="button is-info">Search</button>
          </div>
        </div>
      </form>
    );
  }
}
