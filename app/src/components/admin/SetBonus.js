import React, { Component } from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'

import env from 'env'
import Async from 'components/Async'
const Bonus = Async(() => import('components/blocks/Bonus'))
const Popup = Async(() => import('components/blocks/Popup'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))
const Submit = Async(() => import('components/blocks/Submit'))
const Input = Async(() => import('components/blocks/Input'))

class SetRegBonus extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      amount: '',
      bonusType: '',
      loading: false,
      decimals: null
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.resetToast = this.resetToast.bind(this)
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
            decimals: res
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

    this.props.Token.deployed().then(async (token) => {
      if (this.state.amount > 0 && this.mounted && this.state.bonusType !== '' && this.state.decimals) {
        const _gas = await token[this.state.bonusType].estimateGas(this.state.amount * 10 ** this.state.decimals, { from: this.props.account })
        token[this.state.bonusType](this.state.amount * 10 ** this.state.decimals, {
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
    const bonusTypes = [
      { value: 'setRegistrationBonus', label: 'Registration' },
      { value: 'setReferralBonus', label: 'Referral' }
    ]

    return (
      <Box align='center'>
        <Heading>Set New Bonuses</Heading>
        { this.state.bonusType === 'setRegistrationBonus' ? <Label>Current registration bonus is&nbsp;
          <Bonus bonus='registrationBonus' /> { env.TOKEN_NAME } token(s).</Label> : '' }
        { this.state.bonusType === 'setReferralBonus' ? <Label>Current referral bonus is&nbsp;
          <Bonus bonus='referralBonus' /> { env.TOKEN_NAME } token(s).</Label> : '' }
        <Form onSubmit={this.handleSubmit}>
          <SelectInput id='bonusType' label='Bonus' data={bonusTypes} bonusType={this.state.bonusType}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='amount' label='New bonus, in tokens' handleChange={this.handleChange} error={this.state.errors} />
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

export default connect(mapStateToProps)(SetRegBonus)
