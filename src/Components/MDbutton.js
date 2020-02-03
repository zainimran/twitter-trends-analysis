import React from 'react'

export default class MDButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isActive: false
        }
    }

    handleClick = (e) => {
        e.preventDefault()
        if (!this.state.isActive) {
            this.setState({isActive: true})
            if (this.props.type == 'dimension')
                this.props.setDimension(e)
            else if (this.props.type == 'measure')
                this.props.setMeasure(e)
        }
        else {
            this.setState({isActive: false})
            if (this.props.type == 'dimension')
                this.props.removeDimension(e)
            else if (this.props.type == 'measure')
                this.props.removeMeasure(e)
        }
    }

    render() {
        return (
            <div style={{paddingRight : 3}}>
                {this.props.type === 'dimension' &&
                    <button className="btn btn-sm btn-outline-secondary" data-toggle="button" onClick={this.handleClick}>{this.props.label}</button>
                }
                {this.props.type === 'measure' && (
                    <div className="btn group">
                        <button className="btn btn-sm btn-outline-secondary" data-toggle="button" onClick={this.handleClick}>{this.props.label}</button>
                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenu">
                            <h6 className="dropdown-header">Apply Aggregation</h6>
                            <button className="dropdown-item" type="button">COUNT</button>
                            <button className="dropdown-item" type="button">SUM (default)</button>
                            <button className="dropdown-item" type="button">AVG</button>
                            <button className="dropdown-item" type="button">MIN</button>
                            <button className="dropdown-item" type="button">MAX</button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

