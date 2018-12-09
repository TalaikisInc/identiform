import React, { Component } from 'react'
import { connect } from 'react-redux'
import web3utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'

import { userStates } from 'utils/data'
import { stateMap } from 'utils/utils'
import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))
const Input = Async(() => import('components/blocks/Input'))
const Submit = Async(() => import('components/blocks/Submit'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))

class SetUserStatus extends Component {
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
      status: '',
      newStatus: '',
      company: null
    }

    this.mounted = false

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getUserStatus = this.getUserStatus.bind(this)
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentDidMount = async () => {
    this.getUserStatus()
    if (this.state.company === null) {
      this.props.Token.deployed().then(async (token) => {
        this.setState({ company: await token.address })
      })
    }
  }

  getUserStatus = () => {
    if (web3utils.isAddress(this.state.user) && this.mounted) {
      this.props.Token.deployed().then(async (token) => {
        token.getUser(this.state.user, { from: this.props.account }).then(async (res) => {
          this.setState({ status: await stateMap(res[1]) })
        }).catch((error) => {
          this.msg(0, error)
        })
      })
    }

    setTimeout(() => {
      this.getUserStatus()
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
      if (web3utils.isAddress(this.state.user) && this.mounted) {
        const _gas = await token.setUserStatus.estimateGas(this.state.user, this.state.newStatus, this.state.company)
        token.setUserStatus(this.state.user, this.state.newStatus, this.state.company, {
          from: this.props.account,
          gas: _gas,
          gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(1, receipt)
          this.setState({ newStatus: '' })
        }).catch((error) => {
          this.msg(0, error)
        })
      } else {
        this.msg(0, { message: 'Form has errors.' })
      }
    })
  }

  resetToast = () => {
    setTimeout(() => {
      if (this.state.modalOpen) {
        this.setState({
          modalOpen: false,
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
        <Heading>Set new user status</Heading>
        { this.state.status !== '' ? <Label>Current status is { this.state.status }.</Label> : '' }
        <Form onSubmit={this.handleSubmit}>
          <Input req={true} id='user' label='User' handleChange={this.handleChange} error={this.state.errors} />
          <Input req={true} id='company' label='Company' company={this.state.company} handleChange={this.handleChange} error={this.state.errors} />
          <SelectInput id='newStatus' label='New Status' data={userStates} newStatus={this.state.newStatus}
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

export default connect(mapStateToProps)(SetUserStatus)
