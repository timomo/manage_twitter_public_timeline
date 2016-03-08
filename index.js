class AquariumTableHeader extends OurRemoteTableHeader
{
  handleCheck(e)
  {
    this.props.handleAllCheck(e);
  }

  render()
  {
    var checked = this.props.isAllChecked();

    return (
      <thead key="head">
        <tr>
          <th>
            <form className="smart-form">
              <label className="checkbox">
                <input
                  type="checkbox"
                  key={checked}
                  checked={checked}
                  onChange={this.handleCheck.bind(this)}
                />
                <i> </i>&nbsp;
              </label>
            </form>
          </th>
          <th>timestamp_ms</th>
          <th>user.name</th>
          <th>text</th>
        </tr>
      </thead>
    );
  }
}

class AquariumTableBody extends OurRemoteTableBody
{
  handleCheck(id, e)
  {
    this.props.handleCheck(id, e);
  }

  render()
  {
    var tds = this.state.data.map(function(row) {
      var dt = new Date();
      dt.setTime(row.timestamp_ms);
      var timestamp_ms = dt.toLocaleDateString('ja')
        + ' ' + dt.toLocaleTimeString('ja');
      var checked = this.props.isChecked(row.id_str);

      return (
        <tr key={row.id_str}>
          <td>
            <form className="smart-form">
              <label className="checkbox">
                <input
                  type="checkbox"
                  key={checked}
                  checked={checked}
                  onChange={this.handleCheck.bind(this, row.id_str)}
                />
                <i> </i>&nbsp;
              </label>
            </form>
          </td>
          <td>{timestamp_ms}</td>
          <td>{row.data.user.name}</td>
          <td>{row.data.text}</td>
        </tr>
      );
    }.bind(this));

    return (
      <tbody key="body">
        {tds}
      </tbody>
    );
  }
}

class AquariumTable extends OurRemoteTable
{
  constructor(props)
  {
    super(props);
    this.state.checked = {};
  }

  loadFromServerWithState(state)
  {
    this.setState({checked: {}});
    return super(state);
  }

  isChecked(id)
  {
    if (id in this.state.checked) {
      if (this.state.checked[id] !== 0) {
        return true;
      }
    }
    return false;
  }

  isAllChecked()
  {
    var hit = 0;
    this.state.data.forEach(function(row) {
      var checked = this.isChecked(row.id_str);
      if (checked === true) {
        hit += 1;
      }
    }.bind(this));
    if (this.state.data.length === hit) {
      return true;
    }
    return false;
  }

  handleCheck(id, e)
  {
    var checked = this.state.checked;
    if (id in checked) {
      // noop
    } else {
      checked[id] = 0;
    }
    if (e.target.checked === true) {
      checked[id] = 1;
    } else {
      checked[id] = 0;
    }
    this.setState({checked: checked});
    e.preventDefault();
  }

  handleAllCheck(e)
  {
    this.state.data.forEach(function(row) {
      this.handleCheck(row.id_str, e);
    }.bind(this));
    e.preventDefault();
  }

  render()
  {
    var display_server_error = this.state.server_error ? "block" : "none";
    var display_create = this.canAdd() ? "show" : "none";
    var className = this.getName();
    var classNameOfHeader = className + 'Header';
    var header = this.returnHeader({
      key: 'header',
      handleAllCheck: this.handleAllCheck.bind(this),
      isAllChecked: this.isAllChecked.bind(this),
    });
    var body = this.returnBody({
      key: 'body',
      isChecked: this.isChecked.bind(this),
      handleCheck: this.handleCheck.bind(this),
    });
    var pageFooter = this.returnPageFooter({key: 'page_footer'});
    var pageHeader = this.returnPageHeader({key: 'page_header'});

    return (
      <div id={this.props.tableid + '-container'} role="content">
        <div className="jarviswidget-editbox">
        </div>
        <div id="server_error" className="alert alert-danger" style={{display: display_server_error}}>
          {this.state.server_error}
        </div>
        <div className="widget-body-no no-padding">
          {pageHeader}
          <table key="table" id={this.props.tableid} className="table table-striped table-bordered table-hover" width="100%">
            <button
              type="button"
              className="btn btn-default"
              onClick={this.handleClick.bind(this)}
            >
              <i className="fa fa-repeat"></i> {trans('messages.button.reload')}
            </button>
            <span> </span>
            <button
              type="button"
              className="btn btn-default"
              style={{display: display_create}}
              onClick={this.handleCreate.bind(this)}
            >
              <i className="fa fa-plus"></i> {trans('messages.button.create')}
            </button>
            {header}
            {body}
          </table>
          {pageFooter}
        </div>
      </div>
    );
  }
}

AquariumTable.defaultProps = {
  url_api: '/admin/manage_twitter_public_timeline_json.php',
  interval: 1000,
  tableid: 'aquarium-table',
  entries_per_pages: [50, 100, 200],
  messages_prefix: 'test',
  serverSide: true,
};

React.render(
  <AquariumTable />,
  document.getElementById('aquarium')
);
