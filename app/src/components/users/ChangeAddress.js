import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import web3utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'

import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))
const Input = Async(() => import('components/blocks/Input'))

class ChangeAddress extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      loading: false,
      address: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
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

  handleSubmit(event) {
    event.preventDefault()

    if (this.mounted) {
      this.setState({
        loading: true
      })
    }

    this.props.Token.deployed().then(async (token) => {
      const _oldData = await token.getUser(this.props.account, { from: this.props.account })
      const _publicData = await token.getUserPublicAddr(this.props.account, { from: this.props.account })

      if (web3utils.isAddress(this.state.address)) {
        const _gas = await token.changeAddress.estimateGas(this.props.account, this.state.address,
            _oldData[1], _publicData[0], { from: this.props.account })
        token.changeAddress(this.props.account, this.state.address, _oldData[1], _publicData[0], {
          from: this.props.account,
          gas: _gas,
          gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(1, receipt)
        }).catch((err) => {
          this.msg(0, err)
        })
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
        <Heading>Change Address</Heading>
        { this.props.registered ? <Box align='center'>
          <Label align='center'>When you change your address, all your old data will be associated with new ethereum address.</Label>
          <Form onSubmit={this.handleSubmit}>
            <Input req={true} id='address' label='New Ethereum address' handleChange={this.handleChange} error={this.state.errors} />
            <Submit loading={this.state.loading} label='Change' />
          </Form>
        </Box>
          : ''
        }
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    Token: state.Token,
    account: state.account,
    web3: state.web3,
    gasPrice: state.gasPrice,
    registered: state.registered
  }
}

export default connect(mapStateToProps)(ChangeAddress)
