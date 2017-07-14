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
        <div style={{display: 'flex'}}>
        <AvatarCard />
        <ContentPaper />
        </div>
      </MuiThemeProvider>
    );

ReactDOM.render(
  <App />,
  document.getElementById('app')
);