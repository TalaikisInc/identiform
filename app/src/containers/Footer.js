import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Chat from 'react-chat-slack'

import Box from 'grommet/components/Box'
import Paragraph from 'grommet/components/Paragraph'

class Footer extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  render() {
    const acc = (this.props.account === 'empty' || this.props.account === null) ? 'unknown' : this.props.account // .substring(2, 8)

    return (
      <Box align='center'>
        <Chat
          token={process.env.REACT_APP_SLACK_KEY}
          channel_id={process.env.REACT_APP_CHANNEL_ID}
          username={acc}
          title='How can we help?'
          saveSession={false} />
        <Paragraph>
          &copy; 2018, <a href='https://identiform.com'>identiform</a>
        </Paragraph>
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    account: state.account
  }
}

export default connect(mapStateToProps)(Footer)
