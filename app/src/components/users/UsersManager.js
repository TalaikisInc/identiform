import React, { Component } from 'react'
import { connect } from 'react-redux'
import web3utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Anchor from 'grommet/components/Anchor'
import Table from 'grommet/components/Table'
import TableRow from 'grommet/components/TableRow'
import TableHeader from 'grommet/components/TableHeader'
import UpIcon from 'grommet/components/icons/base/Up'
import DownIcon from 'grommet/components/icons/base/Down'
import SendIcon from 'grommet/components/icons/base/Send'

import { stateMap } from 'utils/utils'
import Async from 'components/Async'
import Head from 'components/Head'
const Popup = Async(() => import('components/blocks/Popup'))

class UsersManager extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      userCount: 0,
      recipient: '',
      users: [],
      loaded: false
    }

    this.getUsers = this.getUsers.bind(this)
    this.getUsersCount = this.getUsersCount.bind(this)
    this.upVote = this.upVote.bind(this)
    this.downVote = this.downVote.bind(this)
    this.resetToast = this.resetToast.bind(this)
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentDidMount = async () => {
    this.getUsersCount()
    this.getUsers()
  }

  getUsersCount = () => {
    this.props.Token.deployed().then(async (token) => {
      token.getRefUsersCount(this.props.account).then((res) => {
        this.setState({
          userCount: res ? res.toNumber() : 0
        })
      })
    })

    setTimeout(() => {
      this.getUsersCount()
    }, 2000)
  }

  getUsers = () => {
    const userData = []
    if (this.state.userCount > 0 && !this.state.loaded) {
      this.props.Token.deployed().then(async (token) => {
        for (let i = 0; i < this.state.userCount; i++) {
          token.getUserStateAtIndex(i, { from: this.props.account }).then(async (res) => {
            userData.push(res)
            this.setState({
              users: userData,
              statusCode: ''
            })
          })
        }
        if (this.state.userCount === this.state.users.length && this.state.users.length !== 0) {
          this.setState({ loadedd: true })
        }
      })
    }

    setTimeout(() => {
      this.getUsers()
    }, 2000)
  }

  upVote = (recipient) => {
    if (web3utils.isAddress(recipient)) {
      this.props.Token.deployed().then(async (token) => {
        const _gas = await token.setUserStatus.estimateGas(recipient, 1, { from: this.props.account })
        token.setUserStatus(recipient, 1, {
          from: this.props.account,
          gas: _gas,
          gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(1, receipt)
        })
          .catch((error) => {
            this.msg(0, error)
          })
      })
    }
  }

  downVote = (recipient) => {
    if (web3utils.isAddress(recipient)) {
      this.props.Token.deployed().then(async (token) => {
        const _gas = await token.setUserStatus.estimateGas(recipient, 2, { from: this.props.account })
        token.setUserStatus(recipient, 2, {
          from: this.props.account,
          gas: _gas,
          gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(1, receipt)
        }).catch((error) => {
          this.msg(0, error)
        })
      })
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

  render() {
    const users = this.state.users
    const usersRendered = []

    users.map(async (e, i) => {
      usersRendered.push(
        <div key={i}>
          <TableRow>
            <td>{ e[1] }</td>
            <td>{ await stateMap(e[0]) }</td>
            <td>
              <Anchor primary={true} icon={<UpIcon />} onClick={() => { this.upVote(e[1]) }} />
              <Anchor primary={true} icon={<DownIcon />} onClick={() => { this.downVote(e[1]) }} />
            </td>
            <td>
              <Anchor primary={true} icon={<SendIcon />} href='/communicate' />
            </td>
          </TableRow>
        </div>
      )

    })

    return (
      <Box align='center'>
        <Head title="Company Users" />
        <Heading>Your Users</Heading>
        <Table>
          <TableHeader labels={['User', 'State', 'Vote', 'Talk']} sortIndex={3} sortAscending={true} />
          <tbody>
            { usersRendered }
          </tbody>
        </Table>
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
    gasPrice: state.gasPrice
  }
}

export default connect(mapStateToProps)(UsersManager)
