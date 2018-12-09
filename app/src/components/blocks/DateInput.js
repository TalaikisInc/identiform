import React, { PureComponent } from 'react'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import DateTime from 'grommet/components/DateTime'
import FormField from 'grommet/components/FormField'

class DateInput extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = true

    this.state = {
      [this.props.id]: null
    }

    this._onChangeDate = this._onChangeDate.bind(this)
  }

  _onChangeDate = (value) => {
    this.setState({ [this.props.id]: value })
    this.props._onChangeDate(value)
  }

  render() {
    return (
      <div>
        <Box pad='small' align='center'>
          <Label labelFor={this.props.id}>{ this.props.label }{ this.props.req ? <sup>*</sup> : null }:</Label>
        </Box>
        <Box pad='small' align='center'>
          <FormField
            error={this.props.error && this.props.error[this.props.id] ? this.props.error[this.props.id].msg : null}
            htmlFor={this.props.id}>
            <DateTime id={this.props.id}
              format='YYYY/MM/DD'
              name={this.props.id}
              step={1440}
              onChange={this._onChangeDate}
              value={this.props[this.props.id]} />
          </FormField>
        </Box>
      </div>
    )
  }
}

export default DateInput
