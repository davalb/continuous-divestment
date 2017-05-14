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
          <p>
            The following table shows you the development of an asset (e.g. a crypto-currency) over 10 doublings.
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