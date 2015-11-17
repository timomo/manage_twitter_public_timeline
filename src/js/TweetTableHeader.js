import React from 'react';

export default class TweetTableHeader extends React.Component
{
  render()
  {
    return (
      <thead frozen="true">
        <tr>
          <th data-options="field:'check'">
            <input type="checkbox" name="all_row_id" />
          </th>
          <th data-options="field:'timestamp_ms'">timestamp_ms</th>
          <th data-options="field:'user.screen_name'">user.screen_name</th>
          <th data-options="field:'user.description'">user.description</th>
          <th data-options="field:'data'">data</th>
        </tr>
      </thead>
    );
  }
}
