import React from 'react';

export default class TweetTableHeader extends React.Component
{
  render()
  {
    return (
      <thead>
        <tr>
          <th>
            <label className="checkbox">
              <input type="checkbox" name="all_row_id" />
              <i> </i>&nbsp;
            </label>
          </th>
          <th>timestamp_ms</th>
          <th>user.screen_name</th>
          <th>user.description</th>
          <th>data</th>
        </tr>
      </thead>
    );
  }
}
