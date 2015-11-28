import React from 'react';

export default class TweetTableBody extends React.Component
{
  render()
  {
    var rows = this.props.data.map(function(row) {
      var user_screen_name = row.data.user.screen_name;
      var user_description = row.data.user.description;
      var data = JSON.stringify(row.data);
      return (
        <tr
          key={row.id_str}
          className="datagrid-row"
          style={{height: "25px"}}
        >
          <td>
            <label className="checkbox">
              <input type="checkbox" name="row_id[]" value={row.id_str} />
              <i> </i>
            </label>
          </td>
          <td>
            {row.timestamp_ms}
          </td>
          <td>
            {user_screen_name}
          </td>
          <td>
            {user_description}
          </td>
          <td>
            {row.data_short}
          </td>
        </tr>
      );
    }.bind(this));

    return (
      <tbody>
        {rows}
      </tbody>
    );
  }
}
