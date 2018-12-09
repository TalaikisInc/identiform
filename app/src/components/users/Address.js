import React from 'react'
import { connect } from 'react-redux'

import Heading from 'grommet/components/Heading'
import List from 'grommet/components/List'
import ListItem from 'grommet/components/ListItem'
import Box from 'grommet/components/Box'

const Address = (props) => (
  <Box>
    <Heading>Your Address</Heading>
    <List>
      <ListItem>{ props.account }</ListItem>
    </List>
  </Box>
)

function mapStateToProps(state) {
  return {
    account: state.account
  }
}

export default connect(mapStateToProps)(Address)
