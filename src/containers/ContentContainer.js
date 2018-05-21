import React, { Component } from 'react'
import {
  Row,
  Col
} from 'antd';
import FormContainer from './FormContainer';

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
  }

  handleFormSuccess() {
    this.setState({
      mode: MODES.LIST
    })
  }

  render() {
    if (this.state.mode === MODES.LIST) {
      return (
        <div>
          <Row>
            <Col span={24}>
              Product
            </Col>
          </Row>
        </div>
      )
    }

    if (this.state.mode === MODES.FORM) {
      return (
        <FormContainer
          type={this.props.type}
          onSuccess={this.handleFormSuccess}
        />
      )
    }
  }
}

export default ContentContainer
