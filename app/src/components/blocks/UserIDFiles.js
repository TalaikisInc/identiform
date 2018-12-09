import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'

import { docTypes } from 'utils/data'
import Async from 'components/Async'
const Input = Async(() => import('components/blocks/Input'))
const Submit = Async(() => import('components/blocks/Submit'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))
const FileInput = Async(() => import('components/blocks/FileInput'))

class UserIDFiles extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      docType: '',
      docNo: '',
      idDocument: '',
      addressDocument: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleUploadFile = this.handleUploadFile.bind(this)
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentWillMount = () => {
    this.mounted = true
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
  }

  render() {
    return (
      <div>
        <SelectInput id='docType' label='Document Type' data={docTypes} handleChange={this.handleChange} error={this.state.errors} />
        <Input id='docNo' label='ID Doc. Number' handleChange={this.handleChange} error={this.state.errors} />
        <FileInput id='idDocument' label='Attach your ID:' handleUploadFile={this.handleUploadFile} error={this.state.errors} />
        <FileInput id='addressDocument' label='Attach your address confirmation:' handleUploadFile={this.handleUploadFile} error={this.state.errors} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    docType: state.docType,
    docNo: state.docNo,
    idDocument: state.idDocument,
    addressDocument: state.addressDocument,
    modalOpen: state.modalOpen
  }
}

export default connect(mapStateToProps)(UserIDFiles)
