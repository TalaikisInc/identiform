import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'

import decrypt from 'utils/decrypt'
import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))
const Input = Async(() => import('components/blocks/Input'))

class ConfirmEmail extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      success: '',
      failure: '',
      uuid: '',
      modalOpen: false,
      loading: false,
      loaded: false,
      confirmationToken: ''
    }

    this.getUUID = this.getUUID.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    await this.getUUID()
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

  handleSubmit = async (event) => {
    event.preventDefault()

    if (this.mounted) {
      this.setState({
        loading: true
      })
    }

    const _uuid = await decrypt(this.state.uuid, process.env.REACT_APP_HASH_PASS)
    if (_uuid === this.state.confirmationToken) {
      this.props.Token.deployed().then(async (token) => {
        const _gas = await token.updateUserReputationEmailConfirmaton.estimateGas(this.props.account, { from: this.props.account })
        token.updateUserReputationEmailConfirmation(this.props.account, {
          from: this.props.account,
          gas: _gas,
          gasPrice: this.props.gasPrice
        }).then(async (res) => {
          if (res) {
            this.msg(1, res)
          }
        })
      })
    } else {
      this.msg(0, { message: 'Wrong token.' })
    }
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

  getUUID = async () => {
    if (this.props.registered && !this.state.loaded && this.mounted) {
      this.props.Token.deployed().then(async (token) => {
        token.getUser(this.props.account, { from: this.props.account }).then(async (res) => {
          const _decryptedHash = await decrypt(res[1], process.env.REACT_APP_HASH_PASS)
          this.props.ipfs.catJSON(_decryptedHash, async (err, data) => {
            if (err) {
              this.msg(0, err)
            } else {
              const _obj = JSON.parse(await decrypt(await decrypt(data, this.props.account), process.env.REACT_APP_ENCRYPTION_PASS))
              this.setState({ uuid: _obj.uuid })
              this.setState({ loaded: true })
            }
          })
        }).catch((error) => {
          this.msg(0, error)
        })
      })
    }

    setTimeout(() => {
      this.getUUID()
    }, 2000)
  }

  render() {
    return (
      <Box align='center'>
        <Heading>Email Confirmation</Heading>
        { this.props.registered ? <Form onSubmit={this.handleSubmit}>
          <Input id='confirmationToken' label='Confirmation Code' handleChange={this.handleChange} error={this.state.errors} />
          <Submit loading={this.state.loading} label='Raise my reputation' />
        </Form>
          : <Label align='center'>This account isn't registered, so we have nothing to do here.</Label>
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
    registered: state.registered
  }
}

export default connect(mapStateToProps)(ConfirmEmail)
