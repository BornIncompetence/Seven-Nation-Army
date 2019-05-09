import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import store, { history } from './configureStore';

// Styles
import 'bootstrap/dist/css/bootstrap.css';
import './App.scss';

// routes
import routes from './routes';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div className="App">
            <div className="wrap">{routes}</div>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;
