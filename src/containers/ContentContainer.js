import React, { Component } from 'react'
import {
  Row,
  Col,
  Form,
  Select,
  Button
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

const MODES = {
  LIST: 1,
  FORM: 2
}

class ContentContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isReadyToSubmit: false,
      mode: MODES.FORM,
      resourceTypes: [],
      resources: [],
      selectedResourceType: '',
      selectedResourceID: '',
      errors: []
    }

    this.handleResourceTypeChange = this.handleResourceTypeChange.bind(this)
    this.handleResourceChange = this.handleResourceChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    this.fetchResourceTypes()
  }

  fetchResourceTypes() {
    window.client.request('/api/custom_resources/resource_types')
      .then((res) => {
        this.setState({
          resourceTypes: res.data
        })
      })
  }

  fetchResources(type) {
    window.client.request('/api/custom_resources/resources?type=' + type)
      .then((res) => {
        this.setState({
          resources: res.data
        })
      })
  }

  handleResourceTypeChange(type) {
    this.setState({
      selectedResourceType: type
    })
    this.fetchResources(type)
  }

  handleResourceChange(resourceID) {
    this.setState({
      // Once we have resources, we can show the select box to select 
      // where to attach this resource, and a submit button
      isReadyToSubmit: true,
      selectedResourceID: resourceID
    })
    window.client.invoke('resize', { width: '100%', height: '400px' })
  }

  handleSubmit() {
    let ticketID = 0

    window.client.get('ticket.id')
      .then((res) => ticketID = res['ticket.id'])
      .then(() => window.client.request({
        url: '/api/custom_resources/relationships',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          data: {
            relationship_type: this.state.selectedResourceType + '_has_many_' + this.props.type + 's',
            source: this.state.selectedResourceID,
            target: 'zen:ticket:' + ticketID
          }
        })
      }))
      .then((res) => {
        this.setState({
          mode: MODES.LIST
        })
      })
      .catch((err) => console.log(err))

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
      let resourceTypeOptions = this.state.resourceTypes.map((resourceType) => {
        return <Option key={resourceType.key} value={resourceType.key}>{resourceType.key}</Option>
      })

      let resourceOptions = this.state.resources.map((resource) => {
        let firstAttribute = resource.attributes[Object.keys(resource.attributes)[0]]

        return (
          <Option
            key={resource.id}
            value={resource.id}>
            {firstAttribute}
          </Option>
        )
      })

      return (
        <div>
          <Form>
            <FormItem label="Resource Type">
              <Select placeholder='Select a resource Type' onChange={this.handleResourceTypeChange}>
                {resourceTypeOptions}
              </Select>
            </FormItem>

            {this.state.resources.length > 0 ?
              <FormItem label="Resource">
                <Select placeholder='Select a resource' onChange={this.handleResourceChange}>
                  {resourceOptions}
                </Select>
              </FormItem>
              : null}

            <Button
              type="primary"
              disabled={!this.state.isReadyToSubmit}
              onClick={this.handleSubmit}>
              Attach to {this.props.type}
            </Button>
            <Button type="secondary">Cancel</Button>
          </Form>
        </div>
      )
    }
  }
}

export default ContentContainer
