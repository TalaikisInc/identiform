import React, { PureComponent } from 'react'
import { Redirect } from 'react-router'

import Tabs from 'grommet/components/Tabs'
import Tab from 'grommet/components/Tab'

class UserMenu extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      userType: 0,
      redirect: true
    }
  }

  redirect = (path) => {
    if (this.state.redirect) {
      this.setState({ redirect: false })
      return <Redirect push to={path} />
    } else {
      return ''
    }
  }

  render() {
    return (
      <Tabs responsive={true} justify='center' onActive={() => { this.setState({ redirect: true }) }}>
        <Tab title='dApp'>
          {this.redirect('/')}
        </Tab>
        { !this.props.registered ? <Tab title='Register'>
          {this.redirect('/register')}
        </Tab>
          : ''
        }
        <Tab title='My account'>
          {this.redirect('/account')}
        </Tab>
        { this.props.registeredAsManager ? '' : <Tab title='Service'>
          {this.redirect('/manager_register')}
        </Tab>
        }
        {this.props.registeredAsRef ? '' : <Tab title='Referrals'>
          {this.redirect('/referral_register')}
        </Tab>
        }
        <Tab title='ICOs'>
          {this.redirect('/icos')}
        </Tab>
        <Tab title='AirDrops'>
          {this.redirect('/airdrops')}
        </Tab>
        <Tab title='Top Users'>
          {this.redirect('/users')}
        </Tab>
        { this.props.manager ? <Tab title='My users'>
          { this.redirect('/users_manager') }
        </Tab>
          : null }
      </Tabs>
    )
  }
}

export default UserMenu
