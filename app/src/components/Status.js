import React from 'react'
import { connect } from 'react-redux'

import Layer from 'grommet/components/Layer'
import Notification from 'grommet/components/Notification'
import Paragraph from 'grommet/components/Paragraph'
import Box from 'grommet/components/Box'

const Status = (props) => {
  return (
    <div>
      { !props.web3 || props.account === null
        ? <Layer align='center' flush={true}><Notification status='critical' margin='large'
          message='Warning! This application will not work without Metamask extension enabled.' />
        <Box align='center' pad='large'>
          <Paragraph>
            Why you need Metamask? Metamask is a secure browser wallet that will be used to automatically authenticate you.
          </Paragraph>
          <Paragraph>Downlaod extension for <a href='https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en'
            target='_blank' rel='noopener noreferrer'>Chrome</a> and <a href='https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/'
            target='_blank' rel='noopener noreferrer'>Firefox</a>. Once enabled, refresh the page.</Paragraph>
          <Paragraph>If you use mobile, you can also install <a href='https://trustwalletapp.com/'>Trust wallet</a>.</Paragraph>
        </Box>
        </Layer>
        : null
      }

      { props.account === 'empty' && props.web3.web3Initiated
        ? <Layer align='center' flush={true}><Notification status='critical' margin='large' message='Warning!' />
          <Box align='center' pad='large'>
            <Paragraph>Seems like you have Metamask ready but your account is locked.
            Please unlock it before using the app.</Paragraph>
          </Box>
        </Layer>
        : null
      }

      { props.account && props.web3.web3Initiated && !props.deployed
        ? <Layer align='center' flush={true}><Notification status='critical' margin='large' message='Warning!' />
          <Box align='center' pad='large'>
            <Paragraph>The selected network is not supported.</Paragraph>
          </Box>
        </Layer>
        : null
      }
    </div>
  )
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    account: state.account
  }
}

export default connect(mapStateToProps)(Status)
