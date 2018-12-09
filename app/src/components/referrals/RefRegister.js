import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
// import validator from 'validator'
// import web3utils from 'web3-utils'
import { Link } from 'react-router-dom'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'
import CheckBox from 'grommet/components/CheckBox'

import Async from 'components/Async'
import Head from 'components/Head'
const RefBanner = Async(() => import('components/blocks/RefBanner'))
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))

class RefRegister extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      success: '',
      failure: '',
      modalOpen: false,
      loading: false,
      registered: false,
      registeredAsRef: false,
      ok: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.getRef = this.getRef.bind(this)
  }

  componentWillMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  async componentDidMount() {
    await this.getRef()
  }

  getRef = async () => {
    this.props.Token.deployed().then(async (token) => {
      token.existsRef(this.props.account, { from: this.props.account }).then((res) => {
        if (res) {
          this.setState({
            registeredAsRef: true,
            status: 'This account is already registered as a referral.'
          })
        } else {
          this.setState({
            registeredAsRef: false
          })
        }
      }).catch((error) => {
        this.msg(0, error)
      })
    })

    setTimeout(() => {
      this.getRef()
    }, 2000)
  }

  handleSubmit = (event) => {
    event.preventDefault()

    this.props.Token.deployed().then(async (token) => {
      if (this.state.ok) {
        this.setState({ loading: true })
        const _gas = await token.newRef.estimateGas({ from: this.props.account })
        token.newRef({
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
    const done = (
      <Label align='center'>{this.state.status}</Label>
    )

    return (
      <Box align='center'>
        <Head title="Referral Register" />
        <Heading>Register as a Referral</Heading>
        <Box align='center'>
          { this.state.registeredAsRef && this.props.registered ? done : <div>
            <RefBanner />
            { !this.props.registered ? <div>
              <Box align='center'>
                <Label><strong>NOTE</strong>. First you ned to <Link to='/register'>register as an user</Link>, then go back here.</Label>
              </Box>
            </div>
              : <div>
                <Form onSubmit={this.handleSubmit}>
                  <Box pad='small' align='center'>
                    <CheckBox id='checked' name='ok' label='Do it' onChange={e => this.setState({ ok: e.target.checked })} toggle={true} />
                  </Box>
                  <Submit loading={this.state.loading} label='Register' />
                </Form>
              </div>
            }
          </div>
          }
        </Box>
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
    registered: state.registered
  }
}

export default connect(mapStateToProps)(RefRegister)
