class OurRemoteTableHeader extends OurTableHeader
{
}

class OurRemoteTableBody extends OurTableBody
{
}

class OurRemoteTablePageHeader extends OurTablePageFooter
{
}

class OurRemoteTablePageFooter extends OurTablePageFooter
{
}

class OurRemoteTable extends OurTable
{
  constructor(props)
  {
    super(props);
    this.state.serverSide = true;
  }

  componentWillMount()
  {
    this.loadFromServerWithState(this.state);
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
      var promise = this.loadFromServerWithState(nextState);
      promise.done(function(data, status, xhr) {
        this.calculatePage(nextState);
      }.bind(this));
      promise.fail(function(xhr, status, err) {
      }.bind(this));
    }
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
      var raw = this.state.rawData[i];
      if (raw === undefined) {
        continue;
      }
      data.push(raw);
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

  loadFromServerWithState(state)
  {
    if (state === undefined) {
      state = this.state;
    }

    var param = this.returnObjectIndex();
    var defer = $.Deferred();

    if (this.canGet() === false) {
      this.setState({server_error: trans('messages.error.403')});
      var xhr = new XMLHttpRequest();
      var err = new Error();
      defer.reject(xhr, status, err);
      return defer.promise();
    }

    if (state.serverSide === true) {
      var data = jQuery.extend(true, {}, param.data);
      data.skip = state.current_page;
      data.take = state.entries_per_page;
      param.data = data;
    }

    var success = param.success;
    var error = param.error;

    param.success = function(data, status, xhr) {
      var total_entries = parseInt(xhr.getResponseHeader('X-ORION-Total-Count'));
      /*
      if (state.entries_per_page === data.length) {
        total_entries += 1;
      }
      */
      var rawData = new Array(state.entries_per_page * (state.current_page - 1));
      data.forEach(function(row, i) {
        rawData.push(row);
      }.bind(this));
      this.setState({rawData: rawData});
      this.setState({total_entries: total_entries});
      defer.resolve(data, status, xhr);
    }.bind(this);
    param.error = function(xhr, status, err) {
      error(xhr, status, err);
      defer.reject(xhr, status, err);
    }.bind(this);

    jQuery.ajax(param);

    return defer.promise();
  }
}
