import React, { Component } from 'react'
import PropTypes from 'prop-types';

import { ButtonBackToHome } from "../components/ButtonBackToHome";

const API_KEY = "78b820a7";

export class Detail extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.object,
            isExact: PropTypes.bool,
            path: PropTypes.string,
            url: PropTypes.string
        })
    }

    state = { movie: {} }

    fetchMovie ({ id }) {
        fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`)
      .then(response => response.json())
      .then(movie => {
        console.log({ movie })
        this.setState({ movie })
      });
    }

    componentDidMount () {
        console.log(this.props)
        const { movieId } = this.props.match.params
        this.fetchMovie({ id: movieId })
    }

    render () {
        const { Actors, Metascore, Poster, Plot, Title } = 
        this.state.movie
        return (
            <div>
                <ButtonBackToHome />
                <h1>Titulo: {Title}</h1>
                <img src={Poster} alt=''/>
                <h3>Actores: {Actors}</h3>
                <span>Rating: {Metascore}</span>
                <p>Sinopsis: {Plot}</p>
            </div>
        )
    }
}
