import React, { Component } from 'react'
import {
  Button,
  Icon
} from 'antd';

class RelationshipList extends Component {
  render() {
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
