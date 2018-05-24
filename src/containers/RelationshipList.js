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
      relationshipTypes: [],
      relationships: []
    }
  }

  componentDidMount() {
    this.fetchResources()
  }

  fetchResources() {

    if (this.props.type === 'ticket') {
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

    if (this.props.type === 'user') {
      let id = 0
      let relationshipTypes = []
      let relationships = []

      this.setState({
        isLoading: true
      })

      window.client.get('ticket.requester')
        .then((res) => {
          id = res['ticket.requester'].id

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
              return window.client.request(`/api/custom_resources/resources/zen:user:${id}/relationships/${relationshipType.key}`)
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
        <p>{relationship.resource.attributes[Object.keys(relationship.resource.attributes)[0]]}</p>
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
          <Button type='default' onClick={this.props.onAttachResourceButton}>
            <Icon type="plus" /> Attach a resource
          </Button>
        </div>
      </div >
    )
  }
}

export default RelationshipList
