import React, { Component } from 'react'
import { connect } from 'react-redux'
import web3utils from 'web3-utils'

import Heading from 'grommet/components/Heading'
import Box from 'grommet/components/Box'
import TextInput from 'grommet/components/TextInput'
import Label from 'grommet/components/Label'
import Form from 'grommet/components/Form'
import Table from 'grommet/components/Table'
import TableHeader from 'grommet/components/TableHeader'
import TableRow from 'grommet/components/TableRow'
import Image from 'grommet/components/Image'

import decrypt from 'utils/decrypt'
import { stateMap } from 'utils/utils'
import Async from 'components/Async'
const Popup = Async(() => import('components/blocks/Popup'))
const Submit = Async(() => import('components/blocks/Submit'))

class GetUser extends Component {
  constructor() {
    super()

    this.mounted = false

    this.state = {
      modalOpen: null,
      success: '',
      failure: '',
      userCount: '',
      user: '',
      userId: '',
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      docType: '',
      docNo: '',
      addressDocument: '',
      idDocument: '',
      agreeToS: '',
      agreeToICOs: '',
      agreeToAirdrops: '',
      loading: false,
      loading2: false
    }

    this.getUserData = this.getUserData.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getUsersCount = this.getUsersCount.bind(this)
  }

  componentWillMount = () => {
    this.mounted = true
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  componentDidMount = async () => {
    await this.getUsersCount()
  }

  getUsersCount = async () => {
    this.props.Token.deployed().then(async (token) => {
      token.getUserCount().then((res) => {
        if (this.mounted) {
          this.setState({
            userCount: res ? res.toNumber() : 0
          })
        }
      })
    })

    setTimeout(() => {
      this.getUsersCount()
    }, 2000)
  }

  handleChange = (event) => {
    const { target } = event
    const value = target.type === 'checkbox' ? target.checked : target.value
    const { name } = target

    if (this.mounted) {
      this.setState({
        [name]: value
      })
    }
  }

  getUserData = (event) => {
    event.preventDefault()

    this.setState({
      loading: true
    })

    let reqType
    if (this.state.userId !== '') {
      reqType =  'getUserAtIndex'
    }

    if (web3utils.isAddress(this.state.user)) {
      reqType = 'getUser'
    }

    if (reqType) {
      this.props.Token.deployed().then(async (token) => {
        const q = reqType === 'getUserAtIndex' ? this.state.userId : this.state.user
        console.log('what we rweust')
        console.log(q)
        token[reqType](q, { from: this.props.account }).then(async (res) => {
          this.props.ipfs.dag.get(res[1], async (err, hash) => {
            if (err) {
              this.msg(0, err)
            } else {
              this.setState({
                status: await stateMap(res[2]),
                statusCode: res[2].toNumber(),
                reputation: res[5] ? res[5].toNumber() : ''
              })

              this.props.ipfs.files.get(hash.value[0].hash, async (error, _data) => {
                if (error) {
                  this.msg(0, error)
                } else {
                  const j = JSON.parse(_data[0].content.toString('ascii')).data

                  let _obj
                  if (reqType === 'getUserAtIndex') {
                    _obj = await decrypt(res[5], j)
                  } else {
                    _obj = await decrypt(this.state.user, j)
                  }

                  if (_obj) {
                    const _d = JSON.parse(_obj.data)
                    this.setState({
                      user: res[3],
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
                      idDocument: _d.idDocument,
                      agreeToS: _d.agreeToS,
                      agreeToICOs: _d.agreeToICOs,
                      agreeToAirdrops: _d.agreeToAirdrops,
                      loading: false
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
    return (
      <Box align='center'>
        <Heading>Get User</Heading>
        <Label>Found { this.state.userCount } user(s).</Label>

        <Table>
          <TableHeader labels={['Data', 'Value']} sortIndex={0} />
          <tbody>
            <TableRow>
              <td>No.</td>
              <td>{ this.state.userId ? this.state.userId : '' }</td>
            </TableRow>
            <TableRow>
              <td>ETH address</td>
              <td>{ this.state.user ? this.state.user : '' }</td>
            </TableRow>
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

        <Form onSubmit={this.getUserData}>
          <Box pad='small' align='center'>
            <Label labelFor='userId'>By ID:</Label>
          </Box>
          <Box pad='small' align='center'>
            <TextInput
              id='userId'
              type='number'
              step='1'
              onDOMChange={this.handleChange}
              value={this.state.userId}
              name='userId'
              placeHolder='User ID'/>
          </Box>
          <Submit loading={this.state.loading} label='Get' />
        </Form>

        <Form onSubmit={this.getUserData}>
          <Box pad='small' align='center'>
            <Label labelFor='address'>By Address:</Label>
          </Box>
          <Box pad='small' align='center'>
            <TextInput
              id='address'
              type='text'
              onDOMChange={this.handleChange}
              value={this.state.user}
              name='user'
              placeHolder='User Address'/>
          </Box>
          <Submit loading={this.state.loading} label='Get' />
        </Form>
        <Popup modalOpen={this.state.modalOpen} success={this.state.success} failure={this.state.failure} />
      </Box>
    )
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3,
    ipfs: state.ipfs,
    Token: state.Token,
    account: state.account
  }
}

export default connect(mapStateToProps)(GetUser)
