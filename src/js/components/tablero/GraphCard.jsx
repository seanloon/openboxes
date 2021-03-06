/* eslint-disable no-underscore-dangle */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Bar, Doughnut, HorizontalBar, Line } from 'react-chartjs-2';
import { SortableElement } from 'react-sortable-hoc';
import DragHandle from './DragHandle';
import LoadingCard from './LoadingCard';
import Numbers from './Numbers';
import NumbersTableCard from './NumbersTableCard';
import TableCard from './TableCard';
import NumbersRAG from './NumbersRAG';


class FilterComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timeFrame: 6,
      locationSelected: '',
    };
  }

  handleChange = (element, cardId, loadIndicator) => {
    const dropdown = element.target;
    let params = '';

    const timeFrame = this.state.timeFrame || null;
    const location = this.state.locationSelected || null;
    if (dropdown.id === 'locationSelector') {
      params = timeFrame !== null ? `querySize=${timeFrame}&` : params;
      params = `${params}destinationLocation=${dropdown.value}`;
      const locationSelected = this.props.allLocations.find(value => value.id === dropdown.value);
      this.setState({ locationSelected });
    }
    if (element.target.id === 'timeFrameSelector') {
      params = `querySize=${dropdown.value}`;
      params = location !== null ? `${params}&destinationLocation=${location.id}` : params;
      this.setState({ timeFrame: dropdown.value });
    }

    if (params !== '') {
      loadIndicator(cardId, params);
    }

    dropdown.size = 1;
  };

  render() {
    return (
      <div className="data-filter">
        { this.props.locationFilter === true ?
          <select
            className="location-filter custom-select"
            size="1"
            onFocus={(e) => { e.target.size = 3; }}
            onBlur={(e) => { e.target.size = 1; }}
            onChange={e => this.handleChange(e, this.props.cardId, this.props.loadIndicator)}
            disabled={!this.props.locationFilter}
            value={this.state.locationSelected.id}
            id="locationSelector"
          >
            { this.props.allLocations.map(value =>
              <option key={value.id} value={value.id}> {value.name}</option>)}
          </select>
 : null }
        { this.props.timeFilter === true ?
          <select
            className="time-filter custom-select"
            onChange={e => this.handleChange(e, this.props.cardId, this.props.loadIndicator)}
            disabled={!this.props.timeFilter}
            defaultValue={this.state.timeFrame}
            id="timeFrameSelector"
          >
            <option value="1">{this.props.label} Month</option>
            <option value="3">{this.props.label} 3 Months</option>
            <option value="6">{this.props.label} 6 Months</option>
            <option value="12">{this.props.label} Year</option>
            { this.props.timeLimit === 24 ? <option value="24">{this.props.label} 2 Years</option> : null }
          </select> : null
        }

      </div>
    );
  }
}

const handleChartClick = (elements) => {
  const link = elements[0]._chart.data.datasets[0].links[elements[0]._index];

  if (link && link !== '') {
    window.location = link;
  }
};

const GraphCard = SortableElement(({
  cardId,
  cardTitle,
  cardType,
  cardLink,
  data,
  options,
  loadIndicator,
  timeFilter = false,
  timeLimit = 24,
  locationFilter = false,
  allLocations,
  size = null,
}) => {
  let graph;
  let label = 'Last';
  if (cardType === 'line') {
    graph = (
      <Line
        data={data}
        options={options}
        onElementsClick={elements => handleChartClick(elements)}
      />
    );
    label = 'Next';
  } else if (cardType === 'bar') {
    graph = <Bar data={data} options={options} />;
  } else if (cardType === 'doughnut') {
    graph = <Doughnut data={data} options={options} />;
  } else if (cardType === 'horizontalBar') {
    graph = (<HorizontalBar
      data={data}
      options={options}
      onElementsClick={elements => handleChartClick(elements)}
    />);
  } else if (cardType === 'numbers') {
    graph = <Numbers data={data} options={options} />;
  } else if (cardType === 'numbersCustomColors') {
    graph = <NumbersRAG data={data} />;
  } else if (cardType === 'table') {
    graph = <TableCard data={data} />;
  } else if (cardType === 'numberTable') {
    graph = <NumbersTableCard data={data} options={options} />;
  } else if (cardType === 'loading') {
    graph = <LoadingCard />;
  } else if (cardType === 'error') {
    graph = <button onClick={() => loadIndicator(cardId)} ><i className="fa fa-repeat" /></button>;
  }

  return (
    <div className={`graph-card ${size === 'big' ? 'big-size' : ''} ${cardType === 'error' ? 'error-card' : ''}`}>
      <div className="header-card">
        {cardLink ?
          <a target="_blank" rel="noopener noreferrer" href={cardLink} className="title-link">
            <span className="title-link"> {cardTitle} </span>
          </a>
          :
          <span className="title-link"> {cardTitle} </span>
        }
        <DragHandle />
      </div>
      <div className="content-card">

        <FilterComponent
          cardId={cardId}
          loadIndicator={loadIndicator}
          locationFilter={locationFilter}
          timeLimit={timeLimit}
          timeFilter={timeFilter}
          label={label}
          data={data.length === 0 ? null : data}
          allLocations={allLocations}
        />
        <div className="graph-container">
          {graph}
        </div>
      </div>
    </div>
  );
});

export default GraphCard;
GraphCard.propTypes = {
  cardTitle: PropTypes.string,
  cardType: PropTypes.string.isRequired,
  timeLimit: PropTypes.number,
  loadIndicator: PropTypes.func.isRequired,
};

FilterComponent.defaultProps = {
  timeFilter: false,
  locationFilter: false,
};

FilterComponent.propTypes = {
  locationFilter: PropTypes.bool,
  timeFilter: PropTypes.bool,
  timeLimit: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  cardId: PropTypes.number.isRequired,
  loadIndicator: PropTypes.func.isRequired,
  allLocations: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};
