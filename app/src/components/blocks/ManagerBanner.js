import React from 'react'
import { Link } from 'react-router-dom'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Paragraph from 'grommet/components/Paragraph'

import env from 'env'
import Async from 'components/Async'
const Fees = Async(() => import('components/blocks/Fees'))

const ManagerBanner = () => (
  <Box align='center'>
    <Label>Why register as a company?</Label>
    <Paragraph>
      Become our customer and not only your users will thank you for using our decentralized and secure user management and reputation service,
      but you also will save tons of money by protcting your valuable business from mistakes complying to different regulating ICOs
      and privacy laws.
    </Paragraph>
    <Label>Also:</Label>
    <ul>
      <li>Listing on our <Link to='/icos'>ICOs</Link> or <Link to='/airdrops'>Airdrops</Link> directory.*</li>
      <li>Know the reputation of your users.*</li>
      <li>Get interested users for your ICO or airdrop (only particpating in this offer).*</li>
      <li>Communicate with them securely.*</li>
    </ul>
    <Label>Our Current Fees</Label>
    <ul>
      <li>Registration: <Fees fee='managerRegistrationFeeTokens' /> { env.TOKEN_NAME } tokens (when you register)</li>
      <li>Approval: <Fees fee='managerApprovalFeeTokens' /> { env.TOKEN_NAME } (if you are approved)</li>
      <li>Requests: 0 { env.TOKEN_NAME } tokens (for requesting user's information)</li>
    </ul>
  </Box>
)

export default ManagerBanner
