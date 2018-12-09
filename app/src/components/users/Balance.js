import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import List from 'grommet/components/List'
import ListItem from 'grommet/components/ListItem'
import Box from 'grommet/components/Box'

import env from 'env'

class Balance extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      tokenBalance: '',
      balance: ''
    }

    this.getBalance = this.getBalance.bind(this)
    this.getEthBalance = this.getEthBalance.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    await this.getBalance()
    await this.getEthBalance()
  }

  getEthBalance = async () => {
    if (this.props.account !== null) {
      this.props.web3.web3.eth.getBalance(this.props.account, (err, balance) => {
        if (!err && this.mounted) {
          this.setState({
            balance: this.props.web3.web3.fromWei(balance.toNumber())
          })
        }
      })
    }

    setTimeout(() => {
      this.getEthBalance()
    }, 2000)
  }

  getBalance = async () => {
    if (this.props.account !== null) {
      this.props.Token.deployed().then((token) => {
        token.balanceOf(this.props.account).then((tokenBalance) => {
          if (this.mounted) {
            this.setState({
              tokenBalance: tokenBalance ? tokenBalance.toNumber() / 10 ** 18 : 'loading'
            })
          }
        })
      })
    }

    setTimeout(() => {
      this.getBalance()
    }, 2000)
  }

  render() {
    return (
      <Box>
        { this.state.tokenBalance !== null ? <div>
          <Heading>Your Tokens</Heading>
          <List>
            <ListItem>
              { this.state.tokenBalance } { env.TOKEN_NAME }
            </ListItem>
          </List>
        </div>
          : '' }
        { this.state.balance !== null ? <div>
          <Heading>Your ETH</Heading>
          <List>
            <ListItem>
              { this.state.balance } ETH
            </ListItem>
          </List>
        </div>
          : ''
        }
      </Box>
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

export default connect(mapStateToProps)(Balance)
