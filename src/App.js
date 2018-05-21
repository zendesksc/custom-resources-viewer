import React, { Component } from 'react';
import AppCard from './containers/AppCard'
import 'antd/dist/antd.css';
import './style.css'

class App extends Component {
  render() {
    return (
      <div>
        <AppCard />
      </div>
    );
  }
}

export default App;
