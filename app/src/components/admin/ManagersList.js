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
import { roleMap } from 'utils/utils'
import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))

class ManagersList extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      managerCount: 0,
      recipient: '',
      managers: [],
      loaded: false
    }

    this.getManagers = this.getManagers.bind(this)
    this.getManagersCount = this.getManagersCount.bind(this)
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
    this.getManagersCount()
    this.getManagers()
  }

  approve = (recipient) => {
    if (web3utils.isAddress(recipient)) {
      this.props.Token.deployed().then(async (token) => {
        const _gas = await token.addToWhitelist.estimateGas(recipient, { from: this.props.account })
        token.addToWhitelist(recipient, {
          from: this.props.account,
          gas: _gas,
          gasPrice: this.props.gasPrice
        }).then((receipt) => {
          this.msg(0, receipt)
        }).catch((error) => {
          this.msg(0, error)
        })
      })
    }
  }

  decline = (recipient) => {
    if (web3utils.isAddress(recipient)) {
      this.props.Token.deployed().then(async (token) => {
        const _gas = await token.removeFromWhitelist.estimateGas(recipient, { from: this.props.account })
        token.removeFromWhitelist(recipient, {
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

  getManagersCount = () => {
    this.props.Token.deployed().then(async (token) => {
      token.getManagersCount().then((res) => {
        this.setState({
          managerCount: res ? res.toNumber() : 0
        })
      })
    })

    setTimeout(() => {
      this.getManagersCount()
    }, 2000)
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

  getManagers = () => {
    const managerData = []
    if (this.state.managerCount > 0 && !this.state.loaded) {
      this.props.Token.deployed().then(async (token) => {
        for (let i = 0; i < this.state.managerCount; i++) {
          token.getManagerAtIndex(i, { from: this.props.account }).then(async (res) => {
            const _status = await token.getWhitelistStatus(res[1], { from: this.props.account })
            const _decryptedHash = await decrypt(res[2], process.env.REACT_APP_HASH_PASS)
            this.props.ipfs.catJSON(_decryptedHash, async (err, data) => {
              const _obj = JSON.parse(await decrypt(await decrypt(data, res[1]), process.env.REACT_APP_ENCRYPTION_PASS))
              if (!err) {
                _obj.role = await roleMap(res[3])
                _obj.roleCode = res[3].toNumber()
                _obj.status = _status
                _obj.user = res[1]
                managerData.push(_obj)
                this.setState({ managers: managerData })
              } else {
                this.msg(0, err)
              }
            })
          })
        }
        if (this.state.managerCount === this.state.managers.length && this.state.managers.length !== 0) {
          this.setState({
            loaded: true
          })
        }
      })
    }

    setTimeout(() => {
      this.getManagers()
    }, 2000)
  }

  render() {
    const managers = this.state.managers
    const managersRendered = []

    for (let i = 0; i < managers.length; i++) {
      managersRendered.push(
        <div key={i}>
          <List>
            <ListItem>
              <Box pad='medium' align='start'>
                User:
              </Box>
              <Box pad='medium' align='start'>
                <Label>{ managers[i].user }</Label>
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
                Company:
              </Box>
              <Box pad='medium' align='start'>
                <p>{ managers[i].company }</p>
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
              Address:
              </Box>
              <Box pad='medium' align='start'>
                <p>{ managers[i].companyAddress } { managers[i].companyCity }</p>
                <p>{ managers[i].companyZip } { managers[i].companyCountry }</p>
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
                Document:
              </Box>
              <Box pad='medium' align='start'>
                { managers[i].companyRegDoc ? <p><Image src={managers[i].companyRegDoc} /></p> : '' }
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
                Role:
              </Box>
              <Box pad='medium' align='start'>
                <p>{ managers[i].role }</p>
              </Box>
            </ListItem>
            <ListItem>
              <Box pad='medium' align='start'>
                Whitelisted?:
              </Box>
              <Box pad='medium' align='start'>
                <p>{ managers[i].status }</p>
                { managers[i].status ? <div>
                  <Anchor
                    primary={true}
                    icon={<SubtractIcon />}
                    label='Remove from whitelist'
                    onClick={() => { this.decline(managers[i].user) }}/>
                </div>
                  : <Anchor
                    primary={true}
                    icon={<AddIcon />}
                    label='Add to whitelist'
                    onClick={() => { this.approve(managers[i].user) }}/>
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
        <Heading>Managers</Heading>
        <Label>Found { this.state.managerCount } manager(s).</Label>
        { managersRendered }
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

export default connect(mapStateToProps)(ManagersList)
