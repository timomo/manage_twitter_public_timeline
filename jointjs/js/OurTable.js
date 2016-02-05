class OurTableHeader extends AbstractBase
{
  render()
  {
    return false;
  }
}

class OurTableBody extends AbstractBase
{
  constructor(props)
  {
    super(props);
    this.state = {
      data: props.data,
    };
  }

  componentWillReceiveProps(nextProps)
  {
    this.setState({data: nextProps.data});
  }

  paddingZero(num)
  {
    return ( num < 10 ) ? '0'+num : num;
  }

  getDateTimeString(dt)
  {
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

  handleEdit(id, e)
  {
    var newurl = location.pathname+"/"+id+"/edit";
    console.info(newurl);
    location.href = newurl;
  }

  render()
  {
    return false;
  }
}

class OurTablePageHeader extends Form
{
  constructor(props)
  {
    super(props);
    var params = this.getParameters();
    var datas = {
    };
    var invalids = {};

    this.state = {
      data: props.data,
      datas: datas,
      url_api: props.url_api,
      url_redirect: props.url_redirect,
      server_error: null,
      invalids: invalids,
      disabled_button: false,
    };
  }

  returnValidationRules()
  {
    var rules = {
      search: {
      },
      entries_per_page: {
      },
    };
    return rules;
  }

  returnDatasObject()
  {
    var datasObj = super();
    datasObj.search.value = this.props.search;
    datasObj.search.cols = [2, 4];
    datasObj.entries_per_page.value = this.props.entries_per_page;
    datasObj.entries_per_page.cols = [2, 4];
    return datasObj;
  }

  render()
  {
    var datasObj = this.returnDatasObject();
    var entries_per_pages = {};
    this.props.entries_per_pages.forEach(function(number) {
      entries_per_pages[number] = number;
    }.bind(this));
    var display_create = this.canAdd() ? "show" : "none";
    var buttons = [];

    if (this.props.button === true) {
      if (this.canEdit() === true) {
        buttons.push(
          <button
            type="button"
            className="btn btn-default"
            onClick={this.props.handleClick.bind(this)}
          >
            <i className="fa fa-repeat"></i> {trans('messages.button.reload')}
          </button>
        );
      }

      if (this.canEdit() === true) {
        buttons.push(
          <button
            type="button"
            className="btn btn-default"
            style={{display: display_create}}
            onClick={this.props.handleCreate.bind(this)}
          >
            <i className="fa fa-plus"></i> {trans('messages.button.create')}
          </button>
        );
      }
    }

    return (
      <div className="dt-toolbar" style={{'borderBottom': '0px!important'}}>
        <div className="col-xs-12 col-sm-4">
          {buttons}
        </div>
        <div className="col-xs-12 col-sm-8">
          <form id={this.props.formid} className="smart-form no-padding">
            <fieldset className="no-padding">
              {this.renderInput(datasObj.search, '', {section: false})}
              {this.renderInput(datasObj.entries_per_page, entries_per_pages, '', {section: false})}
            </fieldset>
          </form>
        </div>
      </div>
    );
  }

  changeSelect(e)
  {
    this.props.handleChangeEntriesPerPage(e);
  }

  changeText(e)
  {
    this.props.handleChangeSearchText(e);
  }
}

class OurTablePageFooter extends Form
{
  constructor(props)
  {
    super(props);
    var params = this.getParameters();
    var datas = {
    };
    var invalids = {};

    this.state = {
      datas: datas,
      url_api: props.url_api,
      url_redirect: props.url_redirect,
      server_error: null,
      invalids: invalids,
      disabled_button: false,
    };
  }

  returnValidationRules()
  {
    var rules = {
    };
    return rules;
  }

  returnPageRange()
  {
    var range = [];
    var first = this.props.first;
    var last = this.props.last;
    var first_page = this.props.first_page;
    var last_page = this.props.last_page;
    var current_page = this.props.current_page;

    if (current_page <= 4) {
      range = this.range(1, 6, 1);
    } else if (current_page > last_page - 4) {
      range = this.range(last_page - 4, last_page + 1, 1);
    } else {
      range = this.range(current_page - 1, current_page + 2, 1);
    }

    return range;
  }

  returnPages()
  {
    var disable_previous_page = this.props.previous_page !== null ? '' : 'disabled';
    var disable_next_page = this.props.next_page !== null ? '' : 'disabled';
    var pages = [];
    var first = this.props.first;
    var last = this.props.last;
    var first_page = this.props.first_page;
    var last_page = this.props.last_page;
    var current_page = this.props.current_page;
    var range = this.returnPageRange();

    if (jQuery.inArray(first_page, range) === -1) {
      pages.push(
        <li
          key={first_page}
          onClick={this.props.handleChange.bind(this, first_page)}
          className={"paginate_button " + active_button}
          aria-controls={this.props.tableid + "-table"}
          tabIndex="0"
        >
          <a href="#">{first_page}</a>
        </li>
      );
      pages.push(
        <li
          key={'after_start'}
          className="paginate_button disabled"
          aria-controls={this.props.tableid + "-table"}
          tabIndex="0"
          id={"-table_ellipsis"}
        >
          <a href="#">…</a>
        </li>
      );
    }

    for (var x = 1; x <= range.length; x++) {
      var i = range[x - 1];
      if (i < 1) {
        continue;
      }
      if (last_page < i) {
        continue;
      }
      var active_button = current_page === i ? 'active' : '';
      pages.push(
        <li
          key={i}
          onClick={this.props.handleChange.bind(this, i)}
          className={"paginate_button " + active_button}
          aria-controls={this.props.tableid + "-table"}
          tabIndex="0"
        >
          <a href="#">{i}</a>
        </li>
      );
    }

    if (jQuery.inArray(last_page, range) === -1) {
      pages.push(
        <li
          key={'before_last'}
          className="paginate_button disabled"
          aria-controls={this.props.tableid + "-table"}
          tabIndex="0"
          id={"-table_ellipsis"}
        >
          <a href="#">…</a>
        </li>
      );
      pages.push(
        <li
          key={last_page}
          onClick={this.props.handleChange.bind(this, last_page)}
          className={"paginate_button " + active_button}
          aria-controls={this.props.tableid + "-table"}
          tabIndex="0"
        >
          <a href="#">{last_page}</a>
        </li>
      );
    }

    return pages;
  }

  returnPreviousPage()
  {
    var disable_previous_page = this.props.previous_page !== null ? '' : 'disabled';
    return (
      <li
        className={"paginate_button previous " + disable_previous_page}
        onClick={this.props.handleChange.bind(this, this.props.previous_page)}
        aria-controls={this.props.tableid + "-table"}
        tabIndex="0"
        id={this.props.formid + "-table_previous"}
      >
        <a href="#">前へ</a>
      </li>
    );
  }

  returnNextPage()
  {
    var disable_next_page = this.props.next_page !== null ? '' : 'disabled';
    return (
      <li
        className={"paginate_button next " + disable_next_page}
        onClick={this.props.handleChange.bind(this, this.props.next_page)}
        aria-controls={this.props.tableid + "-table"}
        tabIndex="0"
        id={this.props.tableid + "-table_next"}
      >
        <a href="#">次へ</a>
      </li>
    );
  }

  render()
  {
    var pages = this.returnPages();
    var previousPage = this.returnPreviousPage();
    var nextPage = this.returnNextPage();

    return (
      <div className="dt-toolbar-footer" style={{'borderTop': '0px!important'}}>
        <div className="col-xs-12 col-sm-6">
          <div className="dataTables_info" id={this.props.tableid + "-table_info"} role="status" aria-live="polite">
            {this.props.total_entries} 件中 {this.props.first} 件から {this.props.last} 件までを表示
          </div>
        </div>
        <div className="col-xs-12 col-sm-6">
          <div className="dataTables_paginate paging_simple_numbers" id={this.props.tableid + "-table_paginate"}>
            <ul className="pagination pagination-sm">
              {previousPage}
              {pages}
              {nextPage}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

class OurTable extends AbstractBase
{
  constructor(props)
  {
    super(props);
    var entries_per_pages = props.entries_per_pages;
    if (entries_per_pages === undefined) {
      entries_per_pages = [5, 10, 25, 50, 100];
    }
    this.state = {
      rawData: [],
      data: [],
      url_api: props.url_api,
      interval: props.interval,
      disabled_button: false,
      tableid: props.tableid,
      total_entries: 0,
      entries_per_pages: entries_per_pages,
      entries_per_page: entries_per_pages[0],
      search_text: '',
      current_page: 1,
      first_page: 1,
      last_page: 1,
      first: 1,
      last: 1,
      previous_page: null,
      next_page: null,
    };
  }

  componentWillUpdate(nextProps, nextState)
  {
    var isPageUpdate = false;
    if (this.state.search_text !== nextState.search_text) {
      this.searchItem(nextState);
    }
    if (this.state.current_page !== nextState.current_page) {
      isPageUpdate = true;
    }
    if (this.state.total_entries !== nextState.total_entries) {
      isPageUpdate = true;
    }
    if (this.state.entries_per_page !== nextState.entries_per_page) {
      isPageUpdate = true;
    }
    if (isPageUpdate === true) {
      this.calculatePage(nextState);
    }
  }

  searchItem(nextState)
  {
    var data = [];
    var regex = new RegExp(nextState.search_text);
    nextState.rawData.forEach(function(raw) {
      var text = JSON.stringify(raw);
      if (regex.test(text) === true) {
        data.push(raw);
      }
    }.bind(this));
    this.setState({data: data});
  }

  calculatePage(nextState)
  {
    var first;
    var last;
    var first_page = 1;
    var last_page;
    var previous_page = null;
    var next_page = null;
    var data = [];
    var total_entries = nextState.total_entries;
    var entries_per_page = nextState.entries_per_page;
    var current_page = nextState.current_page;

    // last_page
    var pages = total_entries / entries_per_page;
    if (pages === Math.floor(pages)) {
      last_page = pages;
    } else {
      last_page = 1 + Math.floor(pages);
    }
    if (last_page < 1) {
      last_page = 1;
    }
    // first
    if (total_entries === 0) {
      first = 0;
    } else {
      first = ((current_page - 1) * entries_per_page) + 1;
    }
    // last
    if (current_page === last_page) {
      last = total_entries;
    } else {
      last = current_page * entries_per_page;
    }
    // previous_page
    if (current_page > 1) {
      previous_page = current_page - 1;
    }
    // next_page
    next_page = current_page < last_page ? current_page + 1 : null;

    for (var i = first - 1; i <= last - 1; i++) {
      data.push(this.state.rawData[i]);
    }

    this.setState({
      first: first,
      last: last,
      first_page: first_page,
      last_page: last_page,
      data: data,
      previous_page: previous_page,
      next_page: next_page,
    });
  }

  handleChangeSearchText(e)
  {
    this.setState({search_text: e.target.value});
  }

  handleChangeEntriesPerPage(e)
  {
    this.setState({entries_per_page: e.target.value});
  }

  handleChange(page, e)
  {
    e.preventDefault();
    if (Boolean(page) === false) {
      return null;
    }
    this.setState({current_page: page});
  }

  loadFromServer()
  {
    var url_api = this.props.url_api;
    if (Boolean(this.state.url_api) !== false) {
      url_api = this.state.url_api;
    }
    var defer = $.Deferred();

    if (this.canGet() === false) {
      this.setState({server_error: trans('messages.error.403')});
      var xhr = new XMLHttpRequest();
      var err = new Error();
      defer.reject(xhr, status, err);
      return defer.promise();
    }

    $.ajax({
      url: url_api,
      dataType: 'json',
      cache: false,
    })
    .done(function(data) {
      this.setState({rawData: data});
      this.setState({total_entries: data.length});
      defer.resolve(data);
    }.bind(this))
    .fail(function(xhr, status, err) {
      if (422 === xhr.status) {
        var responseJson = JSON.parse(xhr.responseText);
        this.setState({server_error: trans('messages.error.422')});
      } else if (403 === xhr.status) {
        this.setState({server_error: trans('messages.error.403')});
      } else {
        this.setState({server_error: trans('messages.error.500')});
      }
      console.error(this.state.url_api, status, err.toString());
      defer.reject(xhr, status, err);
    }.bind(this));

    return defer.promise();
  }

  componentWillMount()
  {
    this.loadFromServer();
  }

  componentDidUpdate()
  {
    this.createTable();
  }

  createTable()
  {
    var prefix = "messages.datatables.";
/*
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
*/
  }

  destroyTable()
  {
    // var table = $('#'+this.state.tableid).dataTable();
    // table.fnDestroy();
  }

  handleClick(e)
  {
    this.destroyTable();
    e.preventDefault();
    this.loadFromServer();
  }

  handleCreate(e)
  {
    var newurl = location.pathname + "/create";
    location.href = newurl;
  }

  handleImport(e)
  {
    var newurl = location.pathname + "/import/create";
    location.href = newurl;
  }

  handleExport(e)
  {
    var url_api = location.pathname + "/export";

    if (this.canExport() === false) {
      this.setState({server_error: trans('messages.error.403')});
    }

    window.open(url_api, '_top');

    return false;
  }

  returnDefaultProps(opt)
  {
    var props = jQuery.extend(true, {
      previous_page: this.state.previous_page,
      next_page: this.state.next_page,
      first: this.state.first,
      last: this.state.last,
      first_page: this.state.first_page,
      last_page: this.state.last_page,
      total_entries: this.state.total_entries,
      entries_per_pages: this.state.entries_per_pages,
      entries_per_page: this.state.entries_per_page,
      current_page: this.state.current_page,
      handleChange: this.handleChange.bind(this),
      tableid: this.props.tableid,
      data: this.state.data,
      key: opt.key,
      url_redirect: document.referrer,
      url_api: this.state.url_api,
      messages_prefix: this.props.messages_prefix,
    }, opt);
    return props;
  }

  returnPageFooter(opt)
  {
    var className = this.getName();
    opt = jQuery.extend(true, {key: 'page_footer', className: className + 'PageFooter'}, opt === undefined ? {} : opt);
    var classNameOfPageFooter = opt.className;
    var classOfPageFooter;
    try {
      classOfPageFooter = eval(classNameOfPageFooter);
    } catch(e) {
      classOfPageFooter = eval('OurTablePageFooter');
    }
    var props = this.returnDefaultProps(opt);
    props.formid = this.props.tableid + '-search-form1';
    props.input_type = [];
    var pageFooter = React.createElement(classOfPageFooter, props);
    return pageFooter;
  }

  returnPageHeader(opt)
  {
    var className = this.getName();
    opt = jQuery.extend(true, {key: 'page_header', className: className + 'PageHeader', button: false}, opt === undefined ? {} : opt);
    var classNameOfPageHeader = opt.className;
    var classOfPageHeader;
    try {
      classOfPageHeader = eval(classNameOfPageHeader);
    } catch(e) {
      classOfPageHeader = eval('OurTablePageHeader');
    }
    var props = this.returnDefaultProps(opt);
    props.formid = this.props.tableid + '-search-form2';
    props.input_type = [
      {id: 'search', type: 'text'},
      {id: 'entries_per_page', type: 'select'},
    ];
    props.handleClick = this.handleClick.bind(this);
    props.handleCreate = this.handleCreate.bind(this);
    props.handleChangeEntriesPerPage = this.handleChangeEntriesPerPage.bind(this);
    props.handleChangeSearchText = this.handleChangeSearchText.bind(this);
    var pageHeader = React.createElement(classOfPageHeader, props);
    return pageHeader;
  }

  returnBody(opt)
  {
    var className = this.getName();
    opt = jQuery.extend(true, {key: 'body', className: className + 'Body'}, opt === undefined ? {} : opt);
    var classNameOfBody = opt.className;
    var classOfBody;
    try {
      classOfBody = eval(classNameOfBody);
    } catch(e) {
      classOfBody = eval('OurTableBody');
    }
    var props = this.returnDefaultProps(opt);
    var body   = React.createElement(classOfBody, props);
    return body;
  }

  returnHeader(opt)
  {
    var className = this.getName();
    opt = jQuery.extend(true, {key: 'header', className: className + 'Header'}, opt === undefined ? {} : opt);
    var classNameOfHeader = opt.className;
    var classOfHeader;
    try {
      classOfHeader = eval(classNameOfHeader);
    } catch(e) {
      classOfHeader = eval('OurTableHeader');
    }
    var props = this.returnDefaultProps(opt);
    var body   = React.createElement(classOfHeader, props);
    return body;
  }

  render()
  {
    var display_server_error = this.state.server_error ? "block" : "none";
    var display_create = this.canAdd() ? "show" : "none";
    var className = this.getName();
    var classNameOfHeader = className + 'Header';
    var classOfHeader = eval(classNameOfHeader);
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
        <div className="widget-body no-padding">
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

OurTable.propTypes = {
  url_api: React.PropTypes.string.isRequired,
  interval: React.PropTypes.number.isRequired,
  data: React.PropTypes.array,
  tableid: React.PropTypes.string.isRequired,
  entries_per_pages: React.PropTypes.array.isRequired,
  messages_prefix: React.PropTypes.string.isRequired,
};