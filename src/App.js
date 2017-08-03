import React from 'react';
import { FormGroup, ControlLabel, FormControl, InputGroup, Table, Col } from 'react-bootstrap';

Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

const FormExample = React.createClass({
  getInitialState() {
    return {
      assetBalance: 10,
      assetPrice: 100,
      fiatBalance: 0,
      salesPerPeriod: 0,
      periods: 10,
    };
  },

  handleChange(e) {
    const target = e.target;
    const name = target.name;
    let val = parseFloat(target.value);
    if (isNaN(val)) {
      this.setState({
        [name]: 0
      });
    } else {
      if (val) {
        this.setState({
          [name]: val
        });
      }
    }
  },

  salesPerPeriodAsDecimal() {
    return this.state.salesPerPeriod / 100;
  },

  assetPriceForPeriod(period) {
    return this.state.assetPrice * Math.pow(2, period)
  },

  assetBalanceForPeriod(period) {
    return this.state.assetBalance * Math.pow(1 - this.salesPerPeriodAsDecimal(), period)
  },

  assetWorthForPeriod(period) {
    return this.assetBalanceForPeriod(period) * this.assetPriceForPeriod(period)
  },

  assetSaleForPeriod(period) {
    if(period > 0) {
      return this.assetBalanceForPeriod(period - 1) * this.salesPerPeriodAsDecimal();
    }
    else {
      return 0;
    }
  },

  assetSaleWorthForPeriod(period) {
    return this.assetSaleForPeriod(period) * (this.assetPriceForPeriod(period) * 0.75)
  },

  assetSoldForPeriod(period) {
    return this.state.assetBalance - this.assetBalanceForPeriod(period)
  },

  portfolioIncrease(fiatBalance, period) {
    if(this.assetWorthForPeriod(period) > 0) {
      return (((fiatBalance + this.assetWorthForPeriod(period)) / (this.state.fiatBalance + this.assetWorthForPeriod(0)) * 100) - 100)
    }
    else {
      return 0;
    }
  },

  render() {
    var lis = [];

    var fiatBalance = this.state.fiatBalance;
    var startAssetWorth = this.assetWorthForPeriod(0);
    for (var i=0; i <= this.state.periods; i++) {
      var assetSaleWorth = this.assetSaleWorthForPeriod(i);
      var assetWorth = this.assetWorthForPeriod(i);
      fiatBalance += assetSaleWorth;
      lis.push(
        <tr>
          <td>{i}</td>
          <td className="text-right">{this.assetBalanceForPeriod(i).format(5) }</td>
          <td className="text-right">{this.assetPriceForPeriod(i).format(0)}</td>
          <td className="text-right">{assetWorth.format(2)}</td>
          {this.state.salesPerPeriod > 0 &&
          <td className="text-right">{this.assetSaleForPeriod(i).format(5)}</td>
          }
          {this.state.salesPerPeriod > 0 &&
          <td className="text-right">{assetSaleWorth.format(2)}</td>
          }
          {this.state.salesPerPeriod > 0 &&
          <td className="text-right">{this.assetSoldForPeriod(i).format(5)}</td>
          }
          {this.state.fiatBalance > 0 &&
          <td className="text-right">{fiatBalance.format(2)}</td>
          }
          {this.state.fiatBalance > 0 &&
          <td className="text-right">{(assetWorth / fiatBalance).format(5)}</td>
          }
          {this.state.salesPerPeriod > 0 &&
          <td className="text-right">{(fiatBalance + assetWorth).format(2)}</td>
          }
          <td className="text-right">{this.portfolioIncrease(fiatBalance, i).format(0)} %</td>
        </tr>
      );
    }
    return (
      <div>
        <div className="col-md-6 col-md-offset-3 col-xs-12">
          <form horizontal>
            <FormGroup
              controlId="formBasicText"
            >
              <Col componentClass={ControlLabel} sm={6}>
                Asset Balance
              </Col>
              <Col sm={6}>
                <FormControl
                  type="text"
                  name="assetBalance"
                  value={this.state.assetBalance}
                  placeholder="Enter number"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={6}>
                Asset Price
              </Col>
              <Col sm={6}>
                <FormControl
                  type="text"
                  name="assetPrice"
                  value={this.state.assetPrice}
                  placeholder="Enter number"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={6}>
                Sales Of Asset Per Doubling
              </Col>
              <Col sm={6}>
                <InputGroup>
                  <FormControl
                    type="number"
                    name="salesPerPeriod"
                    value={this.state.salesPerPeriod}
                    placeholder="Enter number"
                    onChange={this.handleChange}
                  />
                  <InputGroup.Addon>%</InputGroup.Addon>
                </InputGroup>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={6}>
                Fiat Balance at Start (optional)
              </Col>
              <Col sm={6}>
                <FormControl
                  type="text"
                  name="fiatBalance"
                  value={this.state.fiatBalance}
                  placeholder="Enter number"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
          </form>
        </div>
        <div className="col-xs-12 mt40">
          <p>
            The following table shows you the development of an asset (e.g. a cryptocurrency) over 10 doublings.
            The first row shows the value of the asset a the start of the projection: 
            {this.assetBalanceForPeriod(0).format(2) } units of the asset for a price of {this.assetPriceForPeriod(0).format(2)} result in a asset worth of {startAssetWorth.format(2)}
            &nbsp; You can see the development of your portfolio by entering your asset balance and asset price into the input fields above.
          </p>
          <p>
            By entering a value between 0 and 100 into the "Sales Of Asset Per Doubling" field, you get additional information on asset sales per doubling, cumulative asset sales and portfolio worth.
            Using the optional "Fiat Balance at start" field, lets you see the development of your asset / fiat ratio (asset exposure).
          </p>
        </div>
        <div className="col-xs-12 mt40">
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>Period</th>
                <th>Asset Balance</th>
                <th>Price</th>
                <th>Asset Worth</th>
                {this.state.salesPerPeriod > 0 &&
                <th>Asset Sale</th>
                }
                {this.state.salesPerPeriod > 0 &&
                <th>Asset Sale Worth</th>
                }
                {this.state.salesPerPeriod > 0 &&
                <th>Asset Sold</th>
                }
                {this.state.fiatBalance > 0 &&
                <th>Fiat Balance</th>
                }
                {this.state.fiatBalance > 0 &&
                <th>Asset / Fiat Ratio</th>
                }
                {this.state.salesPerPeriod > 0 &&
                <th>Portfolio Worth</th>
                }
                <th>Portfolio Increase</th>
              </tr>
            </thead>
            <tbody>
              {lis}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
});

export default FormExample;
