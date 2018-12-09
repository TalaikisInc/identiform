import React, { Component } from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'
import CheckBox from 'grommet/components/CheckBox'

import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))

class Withdraw extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      ok: false,
      balance: 0
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.getBalance = this.getBalance.bind(this)
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentDidMount = async () => {
    this.getBalance()
  }

  getBalance = () => {
    this.props.Token.deployed().then(async (token) => {
      const addr = await token.address
      this.props.web3.web3.eth.getBalance(addr, async (err, res) => {
        if (!err && this.mounted) {
          this.setState({
            balance: res ? res.toNumber() / 10 ** 18 : 'N/A'
          })
        }
      })
    })

    setTimeout(() => {
      this.getBalance()
    }, 2000)
  }

  handleSubmit = (event) => {
    event.preventDefault()

    if (this.state.ok && this.state.balance > 0 && this.mounted) {
      this.props.Token.deployed().then(async (token) => {
        this.setState({
          loading: true
        })

        const _gas = await token.withdraw.estimateGas({ from: this.props.account })
        token.withdraw({ from: this.props.account, gas: _gas, gasPrice: this.props.gasprice }).then((res) => {
          if (res) {
            this.msg(1, res)
          } else {
            this.msg(0, { messsage: 'Unknown error.' })
          }
        }).catch((error) => {
          this.msg(0, error)
        })
      })
    } else {
      this.msg(0, { message: 'Nothing to do here.' })
    }
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
        <Heading>Withdraw to owner's</Heading>
        <Label>Balance is { this.state.balance } ethers.</Label>
        <Form onSubmit={this.handleSubmit}>
          <Box pad='small' align='center'>
            <Label labelFor='checked'>Are you sure?</Label>
          </Box>
          <Box pad='small' align='center'>
            <CheckBox id='checked' name='ok' label="Yes, I'm sure" onChange={e => this.setState({ ok: e.target.checked })} toggle={true} />
          </Box>
          <Submit loading={this.state.loading} label='Withdraw' />
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

export default connect(mapStateToProps)(Withdraw)
