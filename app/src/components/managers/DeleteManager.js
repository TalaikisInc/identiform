import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'
import CheckBox from 'grommet/components/CheckBox'

import Async from 'components/Async'
import Head from 'components/Head'
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))

class DeleteManager extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      success: '',
      failure: '',
      loading: false,
      registered: true,
      loaded: false,
      status: '',
      ok: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
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

  handleSubmit = (event) => {
    event.preventDefault()

    if (this.state.ok && this.state.registered) {
      this.props.Token.deployed().then(async (token) => {
        this.setState({
          loading: true
        })

        const _gas = await token.deleteManager.estimateGas(this.props.account, { from: this.props.account })
        token.deleteManager(this.props.account, {
          from: this.props.account,
          gas: _gas + 50000,
          gasPrice: this.props.gasPrice
        }).then(async (res) => {
          if (res) {
            this.msg(1, res)
          } else {
            this.msg(0, { message: 'Some error.' })
          }
        }).catch((error) => {
          this.msg(0, error)
        })
      })
    }
  }

  render() {
    return (
      <Box align='center'>
        <Head title="Delete Company" />
        <Heading>Delete Account</Heading>
        { this.state.registered ? <Box align='center'>
          <Form onSubmit={this.handleSubmit}>
            <Box pad='small' align='center'>
              <Label labelFor='checked'>Are you sure?</Label>
            </Box>
            <Box pad='small' align='center'>
              <CheckBox id='checked' name='ok' label="Yes, I'm sure" onChange={e => this.setState({ ok: e.target.checked })} toggle={true} />
            </Box>
            <Submit loading={this.state.loading} label='Delete' />
          </Form>
        </Box>
          : <Label align='center'>{this.state.status}</Label>
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
    ipfs: state.ipfs,
    gasPrice: state.gasPrice,
    registeredAsManager: state.registeredAsManager
  }
}

export default connect(mapStateToProps)(DeleteManager)
