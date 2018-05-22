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
        products: []
      }
    }
  }

  componentDidMount() {
    let ticketID = 0
    let products = []

    // Get the current ticket ID
    window.client.get('ticket.id')
      .then((res) => ticketID = res['ticket.id'])
      .then(() => {
        // Fetch all resources of type product
        // https://z3n3310.zendesk.com/api/custom_resources/resources?type=product
        return window.client.request('/api/custom_resources/resources?type=product')
      })
      .then((res) => {
        products = res.data
        // For each product, check to see if it has any tickets
        // https://z3n3310.zendesk.com/api/custom_resources/resources/9fbad890-5cd2-11e8-b476-b7812961e0d3/related/product_has_many_tickets

        products.map((product) => {
          product.tickets = []

          return window.client.request(`https://z3n3310.zendesk.com/api/custom_resources/resources/${product.id}/related/product_has_many_tickets`)
            .then((res) => {
              // For each related ticket, see if the ID "zen:ticket:890" matches the current ticket ID.
              // If it matches, add the product to an array of valid products.
              // console.log(products)
              res.data.forEach((related) => {
                if (related.id === `zen:ticket:${ticketID}`) {
                  product.tickets.push(related)
                }
              })
            })
        })

        return products
      })
      .then((res) => {
        this.setState({
          resources: {
            products: res
          }
        })
      })
      .catch((err) => {
        // console.log(err)
      })

  }

  render() {

    let productList = this.state.resources.products.map((product) => {
      return <li key={product.id}>{product.attributes.name}</li>
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
      </div>
    )
  }
}

export default RelationshipList
