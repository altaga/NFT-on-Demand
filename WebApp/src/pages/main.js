// Basic imports
import '../assets/main.css';
import { Component } from 'react';
import autoBind from 'react-autobind';
import Footer from '../components/footer';
import Header from '../components/header';
import { Button, Card, CardBody, CardImg, CardSubtitle, CardText, CardTitle, Col, Input, ListGroup, ListGroupItem, Row } from 'reactstrap';
import gif from '../assets/gif.gif';
import { abi } from '../contracts/nftContract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { FaFileInvoiceDollar, FaImage, FaPalette, FaUpload } from 'react-icons/fa';
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const dataweb3 = createAlchemyWeb3("https://eth-ropsten.alchemyapi.io/v2/bKQTjG-gPiywyFe748IzezZI9bH8We7z");

function shuffle(inArray) {
  let tempArray = inArray;
  for (let i = tempArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = tempArray[i];
    tempArray[i] = tempArray[j];
    tempArray[j] = temp;
  }
  return tempArray;
}

function searchInJSON(json, searchTerm) {
  let result = [];
  let avoid = [];
  for (let i = 0; i < json.length; i++) {
    
    if (JSON.parse(json[i].Data).name.toLowerCase().includes(searchTerm.toLowerCase())) {
      avoid.push(i);
      result.push(json[i]);
    }
  }
  for (let i = 0; i < json.length; i++) {
    if (JSON.parse(json[i].Data).attributes[0].artist.toLowerCase().includes(searchTerm.toLowerCase()) && avoid.indexOf(i) === -1) {
      result.push(json[i]);
    }
  }
  return result;
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      elements: [],
      artist: {},
      prices: [],
      status: [],
      search: "",
      searchElements: [],
      searchResults: [],
    }
    autoBind(this);
    this.unirest = require('unirest');
  }

  async componentDidMount() {
    this.unirest('GET', 'https://gp1x01febi.execute-api.us-east-1.amazonaws.com/getFullDB')
      .end((res) => {
        if (res.error) throw new Error(res.error);
        if (res.body.length > 0) {
          let temp = this.state.artist;
          let temp2 = res.body;
          let temp3 = []
          let temp4 = []
          for (let i = 0; i < res.body.length; i++) {
            if (temp[res.body[i]["PubKey"]] === undefined) {
              temp[res.body[i]["PubKey"]] = 0;
            }
            else {
              temp[res.body[i]["PubKey"]]++;
            }
            temp2[i]["Counter"] = temp[res.body[i]["PubKey"]]
            temp3.push("0")
            temp4.push(res.body[i])
            temp2[i]["index"] = i
          }
          this.setState({
            elements: shuffle(temp2),
            prices: temp3,
            searchElements: temp4,
          }, () => {
            for (let i = 0; i < res.body.length; i++) {
              this.updatePrice(res.body[i]["Contract"], i)
            }
          });
        }
      });
  }

  updatePrice(contract, id) {
    const mint_contract = new dataweb3.eth.Contract(abi(), contract);
    mint_contract.methods.flag().call().then(status => {
      let temp = this.state.status;
      temp[id] = status;
      this.setState({
        status: temp
      });
    });
    mint_contract.methods.price().call().then(price => {
      let temp = this.state.prices;
      temp[id] = price;
      this.setState({
        prices: temp
      });
    });
  }

  render() {
    return (
      <div className="App" style={{ overflowX: "hidden" }}>
        <Header />
        <div className="body-style" id="body-style" style={{ overflowX: "hidden", overflowY: "hidden" }}>
          <div>
            <Row style={{ paddingBottom: "13vh" }}>
              <Col style={{ paddingTop: "14vh", paddingLeft: "12vw" }}>
                <h1 style={{ fontWeight: "bold", fontSize: "4rem" }}>Welcome to NFT onDemand</h1>
                <h5>
                  <p />NFT on Demand is a marketplace that connects users with real NFT artists,
                  <p />where you can order the content you want to have. 
                </h5>
                <br />
                <Row>
                  <Col>
                    <div style={{ width: "90%", paddingLeft: "5%" }} className="flexbox-style">
                      <Input onClick={()=>{
                        this.setState({
                          searchResults:[],
                        })
                      }} onChange={(event) => {
                        this.setState({
                          search: event.target.value
                        });
                      }} style={{ borderRadius: "25px 0px 0px 25px", fontSize: "1.5rem" }} type="text"
                        placeholder="Search Artist or Content" />
                      <Button
                        onClick={() => {
                          console.log(searchInJSON(this.state.searchElements, this.state.search))
                          this.setState({
                            searchResults: searchInJSON(this.state.searchElements, this.state.search)
                          });
                        }}
                        style={{ width: "200px", borderRadius: "0px 25px 25px 0px", fontSize: "1.5rem", background: `rgb(255,128,0)` }}>Search</Button>
                    </div>
                    <div style={{height:"20px"}}>
                    {
                      this.state.searchResults.length > 0 &&
                      <ListGroup style={{paddingLeft:"8%",overflowY:"scroll",height:"18vh",width:"67%"}}>
                        {
                          this.state.searchResults.map((element) => {
                            return (
                              <ListGroupItem style={{textAlign:"justify"}}>
                                <a className="nostyle" href={`/nft/${element.PubKey}?id=${element.Counter}`}>
                                {
                                  "NFT: " + JSON.parse(element.Data).name + ", Artist: "+ JSON.parse(element.Data).attributes[0].artist
                                }
                                </a>
                              </ListGroupItem>
                            )
                          })
                        }
                      </ListGroup>
                    }
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col>
                <img src={gif} alt="gif" style={{ width: "100%" }} />
              </Col>
            </Row>
            <br />
            <div className="myhr2" />
            <div style={{ paddingTop: "4vh" }}>
              <h1>
                Exclusives from NFT on Demand
              </h1>
            </div>
            <br />
            <div className="flexbox-style">
              {
                this.state.elements.map((item, index) => {
                  if (index < 3) {
                    return (
                      <div key={"element" + index} style={{ margin: "10px", height: "74vh" }}>
                        <Card id={"cards" + index} style={{ width: "20vw", height: "74vh" }}>
                          <div style={{ opacity: "100%", textAlign: "center", paddingTop: "10px" }} >
                            <CardImg style={{ width: "150px", height: "150px", borderRadius: "10px", border: "1px solid #bbb" }} top src={item.Url} alt="Card image cap" />
                          </div>
                          <br />
                          <CardBody>
                            <CardTitle tag="h5">{JSON.parse(item.Data).attributes[0].artist}</CardTitle>
                            <br />
                            <CardSubtitle tag="h6" className="mb-2 text-muted">
                              <div className="flexbox-style">
                                <div>
                                  {"Price:"}
                                  <>&nbsp;</>
                                </div>
                                <div>
                                  {
                                    this.state.prices[index] === "0" ?
                                      "....."
                                      :
                                      dataweb3.utils.fromWei(this.state.prices[index], 'ether')
                                  }
                                </div>
                                <>&nbsp;</>
                                <FontAwesomeIcon icon={faEthereum} />
                                {
                                  !this.state.status[index] &&
                                  <div style={{ color: "red" }}>
                                    <>&nbsp;</>
                                    Sold
                                  </div>
                                }
                              </div>
                            </CardSubtitle>
                            <br />
                            <div style={{ overflowY: "hidden", height: "100%" }}>
                              <CardText >
                                {
                                  JSON.parse(item.Data).description.length > 150 ?
                                    JSON.parse(item.Data).description.substring(0, 150) + "..." :
                                    JSON.parse(item.Data).description
                                }
                              </CardText>
                            </div>
                            <br />
                            <div className="flexbox-style">
                              <div style={{ position: "absolute", bottom: "2vh" }}>
                                <Button style={{ width: "200px", borderRadius: "25px", fontSize: "1.3rem", background: ` rgb(255,128,0)` }} onClick={() => {
                                  window.open(`/nft/${item.PubKey}?id=${item.Counter}`, "_blank");
                                }}>Open NFT</Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    )
                  }
                  else {
                    return null
                  }
                })
              }
            </div>
            <br />
            <br />
            <div className="myhr2" />
            <div style={{ paddingTop: "4vh" }}>
              <div>
                <h1>
                  Create and sell your NFTs
                </h1>
              </div>
              <Row style={{ padding: "10vh 4vh 4vh 4vh" }}>
                <Col>
                  <div>
                    <FaImage className="fa-gradient1" />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bolder", paddingTop: "2vh", paddingBottom: "2vh" }}>
                    Connect to your wallet
                  </div>
                  <div style={{ padding: "0px 20px 0px 20px" }}>
                    Set up your wallet of choice. Link your NFT profile by clicking the wallet icon on the top right corner. Learn more in the wallets section.
                  </div>
                </Col>
                <Col>
                  <div>
                    <FaPalette className="fa-gradient2" />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bolder", paddingTop: "2vh", paddingBottom: "2vh" }}>
                    Order your NFT
                  </div>
                  <div style={{ padding: "0px 20px 0px 20px" }}>
                    Place an order from your favorite artist. Request content made only for you. Describe your NFT and get the NFT you want to have.
                  </div>
                </Col>
                <Col>
                  <div>
                    <FaUpload className="fa-gradient3" />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bolder", paddingTop: "2vh", paddingBottom: "2vh" }}>
                    Upload your content
                  </div>
                  <div style={{ padding: "0px 20px 0px 20px" }}>
                    Create your artist profile, upload your descriptions. Also upload content you use to work with, participate in our Art Contest and be prepared to fulfill the orders from users all around the world!
                  </div>
                </Col>
                <Col>
                  <div>
                    <FaFileInvoiceDollar className="fa-gradient4" />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bolder", paddingTop: "2vh", paddingBottom: "2vh" }}>
                    Sell your Content
                  </div>
                  <div style={{ padding: "0px 20px 0px 20px" }}>
                    Choose between put your content on
                    sale or place it on the contest section.
                    Choose between accepting orders, or
                    just sale it in the marketplace.
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default Main;