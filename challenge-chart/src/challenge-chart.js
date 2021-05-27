import { LitElement, html, css } from 'lit';
import { ChallengeDataService } from '../../ChallengeDataService.js';

import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
} from 'chart.js';

class ChallengeChart extends LitElement {
  static get styles() {
    return css``;
  }

  static get properties() {
    return { 
      data: Array,
      sampleSize: String
    };
  }

  constructor() {
    super();
    Chart.register(LinearScale);
    Chart.register(CategoryScale);
    Chart.register(LineController);
    Chart.register(PointElement);
    Chart.register(LineElement);
  }

  firstUpdated() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      type: 'line',
      data: [],
      options: {
        scales: {
          x: { display: true, type: 'linear', position: 'bottom', axis: 'x', min: 0, max: 1 },
          y: { display: true, type: 'linear', position: 'left', axis: 'y', min: 0, max: 1 },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        Filler: false,
      },
    };
    this.chart = new Chart(this.shadowRoot.querySelector('#chart'), this.chartOptions);
    this.sampleSize = 'small';
  }

  updated(changedProperties) {
    if (changedProperties.has('data')) this._updateData();
  }

  async _updateData() {
    const datasets = [
      {
        type: 'line',
        backgroundColor: 'white',
        borderColor: 'red',
        data: this.data,
        showLine: true,
        yAxisID: 'y',
      },
    ];
    const xPoints = this.data.map(point => point.x);
    const yPoints = this.data.map(point => point.y);
    const minX = Math.min(...xPoints);
    const maxX = Math.max(...xPoints);
    const minY = Math.min(...yPoints);
    const maxY = Math.max(...yPoints);

    this.chart.data = { datasets };
    this.chart.options.scales.x.min = minX;
    this.chart.options.scales.x.max = maxX;
    this.chart.options.scales.y.min = minY;
    this.chart.options.scales.y.max = maxY;
    this.chart.update();
  }

  async _onSubmit(e) {
    e.preventDefault();
    const dataService = new ChallengeDataService();
    const challengeDataSet = await dataService.getDataSet(this.sampleSize)
    const xColumn = challengeDataSet.xColumn.values;
    const yColumn = challengeDataSet.yColumn.values;
    const data = xColumn.map((xValue, i) => {
      return {
        x: xValue,
        y: yColumn[i]
      }
    })
    this.data = data;
    this._updateData();

  }

  _onChange(e) {
    const { value } = e.target;
    this.sampleSize = value;
  }

  render() {
    return html`
      <canvas id="chart"></canvas>
      <form @submit=${this._onSubmit}>
        <label>
          Select sample size:
          <select @change=${this._onChange}>
            <option>small</option>
            <option>medium</option>
            <option>large</option>
          </select>
        </label>
        <button>load data</button>
      </form>
      `;
  }
}
customElements.define('challenge-chart', ChallengeChart);
