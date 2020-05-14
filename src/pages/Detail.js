import React, { Component } from 'react'
import PropTypes from 'prop-types';

const API_KEY = "78b820a7";

export class Detail extends Component {
    static propTypes = {
        id: PropTypes.string
    }

    state = { movie: {} }

    fetchMovie ({ id }) {
        fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`)
      .then((response) => response.json())
      .then((movie) => {
        console.log({ movie })
        this.setState({ movie })
      });
    }

    goBack () {
        window.history.back()
    }

    componentDidMount () {
        const { id } = this.props
        this.fetchMovie({ id })
    }

    render () {
        const { Actors, Metascore, Poster, Plot, Title } = this.state.movie
        return (
            <div>
                <button onClick={this.goBack}>Volver al Buscador</button>
                <h1>Titulo: {Title}</h1>
                <img src={Poster} alt='' />
                <h3>Actores: {Actors}</h3>
                <span>Rating: {Metascore}</span>
                <p>Sinopsis: {Plot}</p>
            </div>
        )
    }
}
