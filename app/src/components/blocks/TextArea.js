import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import FormField from 'grommet/components/FormField'

class TextArea extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = true

    this.state = {
      [this.props.id]: ''
    }

    this.handleChange = this.handleChange.bind(this)
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired,
    error: PropTypes.array,
    req: PropTypes.bool
  }

  handleChange = (event) => {
    const { target, option } = event
    const { value, name } = target

    if (this.mounted) {
      (option) ? this.setState({
        [name]: option.value ? option.value : ''
      }) : this.setState({
        [name]: value
      })
    }
    this.props.handleChange(event)
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
            <textarea
              name={this.props.id}
              onChange={this.handleChange}
              value={this.props[this.props.id]}
              placeholder={this.props.label}
              rows='4'>
            </textarea>
          </FormField>
        </Box>
      </div>
    )
  }
}

export default TextArea
