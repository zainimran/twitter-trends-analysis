import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';
import D3graph from './Components/D3graph.js'
import MeasuresDimensions from './Components/MeasuresDimensions.js'

let dataHandler = function() {}

const socket = openSocket('http://localhost:8000');
socket.on('to_client', res =>
{
  dataHandler.callback(res)
})

var SearchHeading = '';


class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
  }

  handleChange(e) {
    this.setState({value: e.target.value});
  }

  handleEnter(e) {
    var query = this.state.value;
    if (e.keyCode === 13)
    {
      SearchHeading = query
      socket.emit('to_server', query)
      // updateState()
    }
  }

  render() {
    return(
      <input
        ref="searchBarEnter"
        className="form-control form-control-dark w-100"
        type="text"
        onChange={this.handleChange}
        onKeyUp={this.handleEnter}
        placeholder="Enter Search Query"
        aria-label="Search"
        value={this.state.value}
      />
    );
  }
}


class Header extends React.Component {
    render() {
        return(
            <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
              <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#"><span><img src="images/logo.png" width="24px"
              style={{margin:'-3px 12px 0px 0px'}}/></span>
              Social Search</a>
              <SearchBar/>
              <ul className="navbar-nav px-3">
                <li className="nav-item text-nowrap">
                  <a className="nav-link" href="#"><span><img src="images/settings.png" width="24px"
              style={{margin:'-3px 0px 0px 0px'}}/></span></a>
                </li>
              </ul>
            </nav>
        );
    }
}


class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: null,
      selectedDim: [],
      selectedMea: [],
      resetBtns: false,
      currentView: ''
    }
  }

  componentWillMount() {
    dataHandler.callback = (res) => {
      this.setState({data:res.data})
    }
  }

  componentDidUpdate(props) {
    if (this.state.currentView !== this.props.view)
      this.setState({
        currentView: this.props.view,
      })
  }

  setDimension = (e) => {
    e.preventDefault()
    let dim = e.target.innerHTML
    this.setState({ selectedDim: [...this.state.selectedDim, dim] })
  }

  setMeasure = (e) => {
    e.preventDefault()
    let mea = e.target.innerHTML
    this.setState({ selectedMea: [...this.state.selectedMea, mea] })
  }

  removeDimension = (e) => {
    e.preventDefault()
    let dim = e.target.innerHTML
    this.setState({ selectedDim: this.state.selectedDim.filter(d => d !== dim)})
  }

  removeMeasure = (e) => {
    e.preventDefault()
    let mea = e.target.innerHTML
    this.setState({ selectedMea: this.state.selectedMea.filter(m => m !== mea)})
  }

  resetGraph = (e) => {
    this.setState({
      selectedDim: [],
      selectedMea: []
    })
  }

  render(){
      let dimMeaSet = Boolean(this.state.selectedDim.length && this.state.selectedMea.length)
      return(
          <main role="main" className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
              <h1 className="h2"><span><img src="images/search.png" width="24px" style={{margin:'-3px 12px 0px 0px'}}/></span>
                {SearchHeading}</h1>
            </div>
            <MeasuresDimensions data={this.state.data} setDimension={this.setDimension} setMeasure={this.setMeasure} removeDimension={this.removeDimension} removeMeasure={this.removeMeasure}></MeasuresDimensions>
            {!this.state.data && (
              <img src="images/logo.png" width="250px" style={{display:'block', margin:'12% auto auto auto', opacity:'0.2'}}/>
            )}
            {this.state.data && (
              <D3graph data={this.state.data} selectedDim={this.state.selectedDim} selectedMea={this.state.selectedMea} view={this.state.currentView}/>
            )}
            {dimMeaSet && (
              <a href="#" onClick={this.resetGraph}>Reset</a>
            )}
          </main>
      );
    }
};


class Accordian extends React.Component {
  constructor(props){
    super(props)
    this.state = {
       clicked : -1
    }
  }

  handleClick = (e,where) => {
    e.preventDefault()
    this.props.selectView(e)
    this.setState({clicked : where})
  }

  render(){
      return(
          <div id="accordion">
            <div className="card">
              <div className="card-header" id={this.props.heading}>
                <h5 className="mb-0">
                  <button className="btn btn-link" data-toggle="collapse" data-target={"#"+this.props.collapse} aria-expanded="true" aria-controls={this.props.collapse}>
                    <span><img src={"images/"+this.props.image} width="18px" style={{margin:'-3px 12px 0px 0px'}}/></span>
                        {this.props.name} <span className="sr-only">(current)</span>
                  </button>
                </h5>
              </div>

              <div id={this.props.collapse} className={this.props.expand} aria-labelledby={this.props.heading} data-parent="#accordion">
                <div className="card-body">
                  <ul className="nav flex-column">
                    <li className="nav-item">
                      <a className="nav-link" href="#" style={this.state.clicked === 0?{color:'blue', 'textDecoration':'underline'} : null} onClick={(e) => this.handleClick(e,0)}>
                        <span><img src="images/pop.png" width="14px" style={{margin:'-3px 12px 0px 0px'}}/></span>
                        Tabular
                      </a>
                    </li>
                    <li className="nav-item">
                    <a className="nav-link" href="#" style={this.state.clicked === 1?{color:'blue', 'textDecoration':'underline'} : null} onClick={(e) => this.handleClick(e,1)}>
                        <span><img src="images/sent.png" width="14px" style={{margin:'-3px 12px 0px 0px'}}/></span>
                        Bar Chart
                      </a>
                    </li>
                    <li className="nav-item">
                    <a className="nav-link" href="#" style={this.state.clicked === 2?{color:'blue', 'textDecoration':'underline'} : null} onClick={(e) => this.handleClick(e,2)}>
                        <span><img src="images/pop.png" width="14px" style={{margin:'-3px 12px 0px 0px'}}/></span>
                        Line Chart
                      </a>
                    </li>
                    <li className="nav-item" >
                    <a className="nav-link" href="#" style={this.state.clicked === 3?{color:'blue', 'textDecoration':'underline'} : null} onClick={(e) => this.handleClick(e,3)}>
                        <span><img src="images/loc.png" width="14px" style={{margin:'-3px 12px 0px 0px'}}/></span>
                        Location
                      </a>
                    </li>
                    <li className="nav-item">
                    <a className="nav-link" href="#" style={this.state.clicked === 4?{color:'blue', 'textDecoration':'underline'} : null} onClick={(e) => this.handleClick(e,4)}>
                        <span><img src="images/tme.png" width="14px" style={{margin:'-3px 12px 0px 0px'}}/></span>
                        Timeline
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
      );
  }
};


class Sidebar extends React.Component {
    render(){
        return(
            <div className="container-fluid">
              <div className="row">
                <nav className="col-md-2 d-none d-md-block bg-light sidebar">
                  <div className="sidebar-sticky">
                    <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted" style={{paddingBottom:'28px'}}>
                      <span>Social API</span>
                      <a className="d-flex align-items-center text-muted" href="#">
                      </a>
                    </h6>
                    <Accordian name="Twitter Views" collapse="collapseOne" heading="headingOne" expand="collapse show" image="twitter.png" selectView={this.props.selectView}/>
                  </div>
                </nav>
              </div>
            </div>
        );
    }
};


class Page extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      view: null
    }
  }

  selectView = (e) => {
    e.preventDefault()
    this.setState({view: e.target.textContent})
  }

  render() {
    return (
      <div>
        <Header/>
        <Sidebar selectView={this.selectView}/>
        <Main view={this.state.view}/>
      </div>
    )
  }
}


class App extends React.Component {
  render() {
    return (
      <Page></Page>
    );
  }
}

export default App;
