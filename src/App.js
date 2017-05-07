import React from 'react';
import { FormGroup, ControlLabel, FormControl, InputGroup, Table } from 'react-bootstrap';

Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};

const FormExample = React.createClass({
  getInitialState() {
    return {
      assetBalance: 10,
      assetPrice: 100,
      fiatBalance: 1000,
      salesPerPeriod: 0,
      periods: 10,
    };
  },

  handleChange(e) {
    const target = e.target;
    const value = parseFloat(target.value);
    const name = target.name;
    this.setState({
      [name]: value
    });
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
          <td className="text-right">{this.assetPriceForPeriod(i)}</td>
          <td className="text-right">{this.assetBalanceForPeriod(i).format(5) }</td>
          <td className="text-right">{assetWorth.format(2)}</td>
          <td className="text-right">{this.assetSaleForPeriod(i).format(5)}</td>
          <td className="text-right">{assetSaleWorth.format(2)}</td>
          <td className="text-right">{this.assetSoldForPeriod(i).format(5)}</td>
          <td className="text-right">{fiatBalance.format(2)}</td>
          <td className="text-right">{(assetWorth / fiatBalance).format(5)}</td>
          <td className="text-right">{(fiatBalance + assetWorth).format(2)}</td>
          <td className="text-right">{(((fiatBalance + assetWorth) / (this.state.fiatBalance + startAssetWorth) * 100)).format(0)} %</td>
        </tr>
      );
    }
    return (
      <div>
        <div className="col-md-6 col-md-offset-3 col-xs-12">
          <form>
            <FormGroup
              controlId="formBasicText"
            >
              <ControlLabel>Asset Balance</ControlLabel>
              <FormControl
                type="text"
                name="assetBalance"
                value={this.state.assetBalance}
                placeholder="Enter number"
                onChange={this.handleChange}
              />
              <ControlLabel>Asset Price</ControlLabel>
              <FormControl
                type="text"
                name="assetPrice"
                value={this.state.assetPrice}
                placeholder="Enter number"
                onChange={this.handleChange}
              />
              <ControlLabel>Fiat Balance</ControlLabel>
              <FormControl
                type="text"
                name="fiatBalance"
                value={this.state.fiatBalance}
                placeholder="Enter number"
                onChange={this.handleChange}
              />
              <ControlLabel>Sales Of Asset Per Period</ControlLabel>
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
            </FormGroup>
          </form>
        </div>
        <div className="col-xs-12 mt40">
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>Period</th>
                <th>Price</th>
                <th>Asset Balance</th>
                <th>Asset Worth</th>
                <th>Asset Sale</th>
                <th>Asset Sale Worth</th>
                <th>Asset Sold</th>
                <th>Fiat Balance</th>
                <th>Asset / Fiat Ratio</th>
                <th>Portfolio Worth</th>
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
