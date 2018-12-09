import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import ReactGA from 'react-ga'

import 'grommet-css'
import App from 'grommet/components/App'
import Box from 'grommet/components/Box'

import * as actions from 'actions'
import Async from 'components/Async'
import env from 'env'
ReactGA.initialize(env.GA)
const supportsHistory = 'pushState' in window.history
const Home = Async(() => import('components/Home'))
const Header = Async(() => import('containers/Header'))
const Footer = Async(() => import('containers/Footer'))
const Status = Async(() => import('components/Status'))
const RemoveFromWhitelist = Async(() => import('components/admin/RemoveFromWhitelist'))
const Withdraw = Async(() => import('components/admin/Withdraw'))
const AddToWhitelist = Async(() => import('components/admin/AddToWhitelist'))
const Admin = Async(() => import('components/admin/Admin'))
const GetUser = Async(() => import('components/admin/GetUser'))
const SetFees = Async(() => import('components/admin/SetFees'))
const SetFeesTokens = Async(() => import('components/admin/SetFeesTokens'))
const SetBonus = Async(() => import('components/admin/SetBonus'))
const SetUserRole = Async(() => import('components/admin/SetUserRole'))
const SetUserStatus = Async(() => import('components/admin/SetUserStatus'))
const UserList = Async(() => import('components/admin/UserList'))
const DeleteUser = Async(() => import('components/users/DeleteUser'))
const UpdateUser = Async(() => import('components/users/UpdateUser'))
const AddUser = Async(() => import('components/users/AddUser'))
// const NoMatch = Async(() => import('components/NoMatch'))
const MyAccount = Async(() => import('components/MyAccount'))
const ManagerRegister = Async(() => import('components/managers/ManagerRegister'))
const ManagerRegTokens = Async(() => import('components/managers/ManagerRegTokens'))
const RefRegister = Async(() => import('components/referrals/RefRegister'))
const UpdateManager = Async(() => import('components/managers/UpdateManager'))
const DeleteManager = Async(() => import('components/managers/DeleteManager'))
const ManagersList = Async(() => import('components/admin/ManagersList'))
const Airdrops = Async(() => import('components/Airdrops'))
const ICOs = Async(() => import('components/ICOs'))
const JoinAirdrop = Async(() => import('components/JoinAirdrop'))
const JoinICO = Async(() => import('components/JoinICO'))
const ConfirmEmail = Async(() => import('components/users/ConfirmEmail'))
const CheckUser = Async(() => import('components/users/CheckUser'))
const Communicate = Async(() => import('components/Communicate'))
const UsersPublic = Async(() => import('components/users/UsersPublic'))
const UsersManager = Async(() => import('components/users/UsersManager'))
const NotImplemented = Async(() => import('containers/NotImplemented'))

class DApp extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      initiated: false,
      deployed: true
    }
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    this.props.initWeb3()

    this.setState({
      initiated: true
    })

    setInterval(async () => {
      this.props.fetchAccount(this.props.web3)
      this.props.fetchGasPrice(this.props.web3)
      this.props.isRegistered(this.props)
      this.props.isRegisteredAsManager(this.props)
      this.props.isRegisteredAsReferral(this.props)
    }, 2000)
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.web3 !== nextProps.web3) {
      this.props.fetchAccount(this.props.web3)
      this.props.fetchGasPrice(this.props.web3)
      this.props.initIPFS()

      if (nextProps.web3.web3Initiated) {
        this.props.initToken(nextProps.web3)
      }
    }

    if (this.props.account !== nextProps.account && typeof nextProps.account === 'string') {
      this.setState({
        initiated: true
      })
    }
  }

  pageviewTracking= () => {
    if (this.mounted) {
      ReactGA.pageview(window.location.pathName)
    }
  }

  render() {
    return (
      <App>
        <div>
          <BrowserRouter onUpdate={this.pageviewTracking} forceRefresh={!supportsHistory}>
            <div>
              <Box align='center' responsive={true} pad='large'>
                <Status
                  account={this.props.account}
                  metamask={this.props.web3}
                  initiated={this.state.initiated}
                  deployed={this.state.deployed} {...this.props} />

                { this.state.deployed && typeof this.props.account === 'string' && this.props.account !== 'empty'
                  ? <div>
                    <Header />
                    <Switch>
                      <Route exact strict sensitive path='/' component={Home} />
                      <Route exact strict sensitive path='/account' component={MyAccount} />
                      <Route exact strict sensitive path='/register' component={AddUser} />
                      <Route exact strict sensitive path='/edit' component={UpdateUser} />
                      <Route exact strict sensitive path='/delete' component={DeleteUser} />
                      <Route exact strict sensitive path='/manager_register' component={ManagerRegister} />
                      <Route exact strict sensitive path='/manager_tokens' component={ManagerRegTokens} />
                      <Route exact strict sensitive path='/manager_edit' component={UpdateManager} />
                      <Route exact strict sensitive path='/manager_delete' component={DeleteManager} />
                      <Route exact strict sensitive path='/referral_register' component={RefRegister} />
                      <Route exact strict sensitive path='/airdrops' component={Airdrops} />
                      <Route exact strict sensitive path='/icos' component={ICOs} />
                      <Route exact strict sensitive path='/join_airdrop' component={JoinAirdrop} />
                      <Route exact strict sensitive path='/join_ico' component={JoinICO} />
                      <Route exact strict sensitive path='/confirm' component={ConfirmEmail} />
                      <Route exact strict sensitive path='/check_user' component={CheckUser} />
                      <Route exact strict sensitive path='/communicate' component={Communicate} />
                      <Route exact strict sensitive path='/users' component={UsersPublic} />
                      <Route exact strict sensitive path='/users_manager' component={UsersManager} />
                      <Route exact strict sensitive path='/admin' component={Admin} />
                      <Route exact strict sensitive path='/fee' component={SetFees} />
                      <Route exact strict sensitive path='/fee_tokens' component={SetFeesTokens} />
                      <Route exact strict sensitive path='/withdraw' component={Withdraw} />
                      <Route exact strict sensitive path='/whitelist_remove' component={RemoveFromWhitelist} />
                      <Route exact strict sensitive path='/whitelist_add' component={AddToWhitelist} />
                      <Route exact strict sensitive path='/get_user' component={GetUser} />
                      <Route exact strict sensitive path='/users_admin' component={UserList} />
                      <Route exact strict sensitive path='/bonus' component={SetBonus} />
                      <Route exact strict sensitive path='/role' component={SetUserRole} />
                      <Route exact strict sensitive path='/status' component={SetUserStatus} />
                      <Route exact strict sensitive path='/managers_admin' component={ManagersList} />
                      <Route exact strict sensitive path='/not_implemented' component={NotImplemented} />
                    </Switch>
                  </div>
                  : null
                }
              </Box>
              <Footer />
            </div>
          </BrowserRouter>
        </div>
      </App>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    Token: state.Token,
    account: state.account
  }
}

export default connect(mapStateToProps, actions)(DApp)
