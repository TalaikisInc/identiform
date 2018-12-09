import React, { Component } from 'react'
import { connect } from 'react-redux'
import web3utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'

import { roles } from 'utils/data'
import Async from 'components/Async'
import { roleMap } from 'utils/utils'
const Popup = Async(() => import('components/blocks/Popup'))
const Input = Async(() => import('components/blocks/Input'))
const Submit = Async(() => import('components/blocks/Submit'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))

class SetUserRole extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      ether: '',
      fee: '',
      user: '',
      role: '',
      newRole: ''
    }

    this.mounted = false

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getUserRole = this.getUserRole.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    this.getUserRole()
  }

  getUserRole = () => {
    if (web3utils.isAddress(this.state.user) && this.mounted) {
      this.props.Token.deployed().then(async (token) => {
        token.getRole(this.state.user, { from: this.props.account }).then(async (res) => {
          this.setState({
            role: await roleMap(res)
          })
        })
      })
    }

    setTimeout(() => {
      this.getUserRole()
    }, 2000)
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

  handleSubmit = (event) => {
    event.preventDefault()

    this.props.Token.deployed().then(async (token) => {
      if (web3utils.isAddress(this.state.user)) {
        const _gas = await token.setUserRole.estimateGas(this.state.user, this.state.newRole)
        token.setUserRole(this.state.user, this.state.newRole, {
          from: this.props.account,
          gas: _gas,
          gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(1, receipt)
        }).catch((error) => {
          this.msg(0, error)
        })
      } else {
        this.msg(3, '')
      }
    })
  }

  resetToast = () => {
    setTimeout(() => {
      if (this.state.modalOpen) {
        this.setState({
          modalOpen: false,
          loading: false,
          success: '',
          failure: ''
        })
      }
    }, 5000)
  }

  msg = (type, msg) => {
    this.setState({ modalOpen: true })
    switch (type) {
      case 0:
        if (msg.message.indexOf('User denied') !== -1) {
          this.setState({ failure: 'Tx rejected.' })
        } else {
          this.setState({ failure: `Error occurred: ${msg.message}` })
        }
        this.resetToast()
        return
      case 1:
        this.setState({ success: `Success! Your tx: ${msg.tx}` })
        this.resetToast()
        return
      case 3:
        this.setState({ failure: 'Form has errors!' })
        this.resetToast()
        return
      default:
        this.resetToast()
    }
  }

  render() {
    return (
      <Box align='center'>
        <Heading>Set new user role</Heading>
        { this.state.role !== '' ? <Label>Current role is { this.state.role }.</Label> : '' }
        <Form onSubmit={this.handleSubmit}>
          <Input id='user' label='User' handleChange={this.handleChange} error={this.state.errors} />
          <SelectInput id='newRole' label='New Role' data={roles} newRole={this.state.newRole}
            handleChange={this.handleChange} error={this.state.errors} />
          <Submit loading={this.state.loading} label='Set' />
        </Form>
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    Token: state.Token,
    account: state.account,
    gasPrice: state.gasPrice
  }
}

export default connect(mapStateToProps)(SetUserRole)
