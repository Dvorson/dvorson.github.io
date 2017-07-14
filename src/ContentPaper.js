import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles, createStyleSheet } from 'material-ui/styles';
import Skills from './Skills';
import Experience from './Experience';
import PropTypes from 'prop-types';

const styleSheet = createStyleSheet('ContentPaper', theme => ({
    paper: {
        padding: '20px',
        pageBreakBefore: 'always'
    }
}));

class ContentPaper extends Component {
    render() {
        const classes = this.props.classes;
        return (
            <Paper className={classes.paper}>
                <Typography type="headline">Skills</Typography>
                <hr />
                <Skills />
                <Typography type="headline">Experience</Typography>
                <hr />
                <Experience />
            </Paper>
        );
    }
}

ContentPaper.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(ContentPaper);
