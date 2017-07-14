import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, createStyleSheet } from 'material-ui/styles';
import Chip from 'material-ui/Chip';

const styleSheet = createStyleSheet('Skills', theme => ({
  chip: {
    margin: theme.spacing.unit / 2,
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: '20px'
  },
}));

class Skills extends Component {
    state = {
        chipData: [
          { key: 0, label: 'Node.js' },
          { key: 1, label: 'fullstack BEM' },
          { key: 2, label: 'React' },
          { key: 3, label: 'Gulp' },
          { key: 4, label: 'Webpack' },
          { key: 5, label: 'MongoDB' },
          { key: 6, label: 'Linux' },
          { key: 7, label: 'lodash' },
        ],
    };

    styles = {
        chip: {
          margin: 4,
        },
        wrapper: {
          display: 'flex',
          flexWrap: 'wrap',
        }
    };
    
    render() {
    const classes = this.props.classes;

    return (
      <div className={classes.row}>
        {this.state.chipData.map(data => {
          return (
            <Chip
              label={data.label}
              key={data.key}
              className={classes.chip}
            />
          );
        })}
      </div>
    );
  }
}

Skills.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(Skills);
