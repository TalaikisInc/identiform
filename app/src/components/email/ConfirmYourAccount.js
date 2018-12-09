import React, { PureComponent } from 'react'

import Box from 'grommet/components/Box'
import Heading from 'grommet/components/Heading'

import env from 'env'
import Bonus from 'components/blocks/Bonus'

import Reputation from 'components/blocks/Reputation'

class ConfirmYourAccount extends PureComponent {
  render() {
    const title = `Please confirm your identiForm account, 
      receive ${<Bonus bonus='registrationTokens' />} ${env.TOKEN_NAME} tokens
      and get ${<Reputation rep='emailConfirmatonPoints' />} reputation points!`
    const link = 'https://app.identiform.com/'

    return (
      <Box>
        <Heading>{title}</Heading>
        Click this link to confirm your account:
        <a href={`${link}${this.props.uuid}`}>Confirm</a>.
      </Box>
    )
  }
}

export default ConfirmYourAccount
