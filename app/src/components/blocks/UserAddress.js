import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import validator from 'validator'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'

import Async from 'components/Async'
import { countries } from 'utils/data'
const Input = Async(() => import('components/blocks/Input'))
const Submit = Async(() => import('components/blocks/Submit'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))

class UserAddress extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      city: '',
      country: '',
      phone: '',
      userZip: ''
    }

    this.handleChange = this.handleChange.bind(this)

  }

  componentWillUnmount = () => {
		this.mounted = false
  }

  componentWillMount = () => {
		this.mounted = true
  }

  handleChange = (event) => {
    const { target, option } = event
    const { value, name } = target

    if (this.mounted) {
      (option) ? this.setState({
        [name]: option.value ? option.value : ''
      }) : this.setState({
        [name]: value
      })
    }
  }

  render() {
    return (
      <div>
        <Input id='address' label='Address' handleChange={this.handleChange} error={this.state.errors} />
        <Input id='city' label='City' handleChange={this.handleChange} error={this.state.errors} />
        <Input id='userZip' label='ZIP/ Post Code' handleChange={this.handleChange} error={this.state.errors} />
        <SelectInput id='country' label='Country' data={countries} handleChange={this.handleChange} error={this.state.errors} />
        <Input req={true} id='phone' label='Phone' handleChange={this.handleChange} error={this.state.errors} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    address: state.address,
    city: state.city,
    country: state.country,
    phone: state.phone,
    userZip: state.userZip
  }
}

export default connect(mapStateToProps)(UserAddress)
