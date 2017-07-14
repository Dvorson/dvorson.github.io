import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AvatarCard from './AvatarCard';
import ContentPaper from './ContentPaper';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Grid from 'material-ui/Grid';
injectTapEventPlugin();

const App = () => (
      <MuiThemeProvider>
        <Grid container gutter={8}>
            <Grid item xs={12} sm={4} md={4} lg={3}>
                <AvatarCard />
            </Grid>
            <Grid item xs={12} sm={8} md={8} lg={9}>
                <ContentPaper />
            </Grid>
        </Grid>
      </MuiThemeProvider>
    );

ReactDOM.render(
  <App />,
  document.getElementById('app')
);