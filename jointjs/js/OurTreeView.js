class OurDataTreeNode extends AbstractBase
{
  constructor(props)
  {
    super(props);
    this.state = {
      data: props.data,
      depth: props.depth,
      expanded: props.expanded,
    };
  }

  toggleExpanded(id, event)
  {
    this.setState({ expanded: !this.state.expanded });
    event.stopPropagation();
  }

  handleEdit(id, e)
  {
    var newurl = location.protocol+'//'+location.hostname+location.pathname+"/"+id+"/edit";
    console.info(newurl);
    location.href = newurl;
  }
}

class OurDataTreeBody extends AbstractBase
{
  constructor(props)
  {
    super(props);
    this.state = {
      data: this.props.data,
      depth: this.props.depth,
      expanded: props.expanded,
    };
  }

  componentWillReceiveProps(nextProps)
  {
    this.setState({data: nextProps.data});
    this.setState({depth: nextProps.depth});
  }

  render()
  {
    var className = this.getName();
    var classNameOfNode = className;
    classNameOfNode = classNameOfNode.replace('Body', 'Node');
    var classOfNode = eval(classNameOfNode);
    var rows = [];

    if (Object.keys(this.state.data).length > 0) {
      var data1 = this.state.data;
      var depth1 = this.state.depth;
      Object.keys(this.state.data).forEach(function (key) {
        var node = data1[key];
        var visible = this.props.visible;
        var param = {data: node, key: node[this.props.key_id], depth: depth1, visible: visible};
        param.handleStatusConfirm = this.props.handleStatusConfirm;
        param.disabled_button = this.props.disabled_button;
        param.key_id = this.props.key_id;
        param.expanded = this.props.expanded;
        var node = React.createElement(classOfNode, param);
        rows.push({node});
      }.bind(this));
    }
    return (
      <ul key="body">{rows}</ul>
    )
  }
}

class OurDataTree extends AbstractBase
{
  constructor(props)
  {
    super(props);
    this.state = {
      data: {},
      url_api: props.url_api,
      interval: props.interval,
      disabled_button: false,
      tableid: props.tableid,
      expanded: props.expanded,
    };
  }

  loadFromServer()
  {
    $.ajax({
      url: this.state.url_api + '/tree',
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

  componentWillMount()
  {
    this.loadFromServer();
  }

  destroyTree()
  {
    //
  }

  handleStatusConfirm(id)
  {
    var param = {};
    param[this.props.key_id] = id;
    this.setState(param);
    jQuery('#' + this.props.tableid + '-modal').modal('show');
  }

  getMyId()
  {
    return this.state[this.props.key_id];
  }

  handleStatusSubmit(e)
  {
    var param = {};
    var token = this.returnCookieXSRFToken();
    var columnStatus = this.props.key_status === undefined ? 'status' : this.props.key_status;
    var updateRow;

    Object.keys(this.state.data).forEach(function(num) {
      var row = this.state.data[num];
      if (row[this.props.key_id] !== this.state[this.props.key_id]) {
        return false;
      }
      updateRow = row;
    }.bind(this));

    param[columnStatus] = updateRow[columnStatus] === 1 ? 0 : 1;

    this.setState({disabled_button: true});

    var url = this.state.url_api + "/" + this.getMyId();

    $.ajax({
      url: url,
      headers: {'X-XSRF-TOKEN': token},
      dataType: 'json',
      type: 'PUT',
      data: param,
      success: function(data) {
        // location.href = url_redirect;
        // 成功したら、値を変える
        updateRow[columnStatus] = parseInt(data[columnStatus]);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        var invalids = {};
        this.setState({invalids: invalids});
        if (422 === xhr.status) {
          var responseJson = JSON.parse(xhr.responseText);
          $.each(responseJson, function(id, value) {
            var divid = "div_" + id;
            var emid = "em_" + id;
            $('#' + divid).addClass("state-error");
            $('#' + emid).html(value.join(", "));
            invalids[id] = (invalids[id] ? invalids[id] : '') + value.join(", ");
          });
          this.setState({invalids: invalids});
        } else if (403 === xhr.status) {
          this.setState({server_error: trans('messages.error.403')});
        } else {
          this.setState({server_error: trans('messages.error.500')});
        }
      }.bind(this),
      complete: function(xhr, status) {
        jQuery('#' + this.props.tableid + '-modal').modal('hide');
        this.setState({disabled_button: false});
      }.bind(this)
    });
  }

  handleClick(e)
  {
    this.destroyTree();
    e.preventDefault();
    this.loadFromServer();
  }

  handleCreate(e)
  {
    var newurl = location.protocol+'//'+location.hostname+location.pathname+"/create";
    location.href = newurl;
  }

  renderModal()
  {
    return (
      <div className="modal fade" id={this.props.tableid + "-modal"} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
              &times;
              </button>
              <h4 className="modal-title">
                {trans('messages.core-group.title-confirm-popup')}
              </h4>
            </div>
            <div className="modal-body no-padding">
              <form id={this.props.tableid + "-check-form"} className="smart-form">
                <footer>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleStatusSubmit.bind(this)}
                    disabled={this.state.disabled_button}
                  >
                    {trans('messages.button.update')}
                  </button>
                  <button type="button" className="btn btn-default" data-dismiss="modal">
                    {trans('messages.button.cancel')}
                  </button>
                </footer>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render()
  {
    var display_server_error = this.state.server_error ? "block" : "none";
    var display_create = this.canCreate() ? "show" : "none";
    var className = this.getName();
    var classNameOfBody = className + 'Body';

    var classOfBody = eval(classNameOfBody);
    var depth = 1;
    var param = {
                  data: this.state.data,
                  key: 'body',
                  depth: depth,
                  visible: true,
                  key_id: this.props.key_id,
                  expanded: this.props.expanded,
                  handleStatusConfirm: this.handleStatusConfirm.bind(this),
                  disabled_button: this.state.disabled_button,
                };
    var body  = React.createElement(classOfBody, param);

    return (
      <div id={this.props.tableid + '-container'} role="content">
        <div className="jarviswidget-editbox">
        </div>
        <div id="server_error" className="alert alert-danger" style={{display: display_server_error}}>
          {this.state.server_error}
        </div>
        <div className="widget-body no-padding">
          <div className="tree">
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
            {body}
          </div>
        </div>
        {this.renderModal()}
      </div>
    );
  }
}

OurDataTree.propTypes = {
  key_id: React.PropTypes.string.isRequired,
  tableid: React.PropTypes.string.isRequired,
  url_api: React.PropTypes.string.isRequired,
  interval: React.PropTypes.number,
  data: React.PropTypes.array
};
