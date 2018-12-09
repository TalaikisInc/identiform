import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Tabs from 'grommet/components/Tabs'
import Tab from 'grommet/components/Tab'
import Image from 'grommet/components/Image'

import Async from 'components/Async'
import logo from 'assets/img/logo.svg'
const UserMenu = Async(() => import('containers/UserMenu'))

class Header extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      userType: 0,
      redirect: true
    }

    this.validateAdmin = this.validateAdmin.bind(this)
    this.validateManager = this.validateManager.bind(this)
    this.validateOwner = this.validateOwner.bind(this)
  }

  componentDidMount = async () => {
    await this.validateOwner()
    await this.validateAdmin()
    await this.validateManager()
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  validateOwner = async () => {
    this.props.Token.deployed().then(async (token) => {
      token.validate({ from: this.props.account }).then((res) => {
        if (res) {
          this.setState({ userType: 1 })
        }
      })
    })

    setTimeout(() => {
      this.validateOwner()
    }, 2000)
  }

  validateAdmin = async () => {
    this.props.Token.deployed().then(async (token) => {
      token.validateAs(1, { from: this.props.account }).then((res) => {
        if (res) {
          this.setState({ userType: 2 })
        }
      })
    })

    setTimeout(() => {
      this.validateAdmin()
    }, 2000)
  }

  validateManager = async () => {
    this.props.Token.deployed().then(async (token) => {
      token.validateAs(2, { from: this.props.account }).then((res) => {
        if (res) {
          this.setState({ userType: 3 })
        }
      })
    })

    setTimeout(() => {
      this.validateManager()
    }, 2000)
  }

  redirect = (path) => {
    if (this.state.redirect) {
      this.setState({
        redirect: false
      })

      return <Redirect push to={path} />
    } else {
      return ''
    }
  }

  menuSwitch = (userType) => {
    const ownerMenu = (
      <Box>
        <Label align='center'>Token:</Label>
        <Tabs responsive={true} justify='center' onActive={() => { this.setState({ redirect: true }) }}>
          <Tab title='Home'>
            { this.redirect('/admin') }
          </Tab>
          <Tab title='Withdraw'>
            { this.redirect('/withdraw') }
          </Tab>
          <Tab title='Wh. add'>
            { this.redirect('/whitelist_add') }
          </Tab>
          <Tab title='Wh. remove'>
            { this.redirect('/whitelist_remove') }
          </Tab>
          <Tab title='Fee'>
            { this.redirect('/fee') }
          </Tab>
          <Tab title='Bonus'>
            { this.redirect('/bonus') }
          </Tab>
          <Tab title='Users'>
            { this.redirect('/users_admin') }
          </Tab>
          <Tab title='Managers'>
            { this.redirect('/managers_admin') }
          </Tab>
          <Tab title='Get User'>
            { this.redirect('/get_user') }
          </Tab>
          <Tab title='Set Role'>
            { this.redirect('/role') }
          </Tab>
          <Tab title='Set Status'>
            { this.redirect('/status') }
          </Tab>
        </Tabs>
      </Box>
    )

    const adminMenu = (
      <Box>
        <Label align='center'>Token:</Label>
        <Tabs responsive={true} justify='center' onActive={() => { this.setState({ redirect: true }) }}>
          <Tab title='Home'>
            { this.redirect('/admin') }
          </Tab>
          <Tab title='Withdraw'>
            { this.redirect('/withdraw') }
          </Tab>
          <Tab title='Wh. add'>
            { this.redirect('/whitelist_add') }
          </Tab>
          <Tab title='Wh. remove'>
            { this.redirect('/whitelist_remove') }
          </Tab>
          <Tab title='Users'>
            { this.redirect('/users_admin') }
          </Tab>
          <Tab title='Get User'>
            { this.redirect('/get_user') }
          </Tab>
          <Tab title='Status'>
            { this.redirect('/status') }
          </Tab>
        </Tabs>
      </Box>
    )

    let comp
    switch (userType) {
      case 1:
        comp = (
          <Box align='center' responsive={true} pad='medium'>
            <Label>Owner Dashboard</Label>
            { ownerMenu }
          </Box>
        )
        break
      case 2:
        comp = (
          <Box align='center' responsive={true} pad='medium'>
            <Label>Admin Dashboard</Label>
            { adminMenu }
          </Box>
        )
        break
      case 3:
        comp = (
          <Box align='center' responsive={true} pad='medium'>
            <Label>Manager Dashboard</Label>
            <UserMenu manager={true} {...this.props} />
          </Box>
        )
        break
      default:
        comp = (
          <Box align='center' responsive={true} pad='medium'>
            <UserMenu manager={false} {...this.props} />
          </Box>
        )
    }

    return comp
  }

  render() {
    return (
      <Box align='center'>
        <Image src={logo} alt='identiForm Decentralized KYC' size='medium' />
        { this.menuSwitch(this.state.userType) }
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    Token: state.Token,
    account: state.account,
    registered: state.registered,
    registeredAsManager: state.registeredAsManager,
    registeredAsRef: state.registeredAsRef
  }
}

export default connect(mapStateToProps)(Header)
