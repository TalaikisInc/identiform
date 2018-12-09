import React from 'react'

import Button from 'grommet/components/Button'
import Box from 'grommet/components/Box'

const Submit = (props) => (
  <Box pad='small' align='center'>
    { props.loading ? 'Working, please wait for Metamask window...'
      : <Button primary={true} type='submit' label={props.label} />
    }
  </Box>
)

export default Submit
