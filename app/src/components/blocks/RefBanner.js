import React from 'react'
import { Link } from 'react-router-dom'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Paragraph from 'grommet/components/Paragraph'

import Async from 'components/Async'
const Bonus = Async(() => import('components/blocks/Bonus'))

const RefBanner = () => (
  <Box align='center'>
    <Label>Why register as a referral?</Label>
    <Paragraph>
      When you send new users to our platform, you'll receive <Bonus bonus='referralBonus' /> IDF tokens for each if they are approved,
      and they also receive <Bonus bonus='registrationBonus' /> IDF tokens for the full registration. Not including many other
      benefits that we list on our <Link to='/register'>registration page</Link>.
    </Paragraph>
  </Box>
)

export default RefBanner
