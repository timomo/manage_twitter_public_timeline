class AquariumTableHeader extends OurRemoteTableHeader
{
  render()
  {
    return (
      <thead key="head">
        <tr>
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
  render()
  {
    var tds = this.state.data.map(function(row) {
      var dt = new Date();
      dt.setTime(row.timestamp_ms);
      var timestamp_ms = dt.toLocaleDateString('ja')
        + ' ' + dt.toLocaleTimeString('ja');
      return (
        <tr key={row.id_str}>
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
  render()
  {
    var display_server_error = this.state.server_error ? "block" : "none";
    var display_create = this.canAdd() ? "show" : "none";
    var className = this.getName();
    var classNameOfHeader = className + 'Header';
    var header = this.returnHeader({key: 'header'});
    var body = this.returnBody({key: 'body'});
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
