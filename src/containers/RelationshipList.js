// "Just untick that box mate", Gidda Lound.

import React, { Component } from 'react'
import {
  Button,
  Icon,
  Spin,
  List
} from 'antd';

class RelationshipList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      resourceTypes: [
        {
          key: 'event',
          resources: [
            {
              id: '409a1b83-5cd9-11e8-b476-23ecb7f31fbe',
              attributes: {
                name: 'Summer Party',
                location: 'London',
                season: 'Summer'
              }
            },
            {
              id: '4738e6b4-5cd9-11e8-b476-4db8ad858198',
              attributes: {
                name: 'Sales Kickoff',
                location: 'San Francisco',
                season: 'Winter'
              }
            }
          ]
        },
        {
          key: 'product',
          resources: [
            {
              id: '9fbad890-5cd2-11e8-b476-b7812961e0d3',
              attributes: {
                name: 'iPhone 8',
                description: 'The iPhone... 8'
              }
            },
            {
              id: '4d8c02e5-5cd9-11e8-b476-0b220ee12dca',
              attributes: {
                name: 'Google Pixel 2 XL',
                description: 'The google phone'
              }
            }
          ]
        }
      ]
    }
  }

  componentDidMount() {

  }

  render() {

    if (this.state.isLoading) {
      return (
        <Spin />
      )
    }

    return (
      <div>
        <div>
          <Button type='default'>
            <Icon type="plus" /> Attach a resource
          </Button>
        </div>
      </div >
    )
  }
}

export default RelationshipList
