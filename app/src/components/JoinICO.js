import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Paragraph from 'grommet/components/Paragraph'

import Async from 'components/Async'
import Head from 'components/Head'
const Popup = Async(() => import('components/blocks/Popup'))

class JoinICO extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      success: '',
      failure: ''
    }
  }

  render() {
    return (
      <Box align='center'>
        <Head title="Join ICO" />
        <Heading>Join Example ICO</Heading>
        <Paragraph>
            All information.
        </Paragraph>
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

export default connect(mapStateToProps)(JoinICO)
