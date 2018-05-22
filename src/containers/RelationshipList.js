// "Just untick that box mate", Gidda Lound.

import React, { Component } from 'react'
import {
  Button,
  Icon
} from 'antd';

class RelationshipList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      currentID: 0,
      relationshipTypes: [],
      relationships: [],
      resources: {
        product: [],
        event: []
      }
    }
  }

  componentDidMount() {
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

        resources.product.map((item) => {
          return window.client.request(`https://z3n3310.zendesk.com/api/custom_resources/resources/${item.id}/related/${item.type}_has_many_tickets`)
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
                resources: resources
              })
            })
        })

        return resources
      })
      .then((res) => {
        this.setState({
          resources: res
        })
      })
      .catch((err) => {
        console.log(err)
      })

  }

  render() {

    let productList = this.state.resources.product.map((product) => {
      if (product.isValid) {
        return <li key={product.id}>{product.attributes.name}</li>
      }
    })

    return (
      <div>
        <ul>
          {productList}
        </ul>
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
