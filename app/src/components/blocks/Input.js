import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import TextInput from 'grommet/components/TextInput'
import FormField from 'grommet/components/FormField'

class Input extends PureComponent {
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
    req: PropTypes.bool,
    autocomplete: PropTypes.string
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
            <TextInput id={this.props.id}
              type='text'
              name={this.props.id}
              onDOMChange={this.handleChange}
              value={this.props[this.props.id]}
              autoComplete={this.props.autocomplete ? this.props.autocomplete : ''}
              placeHolder={this.props.label} />
          </FormField>
        </Box>
      </div>
    )
  }
}

export default Input
