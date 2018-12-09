import React from 'react'

import Paragraph from 'grommet/components/Paragraph'
import Toast from 'grommet/components/Toast'

const Popup = (props) => (
  <div>
    { props.modalOpen && <Toast
      status={props.success ? 'ok' : 'critical' }>
      <Paragraph>{ props.success ? props.success : null }</Paragraph>
      <Paragraph>{ props.failure ? props.failure : null }</Paragraph>
    </Toast>
    }
  </div>
)

export default Popup
