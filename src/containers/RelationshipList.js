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
        },
        {
          id: "61c96980-5f42-11e8-9594-2d151af981d8",
          target: "703a6c3e-5f41-11e8-9594-bf751b51d8d3",
          resource: {
            type: "event",
            attributes: {
              name: "Summer Party",
              location: "London"
            }
          }
        }
      ]
    }
  }

  componentDidMount() {
    this.fetchResources()
  }

  fetchResources() {
    let ticketID = 0
    let relationshipTypes = []
    let relationships = []

    this.setState({
      isLoading: true
    })

    window.client.get('ticket.id')
      .then((res) => {
        ticketID = res['ticket.id']

        return window.client.request('/api/custom_resources/relationship_types')
      })
      .then((res) => {
        relationshipTypes = res.data.map((item) => {
          return {
            key: item.key
          }
        })

        return Promise.all(
          relationshipTypes.map((relationshipType) => {
            return window.client.request(`/api/custom_resources/resources/zen:ticket:${ticketID}/relationships/${relationshipType.key}`)
          })
        )
      })
      .then((res) => {
        relationships = res.filter((relationship) => {
          if (relationship.data.length > 0) return relationship
        }).reduce((prev, current) => {
          return prev.concat(current.data.map((item) => ({ id: item.id, target: item.target })))
        }, [])

        return Promise.all(
          relationships.map((relationship) => {
            return window.client.request(`/api/custom_resources/resources/${relationship.target}`)
          })
        )
      })
      .then((res) => {
        let resources = res.map((resource) => ({
          type: resource.data.type,
          attributes: resource.data.attributes
        }))

        relationships.map((relationship, index) => {
          relationship.resource = resources[index]
          return relationship
        })

        this.setState({
          isLoading: false,
          relationshipTypes: relationshipTypes,
          relationships: relationships
        })
      })
      .catch((err) => console.log(err))
  }

  handleDeleteRelationship(id) {
    this.setState({
      loading: true
    })

    window.client.request({
      url: `/api/custom_resources/relationships/${id}`,
      type: 'DELETE'
    }).then(() => {
      this.fetchResources()
    })
      .catch((err) => console.log(err))
  }

  render() {

    let relationshipList = this.state.relationships.map((relationship) => (
      <div key={relationship.id}>
        <p>{relationship.resource.type}</p>
        <p>{relationship.resource.attributes.name}</p>
        <button onClick={this.handleDeleteRelationship.bind(this, relationship.id)}>Delete</button>
      </div>
    ))

    if (this.state.isLoading) {
      return (
        <Spin />
      )
    }

    return (
      <div>
        <div>
          {relationshipList}
        </div>
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
