import React, { Component } from 'react';

export class SearchForm extends Component{
state = {
        inputMovie: ''
    }

handleChange = (e) => {
    this.setState({ inputMovie: e.target.value })//obtiene el valor del input despues de realizar el cambio de estado
}

handleSubmit = (e) => {
    e.preventDefault()
    alert(this.state.inputMovie)
}

  render(){
    return(
        <form onSubmit={this.handleSubmit}>
        <div className="field has-addons">
          <div className="control">
            <input className="input" onChange={this.handleChange} type="text" placeholder="Buscar Pelicula"/>
          </div>
          <div className="control">
            <button className="button is-info">
                Search
            </button>
          </div>
        </div>
        </form>
        )
    }
}