import React, { Component } from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'

import Async from 'components/Async'
const Fees = Async(() => import('components/blocks/Fees'))
const Popup = Async(() => import('components/blocks/Popup'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))
const Submit = Async(() => import('components/blocks/Submit'))
const Input = Async(() => import('components/blocks/Input'))

class SetFeesTokens extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      tokens: '',
      loading: false,
      feeType: '',
      errors: []
    }

    this.handleSubmit = this.handleSubmit.bind(this)
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

  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({ loading: true })

    this.props.Token.deployed().then(async (token) => {
      if (this.state.tokens > 0 && this.state.feeType !== '') {
        const _gas = await token[this.state.feeType].estimateGas(this.state.tokens, { from: this.props.account })
        token[this.state.feeType](this.state.tokens, {
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
    const feeTypes = [
      { value: 'setManagerRegistrationFeeTokens', label: 'Manager registration' },
      { value: 'setManagerApprovalFeeTokens', label: 'Manager apporval' },
      { value: 'setVoteFeeTokens', label: 'Vote fee' }
    ]

    return (
      <Box align='center'>
        <Heading>Set new fees</Heading>
        { this.state.feeType === 'setManagerRegistrationFeeTokens' ? <Label>Current manager registration fee is&nbsp;
          <Fees fee='managerRegistrationFeeTokens' /> tokens.</Label> : '' }
        { this.state.feeType === 'setManagerApprovalFeeTokens' ? <Label>Current manager appproval fee is&nbsp;
          <Fees fee='managerApprovalFeeTokens' /> tokens.</Label> : '' }
        { this.state.feeType === 'setVoteFeeTokens' ? <Label>Current voting fee is&nbsp;
          <Fees fee='voteFeeTokens' /> tokens.</Label> : '' }
        <Form onSubmit={this.handleSubmit}>
          <SelectInput id='feeType' label='Fee' data={feeTypes} handleChange={this.handleChange} error={this.state.errors} />
          <Input id='tokens' label='New fee, in tokens' handleChange={this.handleChange} error={this.state.errors} />
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

export default connect(mapStateToProps)(SetFeesTokens)
