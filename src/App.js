import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import { Detail } from './pages/Detail';
import { Home } from './pages/Home';
import "./App.css";
import "bulma/css/bulma.css";

class App extends Component {
  render() {
    return (
      <div className="App"> 
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/detail/:id' component={Detail} />
      </Switch>
      </div>
    );
  }
}

export default App;
