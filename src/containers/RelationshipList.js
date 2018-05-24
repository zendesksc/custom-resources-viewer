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
      type: 'ticket',
      relationshipTypes: [
        {
          key: "organizations_products"
        },
        {
          key: "tickets_products"
        },
        {
          key: "users_products"
        }
      ],
      relationships: [
        {
          id: "65616f3c-5f40-11e8-9594-21b1f09c39a1",
          target: "3ccfff5b-5f40-11e8-9594-65bcc90c02e0",
          resource: {
            type: "product",
            attributes: {
              name: "iPhone 8",
              description: "The apple iPhone."
            }
          }
        },
        {
          id: "8106326f-5f41-11e8-9594-4d9f7bf4f983",
          target: "6075dcdd-5f41-11e8-9594-71bdabb17881",
          resource: {
            type: "product",
            attributes: {
              name: "Google Pixel 2",
              description: "The google phone"
            }
          }
        }
      ]
    }
  }

  componentDidMount() {
    let ticketID = 0

    window.client.get('ticket.id')
      .then((res) => {
        ticketID = res['ticket.id']

        return window.client.request('/api/custom_resources/relationship_types')
      })
      .then((res) => {
        this.setState({
          relationshipTypes: res.data.map((item) => {
            return {
              key: item.key
            }
          })
        })
      })
      .catch((err) => console.log(err))
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
