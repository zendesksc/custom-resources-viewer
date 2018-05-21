import React, { Component } from 'react'
import FormContainer from './FormContainer'
import RelationshipList from './RelationshipList'

const MODES = {
  LIST: 1,
  FORM: 2
}

class ContentContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mode: MODES.FORM,
    }

    this.handleFormSuccess = this.handleFormSuccess.bind(this)
    this.handleFormCancel = this.handleFormCancel.bind(this)
  }

  handleFormSuccess() {
    this.setState({
      mode: MODES.LIST
    })
  }

  handleFormCancel() {
    this.setState({
      mode: MODES.LIST
    })
  }

  render() {
    if (this.state.mode === MODES.LIST) {
      return (
        <div>
          <RelationshipList
            type={this.props.type}
          />
        </div>
      )
    }

    if (this.state.mode === MODES.FORM) {
      return (
        <FormContainer
          type={this.props.type}
          onSuccess={this.handleFormSuccess}
          onCancel={this.handleFormCancel}
        />
      )
    }
  }
}

export default ContentContainer
