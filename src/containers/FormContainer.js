import React, { Component } from 'react'
import {
  Form,
  Select,
  Button,
  Alert
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

class FormContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isReadyToSubmit: false,
      typeRoute: '',
      resourceTypes: [],
      resources: [],
      selectedResourceType: '',
      selectedResourceID: '',
      errors: []
    }

    this.handleResourceTypeChange = this.handleResourceTypeChange.bind(this)
    this.handleResourceChange = this.handleResourceChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
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

    if (this.props.type === 'ticket') {
      let ID = 0

      // TODO: Make this dynamic for ticket / user / organization
      window.client.get('ticket.id')
        .then((res) => {
          ID = res['ticket.id']
        })
        .then(() => window.client.request({
          url: '/api/custom_resources/relationships',
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify({
            data: {
              relationship_type: this.props.type + 's' + '_' + this.state.selectedResourceType + 's',
              source: 'zen:ticket:' + ID,
              target: this.state.selectedResourceID
            }
          })
        }))
        .then((res) => {
          this.props.onSuccess()
        })
        .catch((err) => {
          this.setState({
            errors: err.responseJSON.errors
          })
        })
    }

    if (this.props.type === 'user') {
      let ID = 0

      window.client.get('ticket.requester')
        .then((res) => {
          ID = res['ticket.requester'].id
        })
        .then(() => window.client.request({
          url: '/api/custom_resources/relationships',
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify({
            data: {
              relationship_type: this.props.type + 's' + '_' + this.state.selectedResourceType + 's',
              source: 'zen:user:' + ID,
              target: this.state.selectedResourceID
            }
          })
        }))
        .then((res) => {
          this.props.onSuccess()
        })
        .catch((err) => {
          this.setState({
            errors: err.responseJSON.errors
          })
        })
    }

  }

  handleCancel() {
    this.props.onCancel()
  }

  render() {
    let errors = this.state.errors.map((error, index) => {
      return (
        <Alert
          key={index}
          message='Error'
          description={error.detail}
          type="error" />
      )
    })

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
        {this.state.errors.length > 0 ?
          <FormItem>
            {errors}
          </FormItem>
          : null}

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
          <Button type="secondary" onClick={this.handleCancel}>Cancel</Button>
        </Form>
      </div>
    )
  }
}

export default FormContainer
