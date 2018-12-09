import React from 'react'
import { Link } from 'react-router-dom'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'

import Async from 'components/Async'
const Bonus = Async(() => import('components/blocks/Bonus'))

const RegisterBanner = () => (
  <Box align='center'>
    <Label>Register and receive <Bonus bonus='registrationBonus' /> IDF tokens for free!</Label>
    <Label>Why use our service?</Label>
    <ul>
      <li>All your data is decentralized, secure, double encnrypted and accesible only to one validator upon verification of your account.</li>
      <li>Register only once and never again, thus getting access to entire network of participants.</li>
      <li>Participate in many <Link to='/airdrops'>airdrops</Link> and <Link to='/ico'>ICOs</Link> with just one click.*</li>
      <li>Receive verified rating to your Ethereum account.*</li>
      <li>Communicate anddo business securely.* </li>
      <li>And rate on the reputation of others depending on your experience.*</li>
    </ul>
  </Box>
)

export default RegisterBanner
