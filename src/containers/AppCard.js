import React, { Component } from 'react'
import { Tabs } from 'antd';
import ContentContainer from './ContentContainer';

const TabPane = Tabs.TabPane;

class AppCard extends Component {
  constructor(props) {
    super(props)

    this.handleTabChange = this.handleTabChange.bind(this)
  }

  handleTabChange(e) {
    console.log(e)
  }

  render() {
    return (
      <Tabs defaultActiveKey="1" onChange={this.handleTabChange}>
        <TabPane tab="Ticket" key="1">
          <ContentContainer type='ticket' />
        </TabPane>
        <TabPane tab="User" key="2">
          <ContentContainer type='user' />
        </TabPane>
        <TabPane tab="Organization" key="3">
          <ContentContainer type='organization' />
        </TabPane>
      </Tabs>
    )
  }
}

export default AppCard
