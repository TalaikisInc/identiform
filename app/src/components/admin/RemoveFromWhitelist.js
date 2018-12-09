import React, { Component } from 'react'
import { connect } from 'react-redux'
import web3utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'
import Box from 'grommet/components/Box'

import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))
const Input = Async(() => import('components/blocks/Input'))

class RemoveFromWhitelist extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      toWhitelist: '',
      status: true,
      loading: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getWhitelistStatus = this.getWhitelistStatus.bind(this)
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentWillMount = () => {
    this.mounted = true
  }

  handleChange = (event) => {
    const { target } = event
    const value = target.type === 'checkbox' ? target.checked : target.value
    const { name } = target

    this.setState({
      [name]: value,
      loading: true
    })

    this.getWhitelistStatus()
  }

  getWhitelistStatus = () => {
    if (web3utils.isAddress(this.state.toWhitelist) && this.mounted) {
      this.props.Token.deployed().then((token) => {
        token.getWhitelistStatus(this.state.toWhitelist, { from: this.props.account }).then((res) => {
          this.setState({
            status: res,
            loading: false
          })
        })
      })
        .catch((error) => {
          console.log('Whitelist query', error)
        })
    }

    setTimeout(() => {
      this.getWhitelistStatus()
    }, 2000)
  }

  handleSubmit = (event) => {
    event.preventDefault()

    this.props.Token.deployed().then(async (token) => {
      if (web3utils.isAddress(this.state.toWhitelist) && this.mounted) {
        const _gas = await token.removeFromWhitelist.estimateGas(this.state.toWhitelist)
        token.removeFromWhitelist(this.state.toWhitelist, {
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
        <Heading>Remove from whitelist</Heading>
        { this.state.status ? <Form onSubmit={this.handleSubmit}>
          <Input id='toWhitelist' req={true} label='ETH Address' handleChange={this.handleChange} error={this.state.errors} />
          <Submit loading={this.state.loading} label='Save' />
        </Form>
          : <Label>This user isn't on whitelist, nothing to do.</Label>
        }
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

export default connect(mapStateToProps)(RemoveFromWhitelist)
