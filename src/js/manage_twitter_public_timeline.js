"use strict";

import ReactDOM from 'react-dom';
import React from 'react';
import TweetTableContainer from './TweetTableContainer.js';

require('jquery');
require('easyui');

ReactDOM.render(
  <TweetTableContainer />,
  document.getElementById('tweet_table_container')
);
