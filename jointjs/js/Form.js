class Form extends AbstractBase
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

  returnFormType()
  {
    var className = this.getName();
    var regex = /(Edit|Create|View)/i;
    var matched = regex.exec(className);
    if (matched === null) {
      return 'view';
    }
    var type = matched[1].toLowerCase();
    return type;
  }

  isCreateForm()
  {
    var type = this.returnFormType();
    if (type === 'create') {
      return true;
    }
    return false;
  }

  isEditForm()
  {
    var type = this.returnFormType();
    if (type === 'edit') {
      return true;
    }
    return false;
  }

  renderEditSection()
  {
    var type = this.returnFormType();
    if (type !== 'edit') {
      return;
    } else {
      return this.renderLabelForTimestamps(this.state.datas, {});
    }
  }

  renderModalSet(datasObj)
  {
    var type = this.returnFormType();
    var ret = [];
    if (type === 'create') {
      if (this.canAdd() === true) {
        ret.push(this.renderModal(datasObj));
      }
    }
    if (type === 'edit') {
      if (this.canEdit() === true) {
        ret.push(this.renderModal(datasObj));
      }
      if (this.canDelete() === true) {
        ret.push(this.renderModalDel(datasObj));
      }
    }
    return ret;
  }

  renderSubmitButton()
  {
    var type = this.returnFormType();
    var ret = [];
    if (type === 'create') {
      if (this.canAdd() === true) {
        ret.push(
          <button type="button"
            key="create"
            className="btn btn-primary btn-lg pull-right header-btn"
            disabled={this.state.disabled_button}
            onClick={this.handleConfirm.bind(this)}
          >
            <i className="fa fa-circle-arrow-up fa-lg"></i>
            {trans('messages.button.create')}
          </button>
        );
      }
    }
    if (type === 'edit') {
      if (this.canEdit() === true) {
        ret.push(
          <button type="button"
            key="edit"
            className="btn btn-primary btn-lg pull-right header-btn"
            onClick={this.handleConfirm.bind(this)}
          >
            <i className="fa fa-circle-arrow-up fa-lg"></i>
            {trans('messages.button.update')}
          </button>
        );
      }
      if (this.canDelete() === true) {
        ret.push(
          <a
            data-toggle="modal"
            href={'#' + this.props.formid + '-modal-del'}
            className="btn btn-danger btn-lg pull-left header-btn"
            key="delete"
          >
            <i className="fa fa-circle-arrow-up fa-lg"></i>
            {trans('messages.button.delete')}
          </a>
        );
      }
    }
    ret.push(
      <button type="button" className="btn btn-default" onClick={this.handleCancel.bind(this)} key="cancel" >
        {trans('messages.button.cancel')}
      </button>
    );
    return ret;
  }

  renderModalSubmitButton()
  {
    var type = this.returnFormType();
    var ret = [];
    if (type === 'create') {
      if (this.canAdd() === true) {
        ret.push(
          <button type="button"
            key="create"
            className="btn btn-primary"
            disabled={this.state.disabled_button}
            onClick={this.handleSubmit.bind(this)}
          >
            {trans('messages.button.create')}
          </button>
        );
      }
    }
    if (type === 'edit') {
      if (this.canEdit() === true) {
        ret.push(
          <button type="button"
            key="edit"
            className="btn btn-primary"
            disabled={this.state.disabled_button}
            onClick={this.handleUpdate.bind(this)}
          >
            {trans('messages.button.update')}
          </button>
        );
      }
    }
    ret.push(
      <button type="button" className="btn btn-default" data-dismiss="modal" key="cancel">
        {trans('messages.button.cancel')}
      </button>
    );
    return ret;
  }

    getParameters() {
        var arg = new Object;
        var pair = location.search.substring(1).split('&');
        for(var i=0; pair[i]; i++) {
            var kv = pair[i].split('=');
            arg[kv[0]] = kv[1];
        }
        return arg;
    }

    // http://192.168.50.15/orion/user/21/edit ---> 21
    getMyId() {
        var user_id = location.pathname.replace(/\/edit$/, "").match(/\d+$/).join("");
        return user_id;
    }

  setSelect(key)
  {
    var datas = this.state.datas;
    if (
      jQuery('#' + key + ' option').size() === 1 ||
      jQuery('#' + key + ' option[value="' + datas[key] + '"]').size() === 0
    ) {
      datas[key] = jQuery('#' + key + ' option:first').val();
    }
    this.setState({datas: datas});
  }

    handleClose(e) {
        window.open('about:blank','_self').close();
    }

    handleCancel(e) {
        window.history.back();
    }

    returnSubmitDatas(){
        return {};
    }

  returnUploadDatas()
  {
    var params = {};
    params['csv'] = this.state.datas['csv'];
    return params;
  }

  returnShowDatas(id)
  {
    var url_api = this.props.url_api;
    if (Boolean(this.state.url_api) !== false) {
      url_api = this.state.url_api;
    }
    var url = url_api + "/" + id;
    var defer = $.Deferred();

    if (this.canGet() === false) {
      this.setState({server_error: trans('messages.error.403')});
      var xhr = new XMLHttpRequest();
      var err = new Error();
      defer.reject(xhr, status, err);
      return defer.promise();
    }

    $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
      cache: false,
      success: function(data) {
        var data1 = jQuery.isPlainObject(data) === true ? data : {};
        var datas = jQuery.extend(true, {}, this.state.datas, data);
        this.setState({datas:datas});
        defer.resolve(data);
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
        defer.reject(xhr, status, err);
      }.bind(this)
    });

    return defer.promise();
  }

    // @see https://github.com/js-cookie/js-cookie/blob/master/src/js.cookie.js
    returnCookieXSRFToken() {
        var rdecode = /(%[0-9A-Z]{2})+/g;
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        for (var i = 0; i < cookies.length; i++) {
            var parts = cookies[i].split('=');
            var name = parts[0];
            var cookie = parts[1];
            cookie = cookie.replace(rdecode, decodeURIComponent);
            if (name === 'XSRF-TOKEN') {
                return cookie;
            }
        }
        return null;
    }

    handleSubmit(e) {
        var params = this.returnSubmitDatas();
        this.setState({disabled_button: true});
        var token = this.returnCookieXSRFToken();

        var url_api = this.props.url_api;
        if (Boolean(this.state.url_api) !== false) {
          url_api = this.state.url_api;
        }
        var url_redirect = this.props.url_redirect;
        if (Boolean(this.state.url_redirect) !== false) {
          url_redirect = this.state.url_redirect;
        }

        $.ajax({
            url: url_api,
            headers: {'X-XSRF-TOKEN': token},
            dataType: 'json',
            type: 'POST',
            data: params,
            success: function(data) {
                this.setState({server_error: ''});
                location.href = url_redirect;
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
                if (jQuery('#' + this.props.formid + '-modal').size() !== 0) {
                  $('#' + this.props.formid +'-modal').modal('hide');
                } else {
                  $('#myModal').modal('hide');
                }
                this.setState({disabled_button: false});
            }.bind(this)
        });
    }

  handleUpload(e)
  {
    var params = this.returnUploadDatas();
    this.setState({disabled_button: true});
    var token = this.returnCookieXSRFToken();
    var url_api = this.props.url_api_upload;
    var url_redirect = this.props.url_redirect;
    var defer = $.Deferred();
    var url;
    if (Boolean(this.state.url_api_upload) !== false) {
      url_api = this.state.url_api_upload;
    }
    if (Boolean(this.state.url_redirect) !== false) {
      url_redirect = this.state.url_redirect;
    }
    url = url_api;

    if (url === undefined) {
      console.warn('props.url_api_upload is undefined.');
    };

    $.ajax({
      url: url,
      headers: {'X-XSRF-TOKEN': token},
      dataType: 'json',
      type: 'POST',
      data: params,
      success: function(data) {
        this.setState({server_error: ''});
        defer.resolve(data);
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
        defer.reject(xhr, status, err);
      }.bind(this),
      complete: function(xhr, status) {
        if (jQuery('#' + this.props.formid + '-modal-upload').size() !== 0) {
          $('#' + this.props.formid +'-modal-upload').modal('hide');
        } else {
          $('#myModalUpload').modal('hide');
        }
        this.setState({disabled_button: false});
      }.bind(this)
    });

    return defer.promise();
  }

  returnObjectShow(id)
  {
    var url_api = this.props.url_api;
    if (Boolean(this.state.url_api) !== false) {
      url_api = this.state.url_api;
    }
    var url = url_api + "/" + id;

    var ret = {
      url: url,
      dataType: 'json',
      type: 'GET',
      cache: false,
      success: function(data) {
        var data1 = jQuery.isPlainObject(data) === true ? data : {};
        var datas = jQuery.extend(true, {}, this.state.datas, data);
        this.setState({datas:datas});
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
      }.bind(this)
    };

    return ret;
  }

  returnObjectCreate(e)
  {
    var params = this.returnSubmitDatas();
    this.setState({disabled_button: true});
    var token = this.returnCookieXSRFToken();

    var url_api = this.props.url_api;
    if (Boolean(this.state.url_api) !== false) {
      url_api = this.state.url_api;
    }
    var url_redirect = this.props.url_redirect;
    if (Boolean(this.state.url_redirect) !== false) {
      url_redirect = this.state.url_redirect;
    }

    var ret = {
      url: url_api,
      headers: {'X-XSRF-TOKEN': token},
      dataType: 'json',
      type: 'POST',
      data: params,
      success: function(data) {
        this.setState({server_error: ''});
        location.href = url_redirect;
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
        if (jQuery('#' + this.props.formid + '-modal').size() !== 0) {
          $('#' + this.props.formid +'-modal').modal('hide');
        } else {
          $('#myModal').modal('hide');
        }
        this.setState({disabled_button: false});
      }.bind(this)
    };

    return ret;
  }

  returnObjectUpdate(e)
  {
    var params = this.returnSubmitDatas();
    this.setState({disabled_button: true});
    var token = this.returnCookieXSRFToken();

    var url_api = this.props.url_api;
    if (Boolean(this.state.url_api) !== false) {
      url_api = this.state.url_api;
    }
    var url_redirect = this.props.url_redirect;
    if (Boolean(this.state.url_redirect) !== false) {
      url_redirect = this.state.url_redirect;
    }
    var url = url_api + "/" + this.getMyId();
    var ret = {
      url: url,
      headers: {'X-XSRF-TOKEN': token},
      dataType: 'json',
      type: 'PUT',
      data: params,
      success: function(data) {
        this.setState({server_error: ''});
        location.href = url_redirect;
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
        if (jQuery('#' + this.props.formid + '-modal').size() !== 0) {
          $('#' + this.props.formid +'-modal').modal('hide');
        } else {
          $('#myModal').modal('hide');
        }
        this.setState({disabled_button: false});
      }.bind(this)
    };

    return ret;
  }

  returnObjectDelete(e)
  {
    var url_api = this.props.url_api;
    if (Boolean(this.state.url_api) !== false) {
      url_api = this.state.url_api;
    }
    var url_redirect = this.props.url_redirect;
    if (Boolean(this.state.url_redirect) !== false) {
      url_redirect = this.state.url_redirect;
    }
    var url = url_api + "/" + this.getMyId();
    var params = {};
    this.setState({disabled_button: true});
    var token = this.returnCookieXSRFToken();
    var ret = {
      url: url,
      headers: {'X-XSRF-TOKEN': token},
      dataType: 'json',
      type: 'DELETE',
      data: params,
      success: function(data) {
        this.setState({server_error: ''});
        location.href = url_redirect;
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
        if (jQuery('#' + this.props.formid + '-modal-del').size() !== 0) {
          $('#' + this.props.formid +'-modal-del').modal('hide');
        } else {
          $('#myModalDel').modal('hide');
        }
        this.setState({disabled_button: false});
      }.bind(this)
    };

    return ret;
  }

  handleUpdate(e)
  {
    var params = this.returnSubmitDatas();
    this.setState({disabled_button: true});
    var token = this.returnCookieXSRFToken();

    var url_api = this.props.url_api;
    if (Boolean(this.state.url_api) !== false) {
      url_api = this.state.url_api;
    }
    var url_redirect = this.props.url_redirect;
    if (Boolean(this.state.url_redirect) !== false) {
      url_redirect = this.state.url_redirect;
    }
    var url = url_api + "/" + this.getMyId();

        $.ajax({
            url: url,
            headers: {'X-XSRF-TOKEN': token},
            dataType: 'json',
            type: 'PUT',
            data: params,
            success: function(data) {
                this.setState({server_error: ''});
                location.href = url_redirect;
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
                if (jQuery('#' + this.props.formid + '-modal').size() !== 0) {
                  $('#' + this.props.formid +'-modal').modal('hide');
                } else {
                  $('#myModal').modal('hide');
                }
                this.setState({disabled_button: false});
            }.bind(this)
        });
    }

    handleDelete(e) {
        var url_api = this.props.url_api;
        if (Boolean(this.state.url_api) !== false) {
          url_api = this.state.url_api;
        }
        var url_redirect = this.props.url_redirect;
        if (Boolean(this.state.url_redirect) !== false) {
          url_redirect = this.state.url_redirect;
        }
        var url = url_api + "/" + this.getMyId();
        var params = {};
        this.setState({disabled_button: true});
        var token = this.returnCookieXSRFToken();

        $.ajax({
            url: url,
            headers: {'X-XSRF-TOKEN': token},
            dataType: 'json',
            type: 'DELETE',
            data: params,
            success: function(data) {
                this.setState({server_error: ''});
                location.href = url_redirect;
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
                if (jQuery('#' + this.props.formid + '-modal-del').size() !== 0) {
                  $('#' + this.props.formid +'-modal-del').modal('hide');
                } else {
                  $('#myModalDel').modal('hide');
                }
                this.setState({disabled_button: false});
            }.bind(this)
        });
    }

    changeText(e) {
        var datas = jQuery.extend({}, this.state.datas);
        datas[e.target.id] = e.target.value;
        this.setState({datas: datas});
    }

  changeSelect(e)
  {
    var datas = jQuery.extend({}, this.state.datas);
    datas[e.target.id] = e.target.value;
    this.setState({datas: datas});
  }

    changeCheckbox(e)
    {
      var datas = jQuery.extend(true, {}, this.state.datas);
      var values = jQuery.isArray(datas[e.target.id]) === true ? datas[e.target.id] : [];
      var idx = jQuery.inArray(e.target.value, values);
      if (idx === -1) {
        values.push(e.target.value);
      } else {
        if (e.target.checked === false) {
          values.splice(idx, 1);
        }
      }
      datas[e.target.id] = values;
      this.setState({datas: datas});
    }

    changeSelectMultiple(e)
    {
        var datas = jQuery.extend({}, this.state.datas);
        var options = e.target.options;
        var values = [];
        for (var i = 0, l = options.length; i < l; i++) {
          if (options[i].selected === true) {
            values.push(options[i].value);
          }
        }
        datas[e.target.id] = values;
        this.setState({datas: datas});
    }

    changeSelect2Columns(fromId, toId)
    {
      var datas = jQuery.extend(true, {}, this.state.datas);
      // var datas = this.state.datas;
      var from = jQuery("#" + fromId).get(0);
      var to = jQuery("#" + toId).get(0);
      var options = from.options;
      var values = jQuery.isArray(datas[to.id]) === true ? datas[to.id] : [];
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected === true) {
          var idx = jQuery.inArray(options[i].value, values);
          if (idx === -1) {
            values.push(options[i].value);
          }
        }
      }
      datas[to.id] = values;
      this.setState({datas: datas});
    }

    removeSelect2Columns(fromId, toId)
    {
      var datas = jQuery.extend(true, {}, this.state.datas);
      // var datas = this.state.datas;
      var from = jQuery("#" + fromId).get(0);
      var to = jQuery("#" + toId).get(0);
      var options = from.options;
      var values = jQuery.isArray(datas[from.id]) === true ? datas[from.id] : [];
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected === true) {
          var idx = jQuery.inArray(options[i].value, values);
          if (idx !== -1) {
            values.splice(idx, 1);
          }
        }
      }
      datas[from.id] = values;
      this.setState({datas: datas});
    }

    changeFile(e) {
        var datas = jQuery.extend({}, this.state.datas);
        var id = e.target.id;
        jQuery(e.target.parentNode).siblings("input").val(e.target.value);
        // e.target.parentNode.nextSibling.value = e.target.value;
        var _this = this;
        _this.setState({datas: datas});

        var fakePath = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(upload) {
            var datas = jQuery.extend({}, _this.state.datas);
            datas[id] = "filename:" + fakePath.name + ";" + upload.target.result;
            _this.setState({datas: datas});
        };
        // reader.readAsText(e.target.files[0]);
        // reader.readAsBinaryString(e.target.files[0]);
        if (fakePath !== undefined) {
            reader.readAsDataURL(fakePath);
        }
    }

    changeRadio(e) {
        var datas = jQuery.extend({}, this.state.datas);
        datas[e.target.id] = e.target.value;
        this.setState({datas: datas});
    }

  renderSection(items, option)
  {
    if (jQuery.isPlainObject(option) === false) {
      option = {section: true};
    }
    var render = option.hasOwnProperty('render') === true ? option.render : 'label';
    var cols = items.map(function(item) {
      // ReactElementかどうかを判定
      if (jQuery.isPlainObject(item) === true && item.hasOwnProperty('_owner') === true) {
        return item;
      } else {
        if (render === 'label') {
          return this.renderLabel(item);
        } else {
          return this.renderInput(item);
        }
      }
    }.bind(this));

    if (option.section === true) {
      return (
        <section>
          <div className="row">
            {cols}
          </div>
        </section>
      );
    } else {
      return (
        <div>
          {cols}
        </div>
      );
    }
  }

  renderHiddenInput(datas, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    tmp.field = <input
                  type="hidden" id={datas.id} name={datas.id} placeholder={datas.title} value={datas.value} disabled={disabled}
                />;
    return tmp.field;
    return this.renderIconFieldToDatasObject(tmp, option)
  }

  renderTextInput(datas, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    var func = this.changeText.bind(this);
    if (tmp.hasOwnProperty('onChange') && jQuery.isFunction(datas.onChange) === true) {
      func = datas.onChange;
    }
    tmp.field = <input
                  type="text" id={datas.id} name={datas.id} placeholder={datas.title} value={datas.value} disabled={disabled} onChange={func}
                />;
    return this.renderIconFieldToDatasObject(tmp, option)
  }

  renderTextareaInput(datas, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    var rows = 5;
    var cols = 40;
    if (datas.hasOwnProperty('rows') === true) {
      rows = datas.rows;
    }
    if (datas.hasOwnProperty('cols') === true) {
      cols = datas.cols;
    }
    tmp.field = <label className="textarea textarea-resizable">
      <textarea
        rows={rows}
        cols={cols}
        className="custom-scroll" id={datas.id} name={datas.id}
        placeholder={datas.title}
        disabled={disabled}
        onChange={this.changeText.bind(this)}
        value={datas.value}
      />
    </label>;
    return this.renderIconFieldToDatasObject(tmp, option)
  }

  renderCheckboxInput(datas, values, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    var self = this;
    var options = Object.keys(values).map(function(value) {
      var name = values[value];
      var checked = jQuery.inArray(value, datas.value) !== -1 ? true : false;
      return (
        <label key={value} className="checkbox">
          <input type="checkbox" id={datas.id} name={datas.id} value={value} checked={checked} onChange={self.changeCheckbox.bind(self)} />
          <i></i>{name}
        </label>
      )
    });
    return (
      <section>
        <div className="row">
          <label className="label col col-2">{datas.title}</label>
          <div className="col col-10 inline-group">
            {options}
          </div>
        </div>
      </section>
    )
  }

  renderRadioInput(datas, values, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }

    var tmp = jQuery.extend(true, {}, datas);
    var self = this;
    var options;
    if (jQuery.isArray(values) === true) {
      options = values.map(function(name, value) {
        var checked = (value == datas.value) ? true : false;
        return (
          <label key={value} className="radio">
            <input type="radio" id={datas.id} name={datas.id} value={value}
              checked={checked} onChange={self.changeRadio.bind(self)} disabled={disabled}
            />
            <i></i>{name}
          </label>
        )
      });
    } else {
      options = Object.keys(values).map(function(value) {
        var name = values[value];
        var checked = (value == datas.value) ? true : false;
        return (
          <label key={value} className="radio">
            <input type="radio" id={datas.id} name={datas.id} value={value}
              checked={checked} onChange={self.changeRadio.bind(self)} disabled={disabled}
            />
            <i></i>{name}
          </label>
        )
      });
    }
    return (
      <section>
        <div className="row">
          <label className="label col col-2">{datas.title}</label>
          <div className="col col-10 inline-group">
            {options}
          </div>
        </div>
      </section>
    )
  }

  /**
   * 古いメソッド。renderSelectFieldへ乗り換えて！
   */
  renderSelectValue(id, label, title, values)
  {
    var options = values.map(function(name, value){
      return <option key={value} value={value} >{name}</option>
    });
    label = label + " " + (this.state.invalids[id] ? 'state-error' : '');
    return (
      <section>
        <div className="row">
          <label className="label col col-2">{title}</label>
          <div className="col col-10">
            <label className={label}>
              <select id={id} name={id} ref={id} onChange={this.changeSelect.bind(this)}>
                {options}
              </select>
              <i></i>
              <em className="invalids">{this.state.invalids[id]}</em>
            </label>
          </div>
        </div>
      </section>
    )
  }

  renderPasswordInput(datas, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    if ('' === datas.value) {
      tmp.field = <input
                    type="password" id={datas.id} name={datas.id} placeholder={datas.title}
                    disabled={disabled} onChange={this.changeText.bind(this)}
                  />;
    } else {
      tmp.field = <input
                    type="password" id={datas.id} name={datas.id} placeholder={datas.title} value={datas.value}
                    disabled={disabled} onChange={this.changeText.bind(this)}
                  />;
    }
    return this.renderIconFieldToDatasObject(tmp, option)
  }

  /**
   * 古いメソッド。renderSelectFieldへ乗り換えて！
   */
  renderSelect(id, label, title, values)
  {
    var options = values.map(function(value){
      return <option key={value} value={value} >{trans('messages.language.'+value)}</option>
    });
    return (
      <section>
        <div className="row">
          <label className="label col col-2">{title}</label>
          <div className="col col-10">
            <label className={label}>
              <select id={id} name={id} ref={id} onChange={this.changeSelect.bind(this)} >
                {options}
              </select>
              <i></i>
            </label>
          </div>
        </div>
      </section>
    )
  }

  renderSelectField(datas, values, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    var options = Object.keys(values).map(function(name, value){
      return <option key={name} value={name} >{values[name]}</option>
    });
    var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
    tmp.field = <label className={label}>
                  <select id={datas.id} name={datas.id} ref={datas.id} value={datas.value} onChange={this.changeSelect.bind(this)}
                    className="select2"
                    disabled={disabled}
                  >
                    {options}
                  </select>
                  <i></i>
                  <em className="invalids">{this.state.invalids[datas.id]}</em>
                </label>;
    return this.renderIconFieldToDatasObject(tmp, option)
  }

  renderSelect2ColumnsField(datas, values, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    var value1 = jQuery.isArray(datas.value) === true ? datas.value : [];
    var options1 = value1.map(function(name){
      return <option key={name} value={name}>{values[name]}</option>
    });
    var options2 = Object.keys(values).map(function(name, value){
      return <option key={name} value={name}>{values[name]}</option>
    });
    var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
    tmp.cols = [2, 4, 2, 4];
    var field1 = <label className={label}>
                   <select
                     multiple={true} id={datas.id} name={datas.id} ref={datas.id} className="custom-scroll select2"
                   >
                     {options1}
                   </select>
                 </label>;
    var field2 = <label className="">
                   <button type="button"
                     className="btn btn-default btn-sm"
                     onClick={this.changeSelect2Columns.bind(this, datas.id + '_dummy', datas.id)}
                   >
                     <span>&emsp;</span>
                     <i className="fa fa-arrow-left"> </i>
                     <span>&emsp;</span>
                     {trans('messages.button.add')}
                     <span>&emsp;</span>
                   </button>
                   <br />
                   <br />
                   <button type="button"
                     className="btn btn-default btn-sm"
                     onClick={this.removeSelect2Columns.bind(this, datas.id, datas.id + '_dummy')}
                   >
                     <span>&emsp;</span>
                     {trans('messages.button.delete')}
                     <span>&emsp;</span>
                     <i className="fa fa-arrow-right"> </i>
                     <span>&emsp;</span>
                   </button>
                 </label>;
    var field3 = <label className={label}>
                   <select multiple={true} id={datas.id + "_dummy"} name={datas.id + "_dummy"} className="custom-scroll select2"
                   >
                     {options2}
                   </select>
                   <i></i>
                   <em className="invalids">{this.state.invalids[datas.id]}</em>
                 </label>;
    tmp.field = [field1, field2, field3];
    return this.renderIconFieldToDatasObject(tmp, option)
  }

  renderSelectMultipleField(datas, values, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    var options = Object.keys(values).map(function(name, value){
      return <option key={name} value={name} >{values[name]}</option>
    });
    var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
    tmp.field = <label className={label}>
                  <select multiple={true} id={datas.id} name={datas.id} ref={datas.id}
                    value={datas.value} onChange={this.changeSelectMultiple.bind(this)}
                    className="select2"
                  >
                    {options}
                  </select>
                  <i></i>
                  <em className="invalids">{this.state.invalids[datas.id]}</em>
                </label>;
    return this.renderIconFieldToDatasObject(tmp, option)
  }

  renderFileInput(datas, options, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    var self = this;
    var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
    tmp.field = <div className={label}>
                  <input type="text" placeholder={datas.tooltip} readOnly="readonly" />
                  <span className="button">
                    <input id={datas.id} type="file" name={datas.id} onChange={self.changeFile.bind(self)} />
                    Browse
                  </span>
                  <i></i>
                  <em className="invalids">{this.state.invalids[datas.id]}</em>
                </div>;
    return this.renderIconFieldToDatasObject(tmp, option)
  }

  renderDatePickerInput(datas, timer, disabled, option)
  {
    if (disabled === undefined || disabled === null) {
      disabled = '';
    }
    var tmp = jQuery.extend(true, {}, datas);
    var self = this;
    var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
    var timeinput = jQuery.isPlainObject(timer) === true ? this.renderTimePickerInput(timer) : null;
    tmp.field = <label className={label}>
                  <input id={datas.id} type="text" name={datas.id}
                    placeholder={datas.tooltip} className="form-control" data-dateformat="yyyy-mm-dd" value={datas.value}
                  />
                  {timeinput}
                  <i></i>
                  <em className="invalids">{this.state.invalids[datas.id]}</em>
                </label>;
    if (tmp.hasOwnProperty('cols') === false) {
      tmp.cols = [2, 5];
    }
    return this.renderIconFieldToDatasObject(tmp, option)
  }

    renderTimePickerInput(datas, disabled)
    {
      if (disabled === undefined || disabled === null) {
        disabled = '';
      }
      var self = this;
      var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
      return (
        <label className={label}>
          <input id={datas.id} type="text" name={datas.id} placeholder={datas.tooltip} className="form-control" value={datas.value} />
        </label>
      );
    }

  renderLabelForDatePickerInput(datas, timer, option)
  {
    var timeinput = jQuery.isPlainObject(timer) === true ? this.renderLabelForTimePickerInput(timer) : null;
    var tmp = jQuery.extend(true, {}, datas);
    tmp.field = <div>
                  {datas.value} {timeinput}
                </div>;
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForTimePickerInput(timer)
  {
    return timer.value;
  }

  renderInput(datas)
  {
    var type = "";
    try {
      type = datas.type.toLowerCase();
    } catch (e) {
      // noop
    }
    var result = null;

    var option = arguments[arguments.length - 1];
    if (jQuery.isPlainObject(option) === false) {
      option = {section: true};
    } else if (option.hasOwnProperty('section') === false) {
      option = {section: true};
    }

    switch(type) {
      case "textarea":
        result = this.renderTextareaInput(datas, arguments[1], option);
        break;
      case "radio":
        result = this.renderRadioInput(datas, arguments[1], arguments[2], option);
        break;
      case "checkbox":
        result = this.renderCheckboxInput(datas, arguments[1], arguments[2], option);
        break;
      case "select":
        result = this.renderSelectField(datas, arguments[1], arguments[2], option);
        break;
      case "select_multiple":
        result = this.renderSelectMultipleField(datas, arguments[1], arguments[2], option);
        break;
      case "select_2columns":
        result = this.renderSelect2ColumnsField(datas, arguments[1], arguments[2], option);
        break;
      case "date":
        result = this.renderDatePickerInput(datas, arguments[1], arguments[2], option);
        break;
      case "datetime":
        result = this.renderDatePickerInput(datas, arguments[1], arguments[2], option);
        break;
      case "password":
        result = this.renderPasswordInput(datas, arguments[1], option);
        break;
      case "file":
        result = this.renderFileInput(datas, arguments[1], option);
        break;
      case "hidden":
        result = this.renderHiddenInput(datas, arguments[1], option);
        break;
      default:
        result = this.renderTextInput(datas, arguments[1], option);
        break;
    }

    return result;
  }

  renderLabel(datas)
  {
    var type = "";
    try {
      type = datas.type.toLowerCase();
    } catch (e) {
      // noop
    }
    var result = null;

    var option = arguments[arguments.length - 1];
    if (jQuery.isPlainObject(option) === false) {
      option = {section: true};
    } else if (option.hasOwnProperty('section') === false) {
      option = {section: true};
    }

    switch(type) {
      case "textarea":
        result = this.renderLabelForTextareaInput(datas, option);
        break;
      case "radio":
        result = this.renderLabelForRadioInput(datas, option);
        break;
      case "checkbox":
        result = this.renderLabelForCheckboxInput(datas, option);
        break;
      case "select":
        result = this.renderLabelForSelect(datas, option);
        break;
      case "select_multiple":
        result = this.renderLabelForSelectMultiple(datas, option);
        break;
      case "select_2columns":
        result = this.renderLabelForSelect2Columns(datas, option);
        break;
      case "date":
        result = this.renderLabelForDatePickerInput(datas, option);
        break;
      case "datetime":
        result = this.renderLabelForDatePickerInput(datas, arguments[1], option);
        break;
      case "password":
        result = this.renderLabelForPasswordInput(datas, option);
        break;
      case "file":
        result = this.renderLabelForFileInput(datas, option);
        break;
      case "hidden":
        result = undefined;
        break;
      default:
        result = this.renderLabelForTextInput(datas, option);
        break;
    }

    return result;
  }

   /**
    * 従来の方法: 互換性の為、そのまま残しています
    */
   renderIconField(id, label, icon, title, tooltip, field) {
       var label = label + ' ' + (this.state.invalids[id] ? 'state-error' : '');
       return (
         <section>
           <div className="row">
             <label className="label col col-2">{title}</label>
             <div className="col col-10">
               {(tooltip == '' ? function() {
                 return <label className={label}> <i className={icon}></i>
                   {field}
                 </label>
               } : function() {
                 return <label className={label}> <i className={icon}></i>
                   {field}
                   <b className="tooltip tooltip-bottom-right">{tooltip}</b>
                   <em className="invalids">{this.state.invalids[id]}</em>
                 </label>
               }).call(this)}
             </div>
           </div>
         </section>
       )
   }

  getOption(arg)
  {
    var option = arg[arg.length - 1];
    if (jQuery.isPlainObject(option) === false) {
      option = {section: true};
    } else if (option.hasOwnProperty('section') === false) {
      option = {section: true};
    }
    return option;
  }

  getGridSize(datas)
  {
    if (datas.hasOwnProperty('cols') === true) {
      return datas.cols;
    }
    return [2, 10];
  }

  getGridClassNames(datas, render)
  {
    var grid = this.getGridSize(datas);
    var cols = [];

    if (render === undefined) {
      render = 'label';
    }

    if (render === 'label') {
      for (var i = 0; i < grid.length; i++) {
        if (i === 0) {
          if (grid[i] !== '') {
            cols.push(['label', 'col', 'col-' + grid[i]]);
          } else {
            cols.push([]);
          }
        } else {
          if (grid[i] !== '') {
            cols.push(['label', 'col', 'col-' + grid[i]]);
          } else {
            cols.push([]);
          }
        }
      }
    } else {
      for (var i = 0; i < grid.length; i++) {
        if (i === 0) {
          if (grid[i] !== '') {
            cols.push(['label', 'col', 'col-' + grid[i]]);
          } else {
            cols.push([]);
          }
        } else {
          if (grid[i] !== '') {
            cols.push(['col', 'col-' + grid[i]]);
          } else {
            cols.push([]);
          }
        }
      }
    }
    return cols;
  }

  isRequiredField(id)
  {
    var rules = this.returnValidationRules();
    var required = false;
    if (rules.hasOwnProperty(id) === true) {
      if (rules[id].hasOwnProperty('required') === true) {
        return rules[id].required;
      }
    }
    return required;
  }

  renderLabelFieldToDatasObject(datas, option)
  {
    var id = datas.id;
    var label = datas.label;
    var icon = datas.icon;
    var title = datas.title;
    var tooltip = datas.tooltip;
    var field = jQuery.isArray(datas.field) === true ? datas.field : [datas.field];
    field.unshift(title);
    var grid = this.getGridClassNames(datas, 'label');
    var requiredSpan = this.isRequiredField(id) === true ? <code>*</code> : <code></code>; 

    var fields = [
      <label className={grid[0].join(' ')}>{field[0]} {requiredSpan}</label>
    ];
    icon = '';

    if (jQuery.isPlainObject(option) === false) {
      option = {section: true, label: true};
    }
    label = label + ' ' + (this.state.invalids[id] ? 'state-error' : '');
    if (option.hasOwnProperty('label') === true && option.label === false) {
      fields = [null];
    }

    for (var i = 1; i < grid.length; i++) {
      if (i === 1) {
        fields.push(
          <div className={grid[i].join(' ')}>
            {(tooltip == '' ? function() {
              return <label className={label}>
                <i className={icon}></i>
                {field[i]}
              </label>
            } : function() {
              return <label className={label}>
                <i className={icon}></i>
                {field[i]}
                <b className="tooltip tooltip-bottom-right">{tooltip}</b>
                <em className="invalids">{this.state.invalids[id]}</em>
              </label>
            }).call(this)}
          </div>
        );
      } else {
        fields.push(
          <div className={grid[i].join(' ')}>
            {field[i]}
          </div>
        );
      }
    }

    if (option.hasOwnProperty('section') === true && option.section === false) {
      return (
        <div>
          {fields}
        </div>
      );
    } else {
      return (
        <section>
          <div className="row">
            {fields}
          </div>
        </section>
      );
    }
  }

  renderIconFieldToDatasObject(datas, option)
  {
    var id = datas.id;
    var label = datas.label;
    var icon = datas.icon;
    var title = datas.title;
    var tooltip = datas.tooltip;
    var field = jQuery.isArray(datas.field) === true ? datas.field : [datas.field];
    field.unshift(title);
    var grid = this.getGridClassNames(datas, '');
    var requiredSpan = this.isRequiredField(id) === true ? <code>*</code> : <code></code>; 
    var fields = [
      <label className={grid[0].join(' ')}>{field[0]} {requiredSpan}</label>
    ];

    if (jQuery.isPlainObject(option) === false) {
      option = {section: true, label: true};
    }
    label = label + ' ' + (this.state.invalids[id] ? 'state-error' : '');
    if (option.hasOwnProperty('label') === true && option.label === false) {
      fields = [null];
    }

    for (var i = 1; i < grid.length; i++) {
      if (i === 1) {
        fields.push(
          <div className={grid[i].join(' ')}>
            {(tooltip == '' ? function() {
              return <label className={label}> <i className={icon}></i>
                {field[i]}
              </label>
            } : function() {
              return <label className={label}> <i className={icon}></i>
                {field[i]}
                <b className="tooltip tooltip-bottom-right">{tooltip}</b>
                <em className="invalids">{this.state.invalids[id]}</em>
              </label>
            }).call(this)}
          </div>
        );
      } else {
        fields.push(
          <div className={grid[i].join(' ')}>
            {field[i]}
          </div>
        );
      }
    }

    if (option.hasOwnProperty('section') === true && option.section === false) {
      return (
        <div>
          {fields}
        </div>
      );
    } else {
      return (
        <section>
          <div className="row">
            {fields}
          </div>
        </section>
      );
    }
  }

  renderLabelForTextInput(datas, option)
  {
    var tmp = jQuery.extend(true, {}, datas);
    tmp.field = datas.value;
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForTextareaInput(datas, option)
  {
    var tmp = jQuery.extend(true, {}, datas);
    tmp.field = <label className="textarea textarea-resizable">
                  <textarea rows="3"
                    className="custom-scroll"
                    disabled="disabled"
                    value={datas.value}
                  >
                  </textarea>
                </label>;
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForFileInput(datas, option)
  {
    var tmp = jQuery.extend(true, {}, datas);
    var element = document.getElementById(datas.id);
    var val;

    if (element) {
        val = document.getElementById(datas.id).parentNode.nextSibling.value;
    }
    tmp.field = val;
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForPasswordInput(datas, option)
  {
    var tmp = jQuery.extend(true, {}, datas);
    var dummy_val = '';
    if ('' !== datas.value && undefined !== datas.value) { dummy_val = '********'; }
    tmp.field = dummy_val;
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForSelect(datas, option)
  {
    var tmp = jQuery.extend(true, {}, datas);
    jQuery('#' + datas.id).val(datas.value);
    var value =  $('#' + datas.id + ' option:selected').text();
    tmp.field = value;
    tmp.label = '';
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForCheckboxInput(datas, option)
  {
    var tmp = jQuery.extend(true, {}, datas);
    jQuery('#' + datas.id).val(datas.value);
    var value =  $('input[name="' + datas.id + '"]:checked').siblings('span').html();
    tmp.field = value;
    tmp.label = '';
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForSelectMultiple(datas, option)
  {
    var tmp = jQuery.extend(true, {}, datas);
    var options = {};
    jQuery('#' + datas.id + ' option').each(function(num, opt) {
      options[opt.value] = opt.text;
    });
    var lis = datas.value.map(function(id) {
      return <li key={id}>{options[id]}</li>;
    }.bind(this));
    tmp.field = [lis];
    tmp.label = '';
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForSelect2Columns(datas, option)
  {
    var tmp = jQuery.extend(true, {}, datas);
    var options = {};
    jQuery('#' + datas.id + '_dummy' + ' option').each(function(num, option) {
      options[option.value] = option.text;
    });
    var lis = datas.value.map(function(id) {
      return <li key={id}>{options[id]}</li>;
    }.bind(this));
    tmp.field = [lis];
    tmp.label = '';
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForRadioInput(datas, option)
  {
    var tmp = jQuery.extend(true, {}, datas);
    var value = $("input[name='" + datas.id + "']:checked").parent().text();
    tmp.field = value;
    tmp.label = '';
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

  renderLabelForTimestamps(row, option)
  {
    var tmp = jQuery.extend(true, {});
    tmp.title = trans('messages.label.timestamps');
    tmp.field = <div>
                  {row.created_at} / {row.updated_at}
                </div>
    return this.renderLabelFieldToDatasObject(tmp, option);
  }

    setDatepickerVal(prime, second='')
    {
	var _this = this;
	$('#'+prime).datepicker({
            dateFormat: 'yy-mm-dd',
            prevText: '<i class="fa fa-chevron-left"></i>',
            nextText: '<i class="fa fa-chevron-right"></i>',
            onClose: function (selectedDate) {
		var datas = _this.state.datas;
		datas[prime] = selectedDate;
		_this.setState({datas: datas});
		if ('' !== second) {
		    $('#'+second).datepicker("option", "minDate", selectedDate);
		}
            }
	});
    }

    setTimepickerVal(key)
    {
	var _this = this;
	$('#'+key).timepicker(
            {
		showMeridian: false,
		defaultTime: false
            }
	).on('changeTime.timepicker', function(e) {
            var datas = _this.state.datas;
            datas[key] = e.time.value;
            _this.setState({datas: datas});
	});
    }

    renderInputValidityPeriod(datasObj, start_date, start_time, end_date, end_time)
    {
	return (
          <section>
            <div className="row">
              <label className="label col col-2">
                {trans('messages.form.available_period')}
              </label>
              <div className="col col-10 inline-group">
                <div className="col col-3">
                  {this.renderDatePickerInput(datasObj[start_date], null, '', {section: false, label: false})}
                </div>
                <div className="col col-2">
                  {this.renderTimePickerInput(datasObj[start_time], '')}
                </div>
                <div className="col col-2">
                  {trans('messages.form.between')}
                </div>
                <div className="col col-3">
                  {this.renderDatePickerInput(datasObj[end_date], null, '', {section: false, label: false})}
                </div>
                <div className="col col-2">
                  {this.renderTimePickerInput(datasObj[end_time], '')}
                </div>
              </div>
            </div>
          </section>
        );
    }

    renderLabelValidityPeriod(datasObj, start_date, start_time, end_date, end_time)
    {
	return (
          <section>
            <div className="row">
              <label className="label col col-2">
                {trans('messages.form.available_period')}
              </label>
              <div className="col col-10 inline-group">
                <div className="col col-3">
                  {this.renderLabelForDatePickerInput(datasObj[start_date], null, '', {section: false, label: false})}
                </div>
                <div className="col col-2">
                  {this.renderLabelForTimePickerInput(datasObj[start_time], '')}
                </div>
                <div className="col col-2">
                  {trans('messages.form.between')}
                </div>
                <div className="col col-3">
                  {this.renderLabelForDatePickerInput(datasObj[end_date], null, '', {section: false, label: false})}
                </div>
                <div className="col col-2">
                  {this.renderLabelForTimePickerInput(datasObj[end_time], '')}
                </div>
              </div>
            </div>
          </section>
	);
    }

    render() {
        return false;
    }

    renderModal(datasObj) {
    }

  renderModalDel(datasObj)
  {
    var display_delete = this.canDelete() === true ? "block" : "none";

    return (
      <div className="modal fade" id={this.props.formid + "-modal-del"} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                &times;
              </button>
              <h4 className="modal-title">
                {trans(this.props.messages_prefix + '.title-confirm-popup')}
              </h4>
            </div>
            <div className="modal-body no-padding">
              <form id={this.props.formid + "-check-form"} className="smart-form">
                <fieldset>
                  {trans(this.props.messages_prefix + '.remind-delete')}
                </fieldset>
                <footer>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={this.handleDelete.bind(this)}
                    disabled={this.state.disabled_button}
                    style={{display: display_delete}}
                  >
                    {trans('messages.button.delete')}
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

  renderModalUpload(datasObj)
  {
    var display_import = this.canImport() === true ? "block" : "none";

    return (
      <div className="modal fade" id={this.props.formid + "-modal-upload"} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                &times;
              </button>
              <h4 className="modal-title">
                {trans(this.props.messages_prefix + '.title-confirm-popup')}
              </h4>
            </div>
            <div className="modal-body no-padding">
              <form id={this.props.formid + "-check-form-upload"} className="smart-form">
                <fieldset>
                  {trans(this.props.messages_prefix + '.remind-upload')}
                </fieldset>
                <footer>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleUpload.bind(this)}
                    disabled={this.state.disabled_button}
                    style={{display: display_import}}
                  >
                    {trans('messages.button.upload')}
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

    returnValidationMessageTemplates() {
        var message_templates = {
            'ja' : {
                required : ":attributeは必ず指定してください。",
                maxlength : ":attributeは、:max文字以下でご指定ください。",
                required_if : ":attributeは必ず指定してください。",
                url_if : ":attributeに正しい形式をご指定ください。",
                regex : ":attributeに正しい形式をご指定ください。",
                email : ":attributeに正しい形式をご指定ください。",
                equalTo : "同じ値を入れてください。",
                minlength : ":attributeは、:max以上でご指定ください。",
            },
            'en' : {
                required : "The :attribute field is required.",
                maxlength : "The :attribute may not be greater than :max characters.",
                required_if : "The :attribute field is required.",
                url_if : "The :attribute format is invalid.",
                regex : "The :attribute format is invalid.",
                email : "The :attribute format is invalid.",
                equalTo : "Please enter the same value again.",
                minlength : "The :attribute may not be less than :max characters.",
            },
        };
        return message_templates;
    }

  returnDatasObject()
  {
    var datasObj = {};

    if (this.props.messages_prefix === undefined) {
      console.warn('no config messages_prefix');
      return false;
    }

    this.props.input_type.forEach(function(item) {
      var data = {
        id: item.id,
        type: item.type,
        title: trans(this.props.messages_prefix + '.form.' + item.id),
        label: 'input',
        icon: item.icon!=='' ? item.icon : '',
        value: this.state.datas[item.id],
        tooltip: trans(this.props.messages_prefix + '.tooltip.' + item.id)
      };
      if (item.type === 'select') {
        data['label'] = item.type;
      } else if (item.type === 'file') {
        data['label'] = data['label'] + ' input-file';
      } else if (item.type === 'select_multiple') {
        data['label'] = 'select select-multiple';
      } else if (item.type === 'select_2columns') {
        data['label'] = 'select select-multiple';
      } else if (item.type === 'textarea') {
        delete data.icon;
      }
      var ret = jQuery.extend(true, {},item, data);
      if (ret.hasOwnProperty('value') === false) {
        ret.value = undefined;
      }
      datasObj[item.id] = ret;
    }.bind(this));

    return datasObj;
  }

  executeValidation(rules)
  {
    this.initializeValidatorMethod();
    var message_templates = this.returnValidationMessageTemplates();
    var messages = {};
    var messages_prefix = this.props.messages_prefix;

    if (this.props.formid === undefined) {
      console.warn('no config formid');
    }

    if (jQuery('#' + this.props.formid).size() === 0) {
      console.warn('not found form: ' + this.props.formid);
    }

    if (jQuery.isPlainObject(rules) === false) {
      console.warn('not object rules');
      return false;
    }

    if (this.props.messages_prefix === undefined) {
      console.warn('no config messages_prefix');
      return false;
    }

    Object.keys(rules).map(function(column) {
      var rule_hash = rules[column];
      var message_hash = {};
      Object.keys(rule_hash).map(function(rule) {
        var param = rule_hash[rule];
        var msg = message_templates[user_language][rule];
        msg = msg.replace(":attribute", trans(messages_prefix + '.form.' + column));
        msg = msg.replace(":max", param);
        message_hash[rule] = msg;
      });
      messages[column] = message_hash;
    });
    var validate_param = {
      rules : rules,
      messages : messages,
      errorPlacement : function(error, element) {
        error.insertAfter(element.parent());
      }
    };
    jQuery('#' + this.props.formid).validate(validate_param);
  }

  handleConfirm(e)
  {
    var ret = jQuery('#' + this.props.formid).valid();
    if (ret) {
      if (jQuery('#' + this.props.formid + '-modal').size() !== 0) {
        jQuery('#' + this.props.formid + '-modal').modal('show');
      } else {
        jQuery('#myModal').modal('show');
      }
    }
  }

  handleConfirmUpload(e)
  {
    var ret = jQuery('#' + this.props.formid).valid();
    if (ret) {
      if (jQuery('#' + this.props.formid + '-modal-upload').size() !== 0) {
        jQuery('#' + this.props.formid + '-modal-upload').modal('show');
      } else {
        jQuery('#myModalUpload').modal('show');
      }
    }
  }

  initializeValidatorMethod()
  {
    var _this = this;
    jQuery.validator.addMethod("required_if", function(value, element, param) {
      var params = param.split(',');
      var v = $(params[0], '#' + _this.props.formid).val()
      if(v !== params[1]) {
        return true;
      }
      // @see https://github.com/jzaefferer/jquery-validation/blob/master/src/core.js#L1148
      if ( element.nodeName.toLowerCase() === "select" ) {
        // could be an array for select-multiple or a string, both are fine this way
        var val = $( element ).val();
        return val && val.length > 0;
      }
      return value.length > 0;
    }, 'required_if');

    jQuery.validator.addMethod("url_if", function(value, element, param) {
      var params = param.split(',');
      var v = $(params[0], '#' + _this.props.formid).val()
      if(v !== params[1]) {
        return true;
      }
      // @see https://github.com/jzaefferer/jquery-validation/blob/master/src/core.js#L1174
      return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
    }, 'url_if');

    jQuery.validator.addMethod("regex", function(value, element, param) {
      return value.match(param);
    }, 'regex');
  }
}

Form.propTypes = {
  formid: React.PropTypes.string.isRequired,
  datas: React.PropTypes.array,
  input_type: React.PropTypes.array,
  url_api: React.PropTypes.string.isRequired,
  url_redirect: React.PropTypes.string.isRequired,
};
