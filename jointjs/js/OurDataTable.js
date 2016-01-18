class OurDataTableHeader extends AbstractBase
{
    render() {
        return false;
    }
}


class OurDataTableBody extends AbstractBase
{
    constructor(props) {
        this.state = {
            data: props.data,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({data: nextProps.data});
    }

    paddingZero( num ) {
        return ( num < 10 ) ? '0'+num : num;
    }

    getDateTimeString( dt ) {
        dt = dt.replace(/-/g, "/");
        var dtcls = new Date( dt );
        var year = dtcls.getFullYear();
        var month = dtcls.getMonth() + 1;
        month = this.paddingZero(month);
        var day = dtcls.getDate();
        day = this.paddingZero(day);
        var hour = dtcls.getHours() + 9; // timezone
        hour  = this.paddingZero(hour);
        var min = dtcls.getMinutes();
        min = this.paddingZero(min);
        var sec = dtcls.getSeconds();
        sec = this.paddingZero(sec);

        return year+'/'+month+'/'+day+' '+hour+':'+min+':'+sec;
    }

    handleEdit(id, e) {
      var newurl = location.pathname+"/"+id+"/edit";
      console.info(newurl);
      location.href = newurl;
    }

    render() {
        return false;
    }
}

class OurDataTable extends AbstractBase
{
  constructor(props)
  {
    super(props);
    this.state = {
      data: [],
      url_api: props.url_api,
      interval: props.interval,
      disabled_button: false,
      tableid: props.tableid
    };
  }

  loadFromServer()
  {
    $.ajax({
      url: this.state.url_api,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        if (422 === xhr.status) {
          var responseJson = JSON.parse(xhr.responseText);
          this.setState({server_error: trans('messages.error.422')});
        } else if (403 === xhr.status) {
          this.setState({server_error: trans('messages.error.403')});
        } else {
          this.setState({server_error: trans('messages.error.500')});
        }
        console.error(this.state.url_api, status, err.toString());
      }.bind(this),
    });
  }

  componentWillMount() {
    this.loadFromServer();
  }

  componentDidUpdate()
  {
    var prefix = "messages.datatables.";
    var table = $('#'+this.state.tableid).dataTable({
      "language": {
        "emptyTable": trans(prefix+'emptyTable'),
        "info": trans(prefix+'info'),
        "infoEmpty": trans(prefix+'infoEmpty'),
        "infoFiltered": trans(prefix+'infoFiltered'),
        "lengthMenu": trans(prefix+'lengthMenu'),
        "loadingRecords": trans(prefix+'loadingRecords'),
        "processing": trans(prefix+'processing'),
        "search": trans(prefix+'search'),
        "zeroRecords": trans(prefix+'zeroRecords'),
        "paginate": {
          "first": trans(prefix+'paginate.first'),
          "previous": trans(prefix+'paginate.previous'),
          "next": trans(prefix+'paginate.next'),
          "last": trans(prefix+'paginate.last')
        }
      }
    });
  }

  destroyTable()
  {
    var table = $('#'+this.state.tableid).dataTable();
    table.fnDestroy();
  }

  handleClick(e)
  {
    this.destroyTable();
    e.preventDefault();
    this.loadFromServer();
  }

  handleCreate(e)
  {
    var newurl = location.protocol+'//'+location.hostname+location.pathname+"/create";
    console.info(newurl);
    location.href = newurl;
  }

  render()
  {
    var display_server_error = this.state.server_error ? "block" : "none";
    var display_create = this.canCreate() ? "show" : "none";
    var className = this.getName();
    var classNameOfHeader = className + 'Header';
    var classNameOfBody = className + 'Body';

    var classOfHeader = eval(classNameOfHeader);
    var classOfBody = eval(classNameOfBody);
    var header = React.createElement(classOfHeader, {key: 'header'});
    var body   = React.createElement(classOfBody, {data: this.state.data, key: 'body'});

    return (
      <div id={this.props.tableid + '-container'} role="content">
        <div className="jarviswidget-editbox">
        </div>
        <div id="server_error" className="alert alert-danger" style={{display: display_server_error}}>
          {this.state.server_error}
        </div>
        <div className="widget-body no-padding">
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
        </div>
      </div>
    );
  }
}

OurDataTable.propTypes = {
  url_api: React.PropTypes.string.isRequired,
  interval: React.PropTypes.number.isRequired,
  data: React.PropTypes.array,
  tableid: React.PropTypes.string.isRequired
};
