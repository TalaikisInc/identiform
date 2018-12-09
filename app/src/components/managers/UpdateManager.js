import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Joi from 'joi-browser'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'
import Image from 'grommet/components/Image'

import encrypt from 'utils/encrypt'
import decrypt from 'utils/decrypt'
import { countries, companySchema, dirTypes, kycReq, acceptedCurr } from 'utils/data'
import Async from 'components/Async'
import Head from 'components/Head'
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))
const Input = Async(() => import('components/blocks/Input'))
const SelectInput = Async(() => import('components/blocks/SelectInput'))
const FileInput = Async(() => import('components/blocks/FileInput'))
const TextArea = Async(() => import('components/blocks/TextArea'))
const DateInput = Async(() => import('components/blocks/DateInput'))

class UpdateManager extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      success: '',
      failure: '',
      modalOpen: false,
      company: '',
      companyAddress: '',
      companyCity: '',
      companyZip: '',
      companyCountry: '',
      companyRegDoc: '',
      loading: false,
      registered: true,
      loaded: false,
      status: '',
      role: '',
      errros: null,
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
      kyc: null,
      restrictions: '',
      accepts: '',
      team: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleUploadFile = this.handleUploadFile.bind(this)
    this.getManagerData = this.getManagerData.bind(this)
    this._onChangeStartDate = this._onChangeStartDate.bind(this)
    this._onChangeEndDate = this._onChangeEndDate.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    await this.getManagerData()
  }

  _onChangeStartDate = (value) => {
    this.setState({ startDate: value })
  }

  _onChangeEndDate = (value) => {
    this.setState({ endDate: value })
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

  getManagerData = async () => {
    if (this.props.registeredAsManager && this.mounted && !this.state.loaded) {
      this.props.Token.deployed().then(async (token) => {
        token.getManager(this.props.account, { from: this.props.account }).then(async (res) => {
          this.props.ipfs.dag.get(res[1], async (err, hash) => {
            if (err) {
              this.msg(0, err)
            } else {
              this.props.ipfs.files.get(hash.value[0].hash, async (error, _data) => {
                if (error) {
                  this.msg(0, err)
                } else {
                  const j = JSON.parse(_data[0].content.toString('ascii')).data
                  const _obj = await decrypt(this.props.account, j)
                  if (_obj) {
                    const _d = JSON.parse(_obj.data)
                    this.setState({
                      company: _d.company,
                      companyAddress: _d.companyAddress,
                      companyCity: _d.companyCity,
                      companyZip: _d.companyZip,
                      companyCountry: _d.companyCountry,
                      companyRegDoc: _d.companyRegDoc,
                      logo: _d.logo,
                      shortDescription: _d.shortDescription,
                      projectDescription: _d.projectDescription,
                      video: _d.video,
                      startDate: _d.startDate,
                      endDate: _d.endDate,
                      website: _d.website,
                      whitepaper: _d.whitepaper,
                      facebook: _d.facebook,
                      twitter: _d.twitter,
                      telegram: _d.telegram,
                      medium: _d.medium,
                      bitcoinTalk: _d.bitcoinTalk,
                      reddit: _d.reddit,
                      slack: _d.slack,
                      hardCap: _d.hardCap,
                      softCap: _d.softCap,
                      type: _d.type,
                      tokenDistribution: _d.tokenDistribution,
                      tokenSymbol: _d.tokenSymbol,
                      initialPrice: _d.initialPrice,
                      kyc: _d.kyc,
                      restrictions: _d.restrictions,
                      accepts: _d.accepts,
                      team: _d.team,
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
      this.getManagerData()
    }, 5000)
  }

  handleSubmit = (event) => {
    event.preventDefault()

    this.setState({
      loading: true
    })

    if (this.mounted) {
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

      this.props.Token.deployed().then(async (token) => {
        Joi.validate(_obj, companySchema, { abortEarly: false }, async (e, v) => {
          if (!e) {
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
                        const _gas = await token.updateManager.estimateGas(this.props.account, 'EMPTY', _cidBase, { from: this.props.account })
                        token.updateManager(this.props.account, 'EMPTY', _cidBase, {
                          from: this.props.account,
                          gas: _gas,
                          gasPrice: this.props.gasPrice
                        }).then((receipt) => {
                          this.msg(1, receipt)
                        }).catch((er) => {
                          this.msg(0, er)
                        })
                      }
                    })
                  }
                })
              } else {
                this.msg(0, { message: 'Encryption error.' })
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
            this.msg(3, '')
          }
        })
      })
    }
  }

  handleUploadFile(event) {
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
        <Head title="Update Company" />
        <Form onSubmit={this.handleSubmit}>
          <Input req={true} id='company' label='Company' company={this.state.company}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input req={true} id='companyAddress' label='Company Address' companyAddress={this.state.companyAddress}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input req={true} id='companyCity' label='Company City' companyCity={this.state.companyCity}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input req={true} id='companyZip' label='ZIP/ Post Code' companyZip={this.state.companyZip}
            handleChange={this.handleChange} error={this.state.errors} />
          <SelectInput id='companyCountry' label='Country' data={countries} companyCountry={this.state.companyCountry}
            handleChange={this.handleChange} error={this.state.errors} />
          { this.state.companyRegDoc !== '' ? <div><Image src={this.state.companyRegDoc} />
            <FileInput id='companyRegDoc' label='Attach your company registration document:'
              handleUploadFile={this.handleUploadFile} error={this.state.errors} />
          </div>
            : ''
          }
          <Heading align='center'>Listing Information</Heading>
          <SelectInput id='type' label='Where to list' type={this.state.type}
            data={dirTypes} handleChange={this.handleChange} error={this.state.errors} />
          { this.state.logo !== '' ? <div><Image src={this.state.logo} />
            <FileInput id='logo' label='Logo for directory:'
              handleUploadFile={this.handleUploadFile} error={this.state.errors} />
          </div>
            : ''
          }
          <TextArea id='shortDescription' label='Short description' shortDescription={this.state.shortDescription}
            handleChange={this.handleChange} error={this.state.errors} />
          <TextArea id='projectDescription' label='Project description' projectDescription={this.state.projectDescription}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='website' label='Website URL' website={this.state.website}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='whitepaper' label='Whitepaper URL' whitepaper={this.state.whitepaper}
            handleChange={this.handleChange} error={this.state.errors} />
          <DateInput id='startDate' label='Event Start Date' startDate={this.state.startDate}
            _onChangeDate={this._onChangeStartDate} error={this.state.errors} />
          <DateInput id='endDate' label='Event End Date' endDate={this.state.endDate}
            _onChangeDate={this._onChangeEndDate} error={this.state.errors} />
          <Input id='tokenDistribution' label='Token distribution' tokenDistribution={this.state.tokenDistribution}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='tokenSymbol' label='Token Symbol' tokenSymbol={this.state.tokenSymbol}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='initialPrice' label='Initial Price' initialPrice={this.state.initialPrice}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='softCap' label='Soft Cap' softCap={this.state.softCap}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='hardCap' label='hard Cap' hardCap={this.state.hardCap}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='facebook' label='Facebook URL' facebook={this.state.facebook}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='twitter' label='Twitter Handle' company={this.state.twitter}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='telegram' label='Telegram URL' telegram={this.state.telegram}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='medium' label='Medium URL' medium={this.state.medium}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='bitcoinTalk' label='BitcoinTalk URL' bitcoinTalk={this.state.bitcoinTalk}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='reddit' label='Reddit URL' reddit={this.state.reddit}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='slack' label='Slack URL' slack={this.state.slack}
            handleChange={this.handleChange} error={this.state.errors} />
          <SelectInput id='kyc' label='KYC required?' kyc={this.state.kyc}
            data={kycReq} handleChange={this.handleChange} error={this.state.errors} />
          <SelectInput id='accepts' label='What currency is accepted?' accepts={this.state.accepts}
            data={acceptedCurr} handleChange={this.handleChange} error={this.state.errors} />
          <Input id='restrictions' label='Restrictions' restrictions={this.state.restrictions}
            handleChange={this.handleChange} error={this.state.errors} />
          <Input id='team' label='Team' handleChange={this.handleChange} team={this.state.team}
            error={this.state.errors} />
          <Submit loading={this.state.loading} label='Update' />
        </Form>
        <p><strong>*</strong> Required fields</p>
      </Box>
    )
    const managerRender = (
      this.state.company !== '' ? form : <Label align='center'>Loading data...</Label>
    )

    return (
      <Box align='center'>
        <Heading>Update Company Account</Heading>
        { this.props.registeredAsManager ? managerRender
          : <Label align='center'>{this.state.status}</Label>
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
    registeredAsManager: state.registeredAsManager
  }
}

export default connect(mapStateToProps)(UpdateManager)
