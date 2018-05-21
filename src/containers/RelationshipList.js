import React, { Component } from 'react'
import {
  Button,
  Icon
} from 'antd';

class RelationshipList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      relationshipTypes: [],
      relationships: []
    }
    console.log(this.props.type)
  }

  componentDidMount() {
    let relationshipTypes = []

    // Get all relationship types
    window.client.request('/api/custom_resources/relationship_types')
      .then((res) => {
        // We want to get a list of relationship types that match the current tabs type.
        // we filter each relationshipType so that we only return targets that match the type.
        relationshipTypes = res.data.filter((relationshipType) => {
          if (relationshipType.target[0] === 'zen:' + this.props.type) {
            return relationshipType
          }
          return null
        })
      })
      .then(() => {
        this.setState({
          relationshipTypes
        })
      })
  }

  render() {
    console.log(this.state)
    return (
      <div>
        <div>
          <p>List resources for {this.props.type}</p>
        </div>
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
