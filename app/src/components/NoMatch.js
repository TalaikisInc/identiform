import React from 'react'

import Heading from 'grommet/components/Heading'
import Label from 'grommet/components/Label'
import Box from 'grommet/components/Box'

import Async from 'components/Async'
import Head from 'components/Head'

const NoMatch = () => (
  <Box>
    <Head title="Nothing Found" />
    <Heading>Not Found</Heading>
    <Label>
        Sorry, this page doesn't exist.
    </Label>    
  </Box>
)

export default NoMatch
