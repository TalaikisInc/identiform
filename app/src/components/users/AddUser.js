import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import uuid from 'uuid/v4'
import Joi from 'joi-browser'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'

import { post } from 'utils/api'
import encrypt from 'utils/encrypt'
import { countries, docTypes, userSchema } from 'utils/data'
import Async from 'components/Async'
const RegisterBanner = Async(() => import('components/blocks/RegisterBanner'))
const Popup = Async(() => import('components/blocks/Popup'))
const ConfirmYourAccount = Async(() => import('components/email/ConfirmYourAccount'))
const Reputation = Async(() => import('components/blocks/Reputation'))
const Submit = Async(() => import('components/blocks/Submit'))
const Input = Async(() => import('components/blocks/Input'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))
const DateInput = Async(() => import('components/blocks/DateInput'))
const FileInput = Async(() => import('components/blocks/FileInput'))
const Check = Async(() => import('components/blocks/Check'))

class AddUser extends PureComponent {
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
      phone: null,
      docType: '',
      docNo: '',
      dob: null,
      idDocument: '',
      addressDocument: '',
      loading: false,
      userZip: '',
      fullName: '',
      errors: null,
      agreeToS: false,
      agreeToICOs: false,
      agreeToAirdrops: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleUploadFile = this.handleUploadFile.bind(this)
    this._onChangeDate = this._onChangeDate.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  _onChangeDate = (value) => {
    this.setState({ dob: value })
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

  handleCheckbox = (e) => {
    const { name } = e.target

    this.setState({
      [name]: e.target.checked
    })
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

  fullName = async () => {
    this.setState({
      fullName: this.state.firstName !== '' &&
        this.state.lastName !== '' ? `${this.state.firstName} ${this.state.lastName}`
        : this.state.email
    })
  }

  sendEmail = async (_uuid) => {
    this.fullName()
    const emailBody = {
      user: this.props.account,
      email: {
        to: `${this.state.fullName} <${this.state.email}>`,
        subject: `Confirm your identiForm email and receive ${<Reputation rep='emailConfirmatonPoints' />}`,
        text: 'Confirm your account by clicking following link',
        html: <ConfirmYourAccount uuid={_uuid} />
      }
    }
    // console.log(emailBody)
    await post('EMAIL_SEND', emailBody).then((res) => {
      console.log('email status', res)
    })
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

  handleSubmit(event) {
    event.preventDefault()

    if (this.mounted) {
      this.setState({ loading: true, errors: [] })
    }

    this.props.Token.deployed().then(async (token) => {
      const body = {
        pathname: process.env.REACT_APP_PATHNAME,
        user: this.props.account
      }

      await post('KEYS_GENERATE', body).then((r) => {
        if (r.result === 'done') {
          const _uuid = uuid()
          const _obj = {
            email: this.state.email,
            uuid: _uuid,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            address: this.state.address,
            city: this.state.city,
            country: this.state.country,
            phone: this.state.phone,
            docType: this.state.docType,
            docNo: this.state.docNo,
            userZip: this.state.userZip,
            dob: this.state.dob,
            addressDocument: this.state.addressDocument,
            idDocument: this.state.idDocument,
            agreeToS: this.state.agreeToS,
            agreeToICOs: this.state.agreeToICOs,
            agreeToAirdrops: this.state.agreeToAirdrops
          }

          Joi.validate(_obj, userSchema, { abortEarly: false }, async (e, v) => {
            if (!e) {
              await encrypt(this.props.account, _obj).then(async (_data) => {
                if (_data) {
                  this.props.ipfs.files.add(Buffer.from(JSON.stringify(_data)), async (error, _hash) => {
                    if (error) {
                      this.msg(0, error)
                    } else {
                      if (this.state.agreeToS) {
                        this.props.ipfs.dag.put(_hash, { format: 'dag-cbor', hashAlg: 'sha2-256' }, async (err, cid) => {
                          if (err) {
                            this.msg(0, err)
                          } else {
                            const _cidBase = cid.toBaseEncodedString()
                            const _gas = await token.newUser.estimateGas(_cidBase, 'EMPTY', { from: this.props.account })
                            token.newUser(_cidBase, 'EMPTY', {
                              from: this.props.account,
                              gas: _gas,
                              gasPrice: this.props.gasPrice
                            }).then(async (receipt) => {
                              this.msg(1, receipt)
                              this.sendEmail(_uuid)
                            }).catch((er) => {
                              this.msg(0, er)
                            })
                          }
                        })
                      } else {
                        this.msg(0, { message: 'You should agree to Terms of Service.' })
                      }
                    }
                  })
                } else {
                  this.msg(0, { message: 'Errro occured when encrypting.' })
                }
              }).catch((er) => {
                this.msg(0, er)
              })
            } else {
              console.log(e)
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
        } else {
          this.msg(0, { message: 'Error when generating encryption key..' })
        }
      })
    })
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

  render() {
    return (
      <Box align='center'>
        <Heading>Register</Heading>
        { this.props.registered ? <Label align='center'>This account is already registered</Label>
          : <Box align='center'>
            <RegisterBanner />
            <Form onSubmit={this.handleSubmit}>
              <Input id='email' autocomplete='email' req={true} label='Email' handleChange={this.handleChange} error={this.state.errors} />
              <Input id='firstName' autocomplete='given-name' req={true} label='First Name' handleChange={this.handleChange} error={this.state.errors} />
              <Input id='lastName' autocomplete='family-name' req={true} label='Last Name' handleChange={this.handleChange} error={this.state.errors} />
              <Input id='phone' autocomplete='tel-national' req={true} label='Your Phone' handleChange={this.handleChange} error={this.state.errors} />
              <DateInput id='dob' req={true} label='Birth Date' dob={this.state.dob}
                _onChangeDate={this._onChangeDate} error={this.state.errors} />
              <Input id='address' autocomplete='address-line1' label='Your Address' handleChange={this.handleChange} error={this.state.errors} />
              <Input id='city' autocomplete='address-level2' label='City' handleChange={this.handleChange} error={this.state.errors} />
              <Input id='userZip' autocomplete='postal-code' label='Your Post Code/ ZIP' handleChange={this.handleChange} error={this.state.errors} />
              <SelectInput id='country' autocomplete='country-name' label='Country' country={this.state.country}
                data={countries} handleChange={this.handleChange} error={this.state.errors} />
              <SelectInput id='docType' label='ID Document Type' data={docTypes} docType={this.state.docType}
                handleChange={this.handleChange} error={this.state.errors} />
              <Input id='docNo' label='Doc. Number' handleChange={this.handleChange} error={this.state.errors} />
              <FileInput id='idDocument' label='Attach your ID:' handleUploadFile={this.handleUploadFile} error={this.state.errors} />
              <FileInput id='addressDocument' label='Attach your address confirmation:' handleUploadFile={this.handleUploadFile} error={this.state.errors} />
              <Check id='agreeToS' label='I agrree to Terms of Service' handleCheckbox={this.handleCheckbox} />
              <Check id='agreeToICOs' label='I want to receive inviations to ICOs' handleCheckbox={this.handleCheckbox} />
              <Check id='agreeToAirdrops' label='I want to participate in airdrops' handleCheckbox={this.handleCheckbox} />
              <Submit loading={this.state.loading} label='Register' />
            </Form>
            <p><strong>*</strong> Required fields</p>
          </Box>
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

export default connect(mapStateToProps)(AddUser)
