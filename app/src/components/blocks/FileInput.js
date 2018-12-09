import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import FormField from 'grommet/components/FormField'

class FileInput extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = true

    this.state = {
      [this.props.id]: ''
    }

    this.handleUploadFile = this.handleUploadFile.bind(this)
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    handleUploadFile: PropTypes.func.isRequired,
    error: PropTypes.array,
    req: PropTypes.bool
  }

  handleUploadFile = (event) => {
    const data = event.target.files[0]
    const name = event.target.name
    if (data.type.match('image/*')) {
      const reader = new window.FileReader()
      reader.onload = (function(theFile) {
        return function (e) {
          if (this.mounted) {
            this.setState({
              [name]: e.target.result
            })
          }
        }.bind(this)
      }.bind(this))(data)
      reader.readAsDataURL(data)
    } else if (this.mounted) {
      this.setState({
        modalOpen: true,
        failure: 'We can accept only image files.'
      })
    }
    this.props.handleUploadFile(event)
  }

  render() {
    return (
      <div>
        <Box pad='small' align='center'>
          <Label>{this.props.label}{ this.props.req ? <sup>*</sup> : null }</Label>
          <FormField
            error={this.props.error && this.props.error[this.props.id] ? this.props.error[this.props.id].msg : null}
            htmlFor={this.props.id}>
            <input id={this.props.id} name={this.props.id} type='file' onChange={this.handleUploadFile} />
          </FormField>
        </Box>
      </div>
    )
  }
}

export default FileInput
