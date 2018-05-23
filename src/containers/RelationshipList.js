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
      currentID: 0,
      relationshipTypes: [],
      relationships: [],
      resources: {}
    }
  }

  componentDidMount() {
    this.setState({
      isLoading: true
    })

    let ticketID = 0
    let resources = {}

    // Get the current ticket ID
    window.client.get('ticket.id')
      .then((res) => ticketID = res['ticket.id'])
      .then(() => {
        // Fetch all resource types
        // https://z3n3310.zendesk.com/api/custom_resources/resource_types
        return window.client.request('/api/custom_resources/resource_types')
      })
      .then((res) => {
        let resourceTypes = res.data
        // Fetch all resources of each resource type
        // https://z3n3310.zendesk.com/api/custom_resources/resources?type=product
        return Promise.all(
          resourceTypes.map((resourceType) => {
            return window.client.request(`/api/custom_resources/resources?type=${resourceType.key}`)
          })
        )
      })
      .then((resourceType) => {
        // This is where we will create the resources object that
        // eventually will be set to the state
        let resources = {}

        resourceType.forEach((item) => {
          let type = item.data[0].type
          let currentType = []

          item.data.forEach((resource) => {
            currentType.push(resource)
          })

          resources[type] = currentType
        })

        for (let prop in resources) {
          // Resources is an object, so we need to loop over each prop
          // in order to get the right resource
          resources[prop].map((item) => {
            return window.client.request(`/api/custom_resources/resources/${item.id}/related/${item.type}_has_many_tickets`)
              .then((res) => {
                res.data.forEach((related) => {
                  // If the current ticket is related to the current resource
                  // mark the current resource as valid.
                  // Valid means it is the right resource for this ticket.
                  if (related.id === `zen:ticket:${ticketID}`) {
                    item.isValid = true
                  } else {
                    item.isValid = false
                  }
                })
                // I'm not sure this is the best way to do this... but it seems to work,
                // We're setting the state of the component inside a nested promise.
                this.setState({
                  isLoading: false,
                  resources: resources
                })
              })
          })
        }

        return resources
      })
      .then((res) => {
        this.setState({
          isLoading: false,
          resources: res
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  generateResourceListData() {
    let resourceList = []
    for (let prop in this.state.resources) {
      // Create a current resource object to add to resourceList
      let currentResource = {
        title: '',
        items: []
      }
      // In this loop, prop refers to the current resource type
      let currentResourceType = this.state.resources[prop]
      if (currentResourceType !== undefined) {
        // Probably a bit lazy, but I'm grabbing the name of the resource type
        // by taking the type of the first current resource
        currentResource.title = currentResourceType[0].type
        // Go through each resource on this type
        currentResourceType.forEach((resource) => {
          // Check if it's a valid resource i.e it belongs to the current ticket
          if (resource.isValid) {
            // Push the current name
            // TODO: update this so it just picks the first attribute
            currentResource.items.push({
              id: resource.id,
              name: resource.attributes.name
            })
          }
        })
      }
      resourceList.push(currentResource)
    }
    return resourceList
  }

  renderResourceList() {
    let data = this.generateResourceListData()
    let domData = []

    data.forEach((resource) => {
      // Only do this for resources that actually belong to this ticket
      // resource.items in this case is a list of strings
      if (resource.items.length > 0) {
        // Push a new list element to the dom array
        domData.push(
          <List
            key={resource.title}
            header={<div><strong>{resource.title}</strong></div>}
            dataSource={resource.items}
            renderItem={item => (
              <List.Item>
                {item.name}
                <Button icon="delete" shape="circle" />
              </List.Item>
            )}
          />
        )
      }
    })

    return domData
  }

  render() {

    if (this.state.isLoading) {
      return (
        <Spin />
      )
    }

    return (
      <div>
        {this.renderResourceList()}
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
