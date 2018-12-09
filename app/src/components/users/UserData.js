import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import Table from 'grommet/components/Table'
import TableRow from 'grommet/components/TableRow'
import TableHeader from 'grommet/components/TableHeader'
import Image from 'grommet/components/Image'
import Anchor from 'grommet/components/Anchor'
import Label from 'grommet/components/Label'
import Paragraph from 'grommet/components/Paragraph'
import EditIcon from 'grommet/components/icons/base/Edit'
import IntegrationIcon from 'grommet/components/icons/base/Integration'
import LinkIcon from 'grommet/components/icons/base/Link'
import DelIcon from 'grommet/components/icons/base/Trash'
import SocialFacebook from 'grommet/components/icons/base/SocialFacebook'
import SocialTwitter from 'grommet/components/icons/base/SocialTwitter'
import SocialSlack from 'grommet/components/icons/base/SocialSlack'
import SocialBitcoin from 'grommet/components/icons/base/SocialBitcoin'
import SocialMedium from 'grommet/components/icons/base/SocialMedium'
import SocialReddit from 'grommet/components/icons/base/SocialReddit'

import decrypt from 'utils/decrypt'
import { stateMap } from 'utils/utils'
import Async from 'components/Async'
import Head from 'components/Head'
const Bonus = Async(() => import('components/blocks/Bonus'))
const Reputation = Async(() => import('components/blocks/Reputation'))

class UserData extends PureComponent {
  constructor(props) {
    super(props)

    this.mounted = false

    this.state = {
      failure: '',
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      docType: '',
      docNo: '',
      dob: '',
      userZip: '',
      addressDocument: '',
      idDocument: '',
      redirect: '',
      company: '',
      companyAddress: '',
      companyCity: '',
      companyZip: '',
      companyCountry: '',
      companyRegDoc: '',
      status: '',
      statusCode: 0,
      reputation: '',
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

    this.getUserData = this.getUserData.bind(this)
    this.getManagerData = this.getManagerData.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    await this.getUserData()
    await this.getManagerData()
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

  getUserData = async () => {
    if (this.props.registered) {
      this.props.Token.deployed().then(async (token) => {
        token.getUser(this.props.account, { from: this.props.account }).then(async (res) => {
          this.props.ipfs.dag.get(res[0], async (err, hash) => {
            if (err) {
              this.msg(0, err)
            } else {
              this.setState({
                status: await stateMap(res[1]),
                statusCode: res[1].toNumber(),
                reputation: res[4] ? res[4].toNumber() : ''
              })

              this.props.ipfs.files.get(hash.value[0].hash, async (error, _data) => {
                if (error) {
                  this.msg(0, error)
                } else {
                  const j = JSON.parse(_data[0].content.toString('ascii')).data
                  const _obj = await decrypt(this.props.account, j)
                  if (_obj) {
                    const _d = JSON.parse(_obj.data)
                    this.setState({
                      email: _d.email,
                      firstName: _d.firstName,
                      lastName: _d.lastName,
                      address: _d.address,
                      city: _d.city,
                      country: _d.country,
                      phone: _d.phone,
                      docType: _d.docType,
                      docNo: _d.docNo,
                      dob: _d.dob,
                      userZip: _d.userZip,
                      addressDocument: _d.addressDocument,
                      idDocument: _d.idDocument
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
      this.getUserData()
    }, 5000)
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

  getManagerData = async () => {
    if (this.props.registeredAsManager && this.mounted) {
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
                      team: _d.team
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

  render() {
    const userData = (
      <div>
        <Heading>Your Data
          <Anchor onClick={() => { this.setState({ redirect: '/edit' }) }} icon={<EditIcon />} />
          <Anchor onClick={() => { this.setState({ redirect: '/delete' }) }} icon={<DelIcon />} />
        </Heading>
        { this.state.redirect !== '' ? <Redirect to={this.state.redirect} /> : '' }
        <Table>
          <TableHeader labels={['Data', 'Value']} sortIndex={0} />
          <tbody>
            <TableRow>
              <td>Email</td>
              <td>{ this.state.email ? this.state.email : '' }</td>
            </TableRow>
            <TableRow>
              <td>First name</td>
              <td>{ this.state.firstName ? this.state.firstName : '' }</td>
            </TableRow>
            <TableRow>
              <td>Last name</td>
              <td>{ this.state.lastName ? this.state.lastName : '' }</td>
            </TableRow>
            <TableRow>
              <td>Address</td>
              <td>{ this.state.address ? this.state.address : '' }</td>
            </TableRow>
            <TableRow>
              <td>City</td>
              <td>{ this.state.city ? this.state.city : '' }</td>
            </TableRow>
            <TableRow>
              <td>Country</td>
              <td>{ this.state.country ? this.state.country : '' }</td>
            </TableRow>
            <TableRow>
              <td>Phone</td>
              <td>{ this.state.phone ? this.state.phone : '' }</td>
            </TableRow>
            <TableRow>
              <td>Date of Birth</td>
              <td>{ this.state.dob ? this.state.dob : '' }</td>
            </TableRow>
            <TableRow>
              <td>Document type</td>
              <td>{ this.state.docType ? this.state.docType : '' }</td>
            </TableRow>
            <TableRow>
              <td>Document no.</td>
              <td>{ this.state.docNo ? this.state.docNo : '' }</td>
            </TableRow>
            <TableRow>
              <td>ID document</td>
              <td>{ this.state.idDocument ? <Image src={this.state.idDocument} /> : '' }</td>
            </TableRow><TableRow>
              <td>Address confirmation</td>
              <td>{ this.state.addressDocument ? <Image src={this.state.addressDocument} /> : '' }</td>
            </TableRow>
          </tbody>
        </Table>
      </div>
    )

    const refData = (
      <div>
        <Heading>Referral Data</Heading>
        <Paragraph>You're registered as a referral.</Paragraph>
        <Paragraph>Send users to your <Link to='/not_implemented'>registration form</Link> with your embedded ID and earn!*</Paragraph>
        <Paragraph>Or build your own using our <Link to='/not_implemented'>API</Link>.*</Paragraph>
      </div>
    )

    const companyData = (
      <div>
        <Heading>Company Data
          <Anchor onClick={() => { this.setState({ redirect: '/manager_edit' }) }} icon={<EditIcon />} />
          <Anchor onClick={() => { this.setState({ redirect: '/manager_delete' }) }} icon={<DelIcon />} />
        </Heading>
        { this.state.redirect !== '' ? <Redirect to={this.state.redirect} /> : '' }
        <Table>
          <TableHeader labels={['Data', 'Value']} sortIndex={0} />
          <tbody>
            <TableRow>
              <td>Company</td>
              <td>{ this.state.company ? this.state.company : '' }</td>
            </TableRow>
            <TableRow>
              <td>Company address</td>
              <td>{ this.state.companyAddress ? this.state.companyAddress : '' }</td>
            </TableRow>
            <TableRow>
              <td>Company city</td>
              <td>{ this.state.companyCity ? this.state.companyCity : '' }</td>
            </TableRow>
            <TableRow>
              <td>Company ZIP/ post code</td>
              <td>{ this.state.companyZip ? this.state.companyZip : '' }</td>
            </TableRow>
            <TableRow>
              <td>Country</td>
              <td>{ this.state.companyCountry ? this.state.companyCountry : '' }</td>
            </TableRow>
            <TableRow>
              <td>Document</td>
              <td>{ this.state.companyRegDoc ? <Image src={this.state.companyRegDoc} /> : '' }</td>
            </TableRow>
            <TableRow>
              <td>Logo</td>
              <td>{ this.state.logo ? <Image src={this.state.logo} /> : '' }</td>
            </TableRow>
            <TableRow>
              <td>Short Description</td>
              <td>{ this.state.shortDescription ? this.state.shortDescription : '' }</td>
            </TableRow>
            <TableRow>
              <td>Project Description</td>
              <td>{ this.state.projectDescription ? this.state.projectDescription : '' }</td>
            </TableRow>
            <TableRow>
              <td>Video</td>
              <td>{ this.state.video ? this.state.video : '' }</td>
            </TableRow>
            <TableRow>
              <td>Start Date</td>
              <td>{ this.state.startDate ? this.state.startDate : '' }</td>
            </TableRow>
            <TableRow>
              <td>End Date</td>
              <td>{ this.state.endDate ? this.state.endDate : '' }</td>
            </TableRow>
            <TableRow>
              <td>Links</td>
              <td>
                { this.state.website ? <a href={this.state.website}><LinkIcon /></a> : '' }
                { this.state.whitepaper ? <a href={this.state.whitepaper}><IntegrationIcon /></a> : '' }
                { this.state.facebook ? <a href={this.state.facebook}><SocialFacebook /></a> : '' }
                { this.state.twitter ? <a href={this.state.twitter}><SocialTwitter /></a> : '' }
                { this.state.medium ? <a href={this.state.medium}><SocialMedium /></a> : '' }
                { this.state.slack ? <a href={this.state.slack}><SocialSlack /></a> : '' }
                { this.state.bitcoinTalk ? <a href={this.state.bitcoinTalk}><SocialBitcoin /></a> : '' }
                { this.state.reddit ? <a href={this.state.reddit}><SocialReddit /></a> : '' }
                { this.state.telegram ? <a href={this.state.telegram}>Telegram</a> : '' }
              </td>
            </TableRow>
            <TableRow>
              <td>Hard Cap</td>
              <td>{ this.state.hardCap ? this.state.hardCap : '' }</td>
            </TableRow>
            <TableRow>
              <td>Soft Cap</td>
              <td>{ this.state.type ? this.state.type : '' }</td>
            </TableRow>
            <TableRow>
              <td>End Date</td>
              <td>{ this.state.endDate ? this.state.endDate : '' }</td>
            </TableRow>
            <TableRow>
              <td>Part of Catalog</td>
              <td>{ this.state.type ? this.state.type : '' }</td>
            </TableRow>
            <TableRow>
              <td>Token distribution</td>
              <td>{ this.state.tokenDistribution ? this.state.tokenDistribution : '' }</td>
            </TableRow>
            <TableRow>
              <td>Token Symbol</td>
              <td>{ this.state.tokenSymbol ? this.state.tokenSymbol : '' }</td>
            </TableRow>
            <TableRow>
              <td>Initial price</td>
              <td>{ this.state.initialPrice ? this.state.initialPrice : '' }</td>
            </TableRow>
            <TableRow>
              <td>KYC</td>
              <td>{ this.state.kyc ? this.state.kyc : '' }</td>
            </TableRow>
            <TableRow>
              <td>Restrictions</td>
              <td>{ this.state.restrictions ? this.state.restrictions : '' }</td>
            </TableRow>
            <TableRow>
              <td>Accepted currencies</td>
              <td>{ this.state.accepts ? this.state.accepts : '' }</td>
            </TableRow>
            <TableRow>
              <td>Team</td>
              <td>{ this.state.team ? this.state.team : '' }</td>
            </TableRow>
          </tbody>
        </Table>
      </div>
    )

    const statusRender = (
      <div>
        <Heading>Status</Heading>
        { this.props.registered ? <Label>{ this.state.status ? <div>Your status is&nbsp;
          { this.state.status }.</div> : '' } You should be approved in order to edit your data.</Label>
          : <Label>You are not registered yet, please register and get <Bonus bonus='registrationBonus' /> IDF coins for free.</Label>
        }
      </div>
    )

    const userRender = (
      this.state.email !== '' ? userData : <Label align='center'>Loading data...</Label>
    )

    const managerRender = (
      this.state.company !== '' ? companyData : <Label align='center'>Loading data...</Label>
    )

    return (
      <Box>
        <Head title="My Data" />
        { this.props.registered ? userRender : statusRender }
        { this.props.registeredAsManager ? managerRender : '' }
        { this.props.registeredAsRef ? refData : '' }
        <div>
          <Heading>Reputation</Heading>
          <Label>You have { this.state.reputation !== '' ? this.state.reputation : 0 } points.</Label>
          <Paragraph>
            How to raise your ID status?
          </Paragraph>
          <ul>
            <li><Link to='/confirm'>Confirm your email</Link> and receive <Reputation rep='emailConfirmationPoints' /> reputation points.</li>
            <li><Link to='/not_implemented'>Confirm your ID</Link> and receive <Reputation rep='idDocumentPoints' /> reputation points.</li>
            <li><Link to='/not_implemented'>Confirm your Address</Link> and receive <Reputation rep='addressDocumentPoints' /> reputation points.</li>
          </ul>
          <Paragraph>
            Why to raise your reputation level?
          </Paragraph>
          <ul>
            <li>You will appear higher in the reputation results with more exposure to your business.</li>
            <li>Managers will pay more for more known and reputable accounts.</li>
            <li>You will be able to use more services.</li>
          </ul>
        </div>
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    ipfs: state.ipfs,
    Token: state.Token,
    account: state.account,
    registered: state.registered,
    registeredAsManager: state.registeredAsManager,
    registeredAsRef: state.registeredAsRef
  }
}

export default connect(mapStateToProps)(UserData)
