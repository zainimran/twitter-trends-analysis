import React from 'react'
import MDbutton from './MDbutton.js'

export default class MeasuresDimensions extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-2">
                    {this.props.data && <h6 style= {{paddingTop: 3, paddingRight: 5}}>Dimensions</h6>}
                    {this.props.data && Object.keys(this.props.data[0]).filter(t => typeof this.props.data[0][t] !== "number")
                        .map((attr, i) => (
                        <MDbutton key={i} type='dimension' setDimension={this.props.setDimension} removeDimension={this.props.removeDimension} label={attr}></MDbutton>
                    ))}
                </div>
                <MDbutton type='measure' setMeasure={this.props.setMeasure} removeMeasure={this.props.removeMeasure} label="Tweet Count"></MDbutton>
                <div className="btn-group mr-2">
                    {this.props.data && <h6 style= {{paddingTop: 10, paddingRight: 5}}>Measures</h6>}
                    {this.props.data && Object.keys(this.props.data[0]).filter(t => typeof this.props.data[0][t] === "number")
                        .map((attr, i) => (
                            <MDbutton key={i} type='measure' setMeasure={this.props.setMeasure} removeMeasure={this.props.removeMeasure} label={attr}></MDbutton>
                    ))}
                </div>
            </div>
        )
    }

}