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
      isLoading: false
    }
  }

  componentDidMount() {
    // This function sets up everything to show related resources.
    // In this first iteration, I'm only worrying about resources that relate
    // to the specific ticket.

    let resourceTypes = []
    let relationshipTypes = []
    let resources = []

    Promise.all([
      window.client.request('/api/custom_resources/resource_types'),
      window.client.request('/api/custom_resources/relationship_types')
    ])
      .then((res) => {
        if (res[0].errors.length > 0) console.log(res[0].errors)
        resourceTypes = res[0].data
        relationshipTypes = res[1].data

        return Promise.all(
          resourceTypes.map((resourceType) => {
            return window.client.request(`/api/custom_resources/resources?type=${resourceType.key}`)
          })
        )
      })
      .then((res) => {
        // Set all resources for each type
        res.forEach((resource) => {
          let currentResource = { title: '', items: [] }
          currentResource.title = resource.data[0].type
          currentResource.items = resource.data
          resources.push(currentResource)
        })

        // Get related relationships for each resource
        for (let i = 0; i < resources.length; i++) {
          for (let j = 0; j < resources[i].items.length; j++) {
            let item = resources[i].items[j]
            window.client.request(`/api/custom_resources/resources/${item.id}/relationships/${item.type}_has_many_tickets`)
              .then((relationships) => {
                resources[i].items[j].relationships = relationships.data
              })
          }
        }
      })
      .then((res) => {
        console.log('this comes after', resources)
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
