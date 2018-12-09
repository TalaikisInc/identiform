import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'

import Async from 'components/Async'
const Input = Async(() => import('components/blocks/Input'))

class UserRegMain extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      email: '',
      firstName: '',
      lastName: ''
    }

    this.handleChange = this.handleChange.bind(this)
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentWillMount = async () => {
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
        <Input req={true} id='email' label='Email' handleChange={this.handleChange} error={this.state.errors} />
        <Input req={true} id='firstName' label='First name' handleChange={this.handleChange} error={this.state.errors} />
        <Input req={true} id='lastName' label='Last name' handleChange={this.handleChange} error={this.state.errors} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    email: state.email,
    firstName: state.firstName,
    lastName: state.lastName
  }
}

export default connect(mapStateToProps)(UserRegMain)
