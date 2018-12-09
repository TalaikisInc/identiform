import React, { PureComponent } from 'react'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Paragraph from 'grommet/components/Paragraph'

import Async from 'components/Async'
import Head from 'components/Head'
const Popup = Async(() => import('components/blocks/Popup'))

class NotImplemented extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      success: '',
      failure: ''
    }
  }

  render() {
    return (
      <Box align='center'>
        <Head title="Not Implemented" />
        <Heading>Not implemented</Heading>
        <Paragraph>
            Future page.
        </Paragraph>
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Box>
    )
  }
}

export default NotImplemented
