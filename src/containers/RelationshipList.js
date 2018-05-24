// "Just untick that box mate", Gidda Lound.

import React, { Component } from 'react'
import {
  Alert,
  Button,
  Icon,
  Spin,
  List,
  Divider
} from 'antd';

class RelationshipList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      errors: [],
      isLoading: false,
      relationshipTypes: [],
      relationships: []
    }
  }

  componentDidMount() {
    this.fetchResources()
  }

  fetchTicketID() {
    return new Promise((resolve, reject) => {
      window.client.get('ticket.id').then((res) => {
        resolve(res['ticket.id'])
      }).catch((err) => reject(err))
    })
  }

  fetchUserID() {
    return new Promise((resolve, reject) => {
      window.client.get('ticket.requester').then((res) => {
        resolve(res['ticket.requester'].id)
      }).catch((err) => reject(err))
    })
  }

  fetchResources() {
    // Depending on the type of list, we want to grab different information
    // before grabbing the relationships.
    if (this.props.type === 'ticket') {
      this.fetchTicketID().then((id) => {
        this.fetchRelationships(id, 'zen:ticket')
      }).catch((err) => {
        this.setState({
          hasError: true
        })
      })
    }

    if (this.props.type === 'user') {
      this.fetchUserID().then((id) => {
        this.fetchRelationships(id, 'zen:ticket')
      }).catch((err) => {
        this.setState({
          hasError: true
        })
      })
    }
  }

  fetchRelationships(id, url) {
    let relationshipTypes = []
    let relationships = []

    this.setState({
      isLoading: true
    })

    // First, we get all relationship types
    window.client.request('/api/custom_resources/relationship_types')
      .then((res) => {
        // The relationship type objects return a bit too much info,
        // so we're only interested in the key
        relationshipTypes = res.data.map((item) => {
          return {
            key: item.key
          }
        })

        // For each of the relationship types, see which relationships are related to 
        // the current ticket/user (depending on which tab is selected)
        return Promise.all(
          relationshipTypes.map((relationshipType) => {
            return window.client.request(`/api/custom_resources/resources/${url}:${id}/relationships/${relationshipType.key}`)
          })
        )
      })
      .then((res) => {
        // Here we return only the relationships that have resources attached to the current ticket/user
        relationships = res.filter((relationship) => {
          if (relationship.data.length > 0) return relationship
        }).reduce((prev, current) => {
          // The filtering of the relationships return separate arrays
          // so we are concatting them into a single array, and altering the objects
          // inside the array so that we only have the id and target for the relationship.
          return prev.concat(current.data.map((item) => ({ id: item.id, target: item.target })))
        }, [])

        // We then loop through all relationships to grab each resource for each relationship
        return Promise.all(
          relationships.map((relationship) => {
            return window.client.request(`/api/custom_resources/resources/${relationship.target}`)
          })
        )
      })
      .then((res) => {
        // We're only interested in a couple of values from each resource
        // the type, and the attributes
        let resources = res.map((resource) => ({
          type: resource.data.type,
          attributes: resource.data.attributes
        }))

        // In our state, we have resource be mapped to their relationship
        // here we loop through each relationship, and add in the resource at the
        // same index from the resources array above
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
      .catch((err) => {
        this.setState({
          hasError: true
        })
      })
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
      .catch((err) => {
        this.setState({
          hasError: true
        })
      })
  }

  render() {

    if (this.state.hasError) {
      return (
        <Alert
          message='Error'
          description='An unknown error occured. Please refresh the app.'
          type="error" />
      )
    }

    if (this.state.isLoading) {
      return (
        <Spin />
      )
    }

    return (
      <div>
        <div>
          <List
            itemLayout="horizontal"
            dataSource={this.state.relationships}
            renderItem={relationship => (
              <List.Item actions={[<a onClick={this.handleDeleteRelationship.bind(this, relationship.id)}>Delete</a>]}>
                <List.Item.Meta
                  title={relationship.resource.attributes[Object.keys(relationship.resource.attributes)[0]]}
                  description={relationship.resource.type}
                />
              </List.Item>
            )}
          />
        </div>
        <Divider />
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
