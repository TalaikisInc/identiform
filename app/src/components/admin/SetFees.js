import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

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

class SetFees extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      ether: '',
      loading: false,
      feeType: '',
      errors: [],
      decimals: null
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getDecimals = this.getDecimals.bind(this)
  }

  componentDidMount = async () => {
    await this.getDecimals()
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

  getDecimals = async () => {
    this.props.Token.deployed().then((token) => {
      token.decimals.call().then((res) => {
        if (this.mounted) {
          this.setState({
            decimals: res ? res.toNumber() : null
          })
        }
      })
    })

    setTimeout(() => {
      this.getDecimals()
    }, 2000)
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({ loading: true })

    this.props.Token.deployed().then(async (token) => {
      if (this.state.ether > 0 && this.state.feeType !== '' && this.state.decimals) {
        const _gas = await token[this.state.feeType].estimateGas(this.state.ether * 10 ** this.state.decimals, { from: this.props.account })
        token[this.state.feeType](this.state.ether * 10 ** this.state.decimals, {
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
      { value: 'setManagerRegistrationFee', label: 'Manager registration' },
      { value: 'setManagerApprovalFee', label: 'Manager apporval' }
    ]

    return (
      <Box align='center'>
        <Heading>Set new fees</Heading>
        { this.state.feeType === 'setManagerRegistrationFee' ? <Label>Current manager registration fee is&nbsp;
          <Fees fee='managerRegistrationFee' ether={true} /> ether.</Label> : '' }
        { this.state.feeType === 'setManagerApprovalFee' ? <Label>Current manager appproval fee is&nbsp;
          <Fees fee='managerApprovalFee' ether={true} /> ether.</Label> : '' }
        <Form onSubmit={this.handleSubmit}>
          <SelectInput id='feeType' label='Fee' data={feeTypes} feeType={this.state.feeType}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='ether' label='New fee, in ethers' handleChange={this.handleChange} error={this.state.errors} />
          <Submit loading={this.state.loading} label='Set' />
        </Form>
        <Label>For fees in tokens, <Link to='/fee_tokens'>go here</Link>.</Label>
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

export default connect(mapStateToProps)(SetFees)
