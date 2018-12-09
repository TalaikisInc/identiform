import React, { Component } from 'react'
import { connect } from 'react-redux'
import web3utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import List from 'grommet/components/List'
import ListItem from 'grommet/components/ListItem'
import Image from 'grommet/components/Image'
import Anchor from 'grommet/components/Anchor'
import AddIcon from 'grommet/components/icons/base/Add'
import SubtractIcon from 'grommet/components/icons/base/Subtract'

import decrypt from 'utils/decrypt'
import { stateMap } from 'utils/utils'
import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))

class UserList extends Component {
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
    this.approve = this.approve.bind(this)
    this.decline = this.decline.bind(this)
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
      token.getUserCount().then((res) => {
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
          token.getUserAtIndex(i, { from: this.props.account }).then(async (res) => {
            const _decryptedHash = await decrypt(res[2], process.env.REACT_APP_HASH_PASS)
            this.props.ipfs.catJSON(_decryptedHash, async (err, data) => {
              const _obj = JSON.parse(await decrypt(await decrypt(data, res[1]), process.env.REACT_APP_ENCRYPTION_PASS))
              if (!err) {
                _obj.status = await stateMap(res[3])
                _obj.statusCode = res[3].toNumber()
                _obj.user = res[1]
                userData.push(_obj)
                this.setState({
                  users: userData,
                  statusCode: ''
                })
              } else {
                this.msg(0, err)
              }
            })
          })
        }
        if (this.state.userCount === this.state.users.length && this.state.users.length !== 0) {
          this.setState({
            loadedd: true
          })
        }
      })
    }

    setTimeout(() => {
      this.getUsers()
    }, 2000)
  }

  approve = (recipient) => {
    if (web3utils.isAddress(recipient)) {
      this.props.Token.deployed().then(async (token) => {
        const _gas = await token.setUserStatus.estimateGas(recipient, 1, { from: this.props.account })
        token.setUserStatus(recipient, 1, {
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

  decline = (recipient) => {
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

    for (let i = 0; i < users.length; i++) {
      usersRendered.push(
        <div key={i}>
          <List>
            <ListItem>
              <Box pad='medium' align='start'>
                User:
              </Box>
              <Box pad='medium' align='start'>
                <Label>{ users[i].user }</Label>
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
                Email:
              </Box>
              <Box pad='medium' align='start'>
                <p>{ users[i].email }</p>
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
              Name:
              </Box>
              <Box pad='medium' align='start'>
                <p>{ users[i].firstName } { users[i].lastName }</p>
                <p>{ users[i].docType } { users[i].docNo }</p>
                { users[i].idDocument ? <p><Image src={users[i].idDocument} /></p> : '' }
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
                Address:
              </Box>
              <Box pad='medium' align='start'>
                <p>{ users[i].address } { users[i].city } { users[i].country }</p>
                { users[i].addressDocument ? <p><Image src={users[i].addressDocument} /></p> : '' }
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
                Phone:
              </Box>
              <Box pad='medium' align='start'>
                <p>{ users[i].phone }</p>
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
                Status?:
              </Box>
              <Box pad='medium' align='start'>
                { users[i].status !== '' ? <div>
                  <p>{ users[i].status }</p>
                  { users[i].statusCode === 1 ? <Anchor
                    primary={true}
                    icon={<SubtractIcon />}
                    label='Decline'
                    onClick={() => { this.decline(users[i].user) }}/>
                    : ''
                  }
                  { users[i].statusCode === 0 ? <Anchor
                    primary={true}
                    icon={<AddIcon />}
                    label='Approve'
                    onClick={() => { this.approve(users[i].user) }} />
                    : ''
                  }

                  { users[i].statusCode === 2 ? <Anchor
                    primary={true}
                    icon={<AddIcon />}
                    label='Approve'
                    onClick={() => { this.approve(users[i].user) }} />
                    : ''
                  }
                </div>
                  : 'N/A'
                }
              </Box>
            </ListItem>
          </List>
          <hr />
        </div>
      )
    }

    return (
      <Box align='center'>
        <Heading>Users</Heading>
        <Label>Found { this.state.userCount } user(s).</Label>
        { usersRendered }
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

export default connect(mapStateToProps)(UserList)
