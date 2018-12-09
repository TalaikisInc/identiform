import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import web3utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import TextInput from 'grommet/components/TextInput'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'
import Paragraph from 'grommet/components/Paragraph'

import Async from 'components/Async'
import Head from 'components/Head'
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))

class CheckUser extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      user: '',
      address: '',
      loading: false,
      data: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
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

  handleSubmit = (event) => {
    event.preventDefault()

    if (web3utils.isAddress(this.state.address) && this.mounted) {
      this.setState({ loading: true })
      this.props.Token.deployed().then(async (token) => {
        token.getUserPublicAddr(this.state.address, { from: this.props.account })
          .then(async (res) => {
            this.setState({
              data: res
            })
          }).catch((error) => {
            this.msg(0, error)
          })
      })
    } else {
      this.msg(0, { message: 'Form has errors.' })
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
    const form = (
      <Form onSubmit={this.handleSubmit}>
        <Box pad='small' align='center'>
          <Label labelFor='address'>Enter user's address:</Label>
        </Box>
        <Box pad='small' align='center'>
          <TextInput
            id='address'
            type='text'
            onDOMChange={this.handleChange}
            value={this.state.address}
            name='address'
            placeHolder='Ethereum address'/>
        </Box>
        <Submit loading={this.state.loading} label='Get' />
      </Form>
    )

    const rate = (
      <div>
        <Label>Nothing found for this user. Rate?</Label>
        <Box pad='small' align='center'>
          <Label>Rating not implemneted yet.</Label>
        </Box>
      </div>
    )

    const reputation = (
      <div>
        { this.state.data !== '' ? <Label>User's reputation is { this.state.data } </Label> : rate }
      </div>
    )

    return (
      <Box align='center'>
        <Head title="Check User" />
        <Heading>Check User / Rate User's Reputation</Heading>
        { this.props.registered ? form : <div>
          <Label>You should be <Link to='/register'>registered</Link> to use this service.</Label>
          <Paragraph>* When registering you also receive free tokens.</Paragraph>
        </div>
        }
        <Box pad='small' align='center'>
          { this.state.address !== '' ? reputation : '' }
        </Box>
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    ipfs: state.ipfs,
    Token: state.Token,
    account: state.account,
    registered: state.registered
  }
}

export default connect(mapStateToProps)(CheckUser)
