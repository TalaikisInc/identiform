import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Box from 'grommet/components/Box'
import FormField from 'grommet/components/FormField'
import CheckBox from 'grommet/components/CheckBox'

class Check extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      [this.props.id]: false
    }
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    handleCheckbox: PropTypes.func.isRequired,
    error: PropTypes.array
  }

  render() {
    return (
      <div>
        <Box pad='small' align='center'>
          <FormField
            error={this.props.error && this.props.error[this.props.id] ? this.props.error[this.props.id].msg : null}
            htmlFor={this.props.id}>
            <CheckBox
              id={this.props.id}
              name={this.props.id}
              label={this.props.label}
              onChange={e => { this.setState({ [this.props.id]: e.target.checked }); this.props.handleCheckbox(e) }} toggle={true} />
          </FormField>
        </Box>
      </div>
    )
  }
}

export default Check
