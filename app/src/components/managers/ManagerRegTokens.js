import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Joi from 'joi-browser'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'

import encrypt from 'utils/encrypt'
import { countries, companySchema, dirTypes, kycReq, acceptedCurr } from 'utils/data'
import Async from 'components/Async'
const ManagerBanner = Async(() => import('components/blocks/ManagerBanner'))
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))
const Input = Async(() => import('components/blocks/Input'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))
const FileInput = Async(() => import('components/blocks/FileInput'))
const TextArea = Async(() => import('components/blocks/TextArea'))
const DateInput = Async(() => import('components/blocks/DateInput'))

class ManagerRegTokens extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      success: '',
      failure: '',
      modalOpen: false,
      loading: false,
      company: '',
      companyAddress: '',
      companyCity: '',
      companyZip: '',
      companyCountry: '',
      companyRegDoc: '',
      managerApprovalFee: '',
      managerRegistrationFee: '',
      errors: [],
      logo: '',
      shortDescription: '',
      projectDescription: '',
      video: '',
      startDate: '',
      endDate: '',
      website: '',
      whitepaper: '',
      facebook: '',
      twitter: '',
      telegram: '',
      medium: '',
      bitcoinTalk: '',
      reddit: '',
      slack: '',
      hardCap: '',
      softCap: '',
      type: '',
      tokenDistribution: '',
      tokenSymbol: '',
      initialPrice: '',
      kyc: '',
      restrictions: '',
      accepts: '',
      team: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.getRegFee = this.getRegFee.bind(this)
    this.getApprovalFee = this.getApprovalFee.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleUploadFile = this.handleUploadFile.bind(this)
    this._onChangeDate = this._onChangeDate.bind(this)
  }

  componentWillMount() {
    this.mounted = true
  }

  componentWillUnmount() {
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

  componentDidMount = async () => {
    await this.getRegFee()
    await this.getApprovalFee()
  }

  getRegFee = async () => {
    this.props.Token.deployed().then(async (token) => {
      token.managerRegistrationFeeTokens().then((res) => {
        if (this.mounted) {
          this.setState({
            managerRegistrationFee: res ? res.toNumber() : 0
          })
        }
      })
    })

    setTimeout(() => {
      this.getRegFee()
    }, 2000)
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

  getApprovalFee = async () => {
    this.props.Token.deployed().then(async (token) => {
      token.managerApprovalFeeTokens().then((res) => {
        if (this.mounted) {
          this.setState({
            managerApprovalFee: res ? res.toNumber() : 0
          })
        }
      })
    })

    setTimeout(() => {
      this.getApprovalFee()
    }, 2000)
  }

  handleSubmit = (event) => {
    event.preventDefault()

    if (this.mounted) {
      this.setState({
        loading: true
      })
    }

    this.props.Token.deployed().then(async (token) => {
      const _obj = {
        company: this.state.company,
        companyAddress: this.state.companyAddress,
        companyCity: this.state.companyCity,
        companyZip: this.state.companyZip,
        companyCountry: this.state.companyCountry,
        companyRegDoc: this.state.companyRegDoc,
        logo: this.state.logo,
        shortDescription: this.state.shortDescription,
        projectDescription: this.state.projectDescription,
        video: this.state.video,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        website: this.state.website,
        whitepaper: this.state.whitepaper,
        facebook: this.state.facebook,
        twitter: this.state.twitter,
        telegram: this.state.telegram,
        medium: this.state.medium,
        bitcoinTalk: this.state.bitcoinTalk,
        reddit: this.state.reddit,
        slack: this.state.slack,
        hardCap: this.state.hardCap,
        softCap: this.state.softCap,
        type: this.state.type,
        tokenDistribution: this.state.tokenDistribution,
        tokenSymbol: this.state.tokenSymbol,
        initialPrice: this.state.initialPrice,
        kyc: this.state.kyc,
        restrictions: this.state.restrictions,
        accepts: this.state.accepts,
        team: this.state.team
      }

      Joi.validate(_obj, companySchema, { abortEarly: false }, async (e, v) => {
        if (!e) {
          await encrypt(this.props.account, _obj).then(async (_data) => {
            if (_data) {
              this.props.ipfs.dag.put(_data, { format: 'dag-cbor', hashAlg: 'sha2-256' }, async (error, cid) => {
                if (error) {
                  this.msg(0, error)
                } else {
                  const _cidBase = cid.toBaseEncodedString()
                  const _gas = await token.newManagerWithTokens.estimateGas(_cidBase, { from: this.props.account })
                  token.newManagerWithTokens(_cidBase, {
                    from: this.props.account,
                    to: token.address,
                    gas: _gas + 50000,
                    gasPrice: this.props.gasPrice
                  }).then((receipt) => {
                    this.msg(1, receipt)
                  }).catch((er) => {
                    this.msg(0, er)
                  })
                }
              })
            } else {
              this.msg(0, { message: 'Error when encrypting.' })
            }
          }).catch((er) => {
            this.msg(0, er)
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
          this.msg(0, { message: 'Form has erorrs!' })
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
    // const _fee = (this.state.managerApprovalFee ? this.state.managerApprovalFee : 0) +
    // (this.state.managerRegistrationFee ? this.state.managerRegistrationFee : 0)
    const done = (
      <Label align='center'>You are already registered as a company.</Label>
    )

    return (
      <Box align='center'>
        <Heading>Register as a Company</Heading>
        <Box align='center'>
          { this.props.registeredAsManager && this.props.registered ? done : <div>
            <ManagerBanner />
            { !this.props.registered ? <Box align='center'>
              <Label><strong>NOTE</strong>. First you ned to <Link to='/register'>register as an user</Link>, then go back here.</Label>
            </Box>
              : <Box align='center'>
                <Label>This form takes tokens as payment, for ethers based form, please <Link to='/manager_register'>go here</Link></Label>
                <Form onSubmit={this.handleSubmit}>
                  <Input id='company' req={true} label='Company' autocomplete='organization' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='companyAddress' req={true} autocomplete='street-address'
                    label='Company Address' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='companyCity' req={true} label='City' autocomplete='address-level2' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='companyZip' req={true} autocomplete='postal-code'
                    label='ZIP/ Post Code' handleChange={this.handleChange} error={this.state.errors} />
                  <SelectInput req={true} id='companyCountry' autocomplete='country-name'
                    label='Country' data={countries} handleChange={this.handleChange} error={this.state.errors} />
                  <FileInput req={true} id='companyRegDoc' label='Attach your company registration certificate:'
                    handleUploadFile={this.handleUploadFile} error={this.state.errors} />

                  <Heading align='center'>Listing Information</Heading>
                  <SelectInput id='type' label='Where to list'
                    data={dirTypes} handleChange={this.handleChange} error={this.state.errors} />
                  <FileInput id='logo' label='Logo for directory:' handleUploadFile={this.handleUploadFile} error={this.state.errors} />
                  <TextArea id='shortDescription' label='Short description' handleChange={this.handleChange} error={this.state.errors}/>
                  <TextArea id='projectDescription' label='Project description' handleChange={this.handleChange} error={this.state.errors}/>
                  <Input id='website' label='Website URL' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='whitepaper' label='Whitepaper URL' handleChange={this.handleChange} error={this.state.errors} />
                  <DateInput id='startDate' label='Event Start Date' _onChangeDate={this._onChangeDate} error={this.state.errors} />
                  <DateInput id='endDate' label='Event End Date' _onChangeDate={this._onChangeDate} error={this.state.errors} />
                  <Input id='tokenDistribution' label='Token distribution' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='tokenSymbol' label='Token Symbol' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='initialPrice' label='Initial Price' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='softCap' label='Soft Cap' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='hardCap' label='hard Cap' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='facebook' label='Facebook URL' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='twitter' label='Twitter Handle' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='telegram' label='Telegram URL' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='medium' label='Medium URL' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='bitcoinTalk' label='BitcoinTalk URL' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='reddit' label='Reddit URL' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='slack' label='Slack URL' handleChange={this.handleChange} error={this.state.errors} />
                  <SelectInput id='kyc' label='KYC required?'
                    data={kycReq} handleChange={this.handleChange} error={this.state.errors} />
                  <SelectInput id='accepts' label='What currency is accepted?'
                    data={acceptedCurr} handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='restrictions' label='Restrictions' handleChange={this.handleChange} error={this.state.errors} />
                  <Input id='team' label='Team' handleChange={this.handleChange} error={this.state.errors} />
                  <Submit loading={this.state.loading} label='Register' />
                </Form>
                <p><strong>*</strong> Required fields</p>
              </Box>
            }
          </div>
          }
        </Box>
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
    registered: state.registered,
    registeredAsManager: state.registeredAsManager
  }
}

export default connect(mapStateToProps)(ManagerRegTokens)
