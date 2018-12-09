import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'

import Async from 'components/Async'
import { countries } from 'utils/data'
const Input = Async(() => import('components/blocks/Input'))
const Submit = Async(() => import('components/blocks/Submit'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))
const FileInput = Async(() => import('components/blocks/FileInput'))

class CompanyReg extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      company: '',
      companyAddress: '',
      companyCity: '',
      companyZip: '',
      companyCountry: '',
      companyRegDoc: ''
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
        return function(e) {
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
        <Input id='company' label='Company' handleChange={this.handleChange} error={this.state.errors} />
        <Input id='companyAddress' label='Company Address' handleChange={this.handleChange} error={this.state.errors} />
        <Input id='companyCity' label='City' handleChange={this.handleChange} error={this.state.errors} />
        <Input id='companyZip' label='ZIP/ Post Code' handleChange={this.handleChange} error={this.state.errors} />
        <SelectInput id='companyCountry' label='Country' data={countries} handleChange={this.handleChange} error={this.state.errors} />
        <FileInput id='companyRegDoc' label='Attach company registration document:' handleUploadFile={this.handleUploadFile} error={this.state.errors} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    company: state.company,
    companyAddress: state.companyAddress,
    companyCity: state.companyCity,
    companyZip: state.companyZip,
    companyCountry: state.companyCountry,
    companyRegDoc: state.companyRegDoc
  }
}

export default connect(mapStateToProps)(CompanyReg)
