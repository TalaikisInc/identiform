import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Room from 'ipfs-pubsub-room'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Paragraph from 'grommet/components/Paragraph'

import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))

class Communicate extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      success: '',
      failure: ''
    }
  }

  talkDemo = () => {
    const room = Room(this.props.ipfs, 'room-name')

    room.on('peer joined', (peer) => {
      console.log('Peer joined the room', peer)
    })

    room.on('peer left', (peer) => {
      console.log('Peer left...', peer)
    })

    room.on('subscribed', () => {
      console.log('Now connected!')
    })
  }

  render() {
    return (
      <Box align='center'>
        <Heading>Secure Chat</Heading>
        <Paragraph>
            This is page for future secure communications app. Go back to <Link to='/users'>users catalog</Link>.
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

export default connect(mapStateToProps)(Communicate)
