import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Joi from 'joi-browser'
import uuid from 'uuid/v4'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'

import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'
import Image from 'grommet/components/Image'

import encrypt from 'utils/encrypt'
import decrypt from 'utils/decrypt'
import { countries, docTypes, userSchema } from 'utils/data'
import Async from 'components/Async'
import Head from 'components/Head'
const Popup = Async(() => import('components/blocks/Popup'))
const ChangeAddress = Async(() => import('components/users/ChangeAddress'))
const Submit = Async(() => import('components/blocks/Submit'))
const Input = Async(() => import('components/blocks/Input'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))
const FileInput = Async(() => import('components/blocks/FileInput'))
const DateInput = Async(() => import('components/blocks/DateInput'))

class UpdateUser extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      success: '',
      failure: '',
      email: '',
      firstName: '',
      lastName: '',
      modalOpen: false,
      country: '',
      address: '',
      city: '',
      phone: '',
      docType: '',
      docNo: '',
      dob: null,
      uuid: '',
      userZip: '',
      idDocument: '',
      addressDocument: '',
      loading: false,
      loaded: false,
      errors: null,
      agreeToS: false,
      agreeToICOs: false,
      agreeToAirdrops: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleUploadFile = this.handleUploadFile.bind(this)
    this.getUser = this.getUser.bind(this)
    this._onChangeDate = this._onChangeDate.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    this.getUser()
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

  getUser = () => {
    if (this.props.registered && !this.state.loaded && this.mounted) {
      this.props.Token.deployed().then(async (token) => {
        token.getUser(this.props.account, { from: this.props.account }).then(async (res) => {
          this.props.ipfs.dag.get(res[0], async (err, hash) => {
            if (err) {
              this.msg(0, err)
            } else {
              this.props.ipfs.files.get(hash.value[0].hash, async (error, _data) => {
                if (error) {
                  this.msg(0, error)
                } else {
                  const j = JSON.parse(_data[0].content.toString('ascii')).data
                  const _obj = await decrypt(this.props.account, j)
                  if (_obj) {
                    const _d = JSON.parse(_obj.data)
                    this.setState({
                      user: this.props.account,
                      email: _d.email,
                      firstName: _d.firstName,
                      lastName: _d.lastName,
                      address: _d.address,
                      city: _d.city,
                      dob: _d.dob,
                      country: _d.country,
                      phone: _d.phone,
                      userZip: _d.userZip,
                      docType: _d.docType,
                      docNo: _d.docNo,
                      addressDocument: _d.addressDocument,
                      idDocument: _d.idDocument,
                      agreeToS: _d.agreeToS,
                      agreeToICOs: _d.agreeToICOs,
                      agreeToAirdrops: _d.agreeToAirdrops,
                      loaded: true
                    })
                  }
                }
              })

            }
          })
        }).catch((error) => {
          this.msg(0, error)
        })
      })
    }

    setTimeout(() => {
      this.getUser()
    }, 2000)
  }

  handleSubmit = (event) => {
    event.preventDefault()

    if (this.mounted) {
      this.setState({
        loading: true
      })

      const _uuid = uuid()
      const _obj = {
        email: this.state.email,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        address: this.state.address,
        city: this.state.city,
        dob: this.state.dob,
        uuid: _uuid,
        country: this.state.country,
        phone: this.state.phone,
        docType: this.state.docType,
        docNo: this.state.docNo,
        userZip: this.state.userZip,
        addressDocument: this.state.addressDocument,
        idDocument: this.state.idDocument,
        agreeToS: this.state.agreeToS,
        agreeToICOs: this.state.agreeToICOs,
        agreeToAirdrops: this.state.agreeToAirdrops
      }

      Joi.validate(_obj, userSchema, { abortEarly: false }, async (e, v) => {
        if (!e) {
          this.props.Token.deployed().then(async (token) => {
            await encrypt(this.props.account, _obj).then(async (_data) => {
              if (_data) {
                this.props.ipfs.files.add(Buffer.from(JSON.stringify(_data)), async (error, _hash) => {
                  if (error) {
                    this.msg(0, error)
                  } else {
                    this.props.ipfs.dag.put(_hash, { format: 'dag-cbor', hashAlg: 'sha2-256' }, async (err, cid) => {
                      if (err) {
                        this.msg(0, err)
                      } else {
                        const _cidBase = cid.toBaseEncodedString()
                        const _gas = await token.updateUser.estimateGas(this.props.account, _cidBase, 'EMPTY', { from: this.props.account })
                        token.updateUser(this.props.account, _cidBase, 'EMPTY', {
                          from: this.props.account,
                          gas: _gas,
                          gasPrice: this.props.gasPrice
                        }).then((receipt) => {
                          this.msg(1, receipt)
                        }).catch((err) => {
                          this.msg(0, err)
                        })
                      }
                    })
                  }
                })
              } else {
                this.msg(0, { message: 'Error when encrypting.' })
              }
            }).catch((er) => {
              this.msg(0, er)
            })
          })
        } else {
          const errors = {}
          e.details.map((error) => {
            if (!errors.hasOwnProperty(error.path.join('_'))) {
              errors[error.path.join('_')] = {
                msg: `Error with ${error.path.join('_')} field` // actually we should map bunch of mroe exact errors
              }
            }
            return null
          })
          this.setState({ errors })
          this.msg(0, { message: 'Form has errors!' })
        }
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
          this.setState({
            [name]: e.target.result
          })
        }.bind(this)
      }.bind(this))(data)
      reader.readAsDataURL(data)
    } else {
      this.setState({
        modalOpen: true,
        failure: 'We can accept only image files.'
      })
      this.resetToast()
    }
  }

  _onChangeDate = (value) => {
    this.setState({ dob: value })
  }

  resetToast = () => {
    setTimeout(() => {
      if (this.state.modalOpen) {
        this.setState({
          modalOpen: false,
          loading: false,
          success: '',
          failure: ''
        })
      }
    }, 5000)
  }

  msg = (type, msg) => {
    this.setState({ modalOpen: true })
    switch (type) {
      case 0:
        if (msg.message.indexOf('User denied') !== -1) {
          this.setState({ failure: 'Tx rejected.' })
        } else {
          this.setState({ failure: `Error occurred: ${msg.message}` })
        }
        this.resetToast()
        return
      case 1:
        this.setState({ success: `Success! Your tx: ${msg.tx}` })
        this.resetToast()
        return
      case 3:
        this.setState({ failure: 'Form has errors!' })
        this.resetToast()
        return
      default:
        this.resetToast()
    }
  }

  render() {
    const form = (
      <Box align='center'>
        <Head title="Update Account" />
        <Form onSubmit={this.handleSubmit}>
          <Input req={true} id='email' label='Email' email={this.state.email} autocomplete='email'
            handleChange={this.handleChange} error={this.state.errors} />
          <Input req={true} id='firstName' label='First name' autocomplete='given-name'
            firstName={this.state.firstName} handleChange={this.handleChange} error={this.state.errors} />
          <Input req={true} id='lastName' label='Last name' lastName={this.state.lastName} autocomplete='family-name'
            handleChange={this.handleChange} error={this.state.errors} />
          <DateInput id='dob' req={true} dob={this.state.dob} label='Birth Date' _onChangeDate={this._onChangeDate} error={this.state.errors} />
          <Input id='address' label='Address' address={this.state.address} autocomplete='address-line1'
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='city' label='City' city={this.state.city} handleChange={this.handleChange} error={this.state.errors} />
          <Input id='userZip' label='ZIP/ Post Code' userZip={this.state.userZip} autocomplete='postal-code'
            handleChange={this.handleChange} error={this.state.errors} />
          <SelectInput id='country' label='Country' data={countries} autocomplete='country-name'
            country={this.state.country} handleChange={this.handleChange} error={this.state.errors} />
          <Input req={true} id='phone' label='Phone' phone={this.state.phone} autocomplete='tel'
            handleChange={this.handleChange} error={this.state.errors} />
          <SelectInput id='docType' label='Document type' data={docTypes}
            docType={this.state.docType} handleChange={this.handleChange} error={this.state.errors} />
          <Input id='docNo' label='ID Document Number' docNo={this.state.docNo} handleChange={this.handleChange} error={this.state.errors} />
          { this.state.idDocument !== '' ? <div><Image src={this.state.idDocument} />
            <FileInput id='idDocument' label='Attach your ID'
              idDocument={this.state.idDocument} handleUploadFile={this.handleUploadFile} error={this.state.errors} />
          </div>
            : ''
          }
          { this.state.addressDocument !== '' ? <div><Image src={this.state.addressDocument} />
            <FileInput id='addressDocument' label='Attach your ID'
              addressDocument={this.state.addressDocument} handleUploadFile={this.handleUploadFile} error={this.state.errors} />
          </div>
            : ''
          }
          <Submit loading={this.state.loading} label='Update' />
        </Form>
        <p><strong>*</strong> Required fields</p>
        <ChangeAddress />
      </Box>
    )

    const formRender = (
      this.state.email !== '' ? form : <Label align='center'>Loading data...</Label>
    )

    return (
      <Box align='center'>
        <Heading>Update Account</Heading>
        { this.props.registered ? formRender
          : <Label align='center'>This account isn't registered yet, so we don't have what to do.</Label>
        }
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    Token: state.Token,
    account: state.account,
    web3: state.web3,
    ipfs: state.ipfs,
    gasPrice: state.gasPrice,
    registered: state.registered
  }
}

export default connect(mapStateToProps)(UpdateUser)
