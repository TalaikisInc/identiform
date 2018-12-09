import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Box from 'grommet/components/Box'
import Heading from 'grommet/components/Heading'
import Label from 'grommet/components/Label'

class Admin extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      tokenBalance: '',
      contractAddress: ''
    }

    this.getBalance = this.getBalance.bind(this)
  }

  componentDidMount = async () => {
    await this.getBalance()
  }

  getBalance = async () => {
    this.props.Token.deployed().then((token) => {
      token.balanceOf(token.address).then((tokenBalance) => {
        this.setState({
          tokenBalance: tokenBalance ? tokenBalance.toNumber() : 'loading',
          contractAddress: token.address
        })
      })
    })
  }

  render() {
    return (
      <Box>
        <Heading>Admin Area</Heading>
        <Label>This area is admins'.</Label>
        <Heading align='center'>Contract's Address</Heading>
        <Label>{ this.state.contractAddress }</Label>
        <Heading align='center'>Contract's Tokens</Heading>
        <Label>{ this.state.tokenBalance }</Label>
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

export default connect(mapStateToProps)(Admin)
