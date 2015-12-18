class Form extends AbstractBase
{
    constructor(props) {
        super(props);
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

    returnDatasObject() {
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

    returnShowDatas(id) {
        var url_api = this.props.url_api;
        if (Boolean(this.state.url_api) !== false) {
          url_api = this.state.url_api;
        }
        var url = url_api + "/" + id;

        $.ajax({
            url: url,
            dataType: 'json',
            type: 'GET',
            cache: false,
            success: function(data) {
                this.setState({datas:data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
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
                $('#myModal').modal('hide');
                location.href = url_redirect;
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
                $('#myModal').modal('hide');
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
                this.setState({disabled_button: false});
            }.bind(this)
        });
    }

    handleUpdate(e) {
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
                $('#myModal').modal('hide');
                location.href = url_redirect;
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
                $('#myModal').modal('hide');
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
        //params['_token'] = ('undefined' !== typeof this.state.datas['_token']) ? this.state.datas['_token'] : $("#csrf-token").attr('value');

        $.ajax({
            url: url,
            headers: {'X-XSRF-TOKEN': token},
            dataType: 'json',
            type: 'DELETE',
            data: params,
            success: function(data) {
                $('#myModalDel').modal('hide');
                location.href = url_redirect;
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
                $('#myModalDel').modal('hide');
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
                this.setState({disabled_button: false});
            }.bind(this)
        });
    }

    changeText(e) {
        var datas = jQuery.extend({}, this.state.datas);
        datas[e.target.id] = e.target.value;
        this.setState({datas: datas});
    }

    changeSelect(e) {
        var datas = jQuery.extend({}, this.state.datas);
        datas[e.target.id] = e.target.value;
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

    renderTextInput(datas, disabled='') {
        var func = this.changeText.bind(this);
        if (jQuery.isFunction(datas.onChange) === true) {
          func = datas.onChange;
        }
        datas['input'] = <input type="text" id={datas.id} name={datas.id} placeholder={datas.title} value={datas.value} disabled={disabled} onChange={func} />;
        return this.renderIconField(datas.id, datas.label, datas.icon, datas.title, datas.tooltip, datas.input)
    }

    renderTextareaInput(datas, disabled='')
    {
        var rows = 5;
        var cols = 40;
        if (datas.hasOwnProperty('rows') === true) {
          rows = datas.rows;
        }
        if (datas.hasOwnProperty('cols') === true) {
          cols = datas.cols;
        }
        datas['input'] = <label className="textarea textarea-resizable">
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
        return this.renderIconField(datas.id, datas.label, datas.icon, datas.title, datas.tooltip, datas.input)
    }

    renderRadioInput(datas, values, disabled='') {
        var self = this;
        var options = values.map(function(name, value){
        var checked = (value == datas.value) ? true : false;
            return (
              <label key={value} className="radio">
              <input type="radio" id={datas.id} name={datas.id} value={value} checked={checked} onChange={self.changeRadio.bind(self)} /><i></i>{name}</label>
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

    renderSelectValue(id, label, title, values) {
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

    renderPasswordInput(datas, disabled='') {
        if ('' === datas.value) {
          datas['input'] = <input type="password" id={datas.id} name={datas.id} placeholder={datas.title} disabled={disabled} onChange={this.changeText.bind(this)} />;
        } else {
          datas['input'] = <input type="password" id={datas.id} name={datas.id} placeholder={datas.title} value={datas.value} disabled={disabled} onChange={this.changeText.bind(this)} />;
        }
        return this.renderIconField(datas.id, datas.label, datas.icon, datas.title, datas.tooltip, datas.input)
    }

    // 古いメソッド。renderSelectFieldへ乗り換えて！
    renderSelect(id, label, title, values) {
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

    renderSelectField(datas, values, disabled='') {
        var options = Object.keys(values).map(function(name, value){
            return <option key={name} value={name} >{values[name]}</option>
        });
        var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
        return (
          <section>
            <div className="row">
              <label className="label col col-2">{datas.title}</label>
              <div className="col col-10">
                <label className={label}>
                  <select id={datas.id} name={datas.id} ref={datas.id} value={datas.value} onChange={this.changeSelect.bind(this)}>
                    {options}
                  </select>
                  <i></i>
                  <em className="invalids">{this.state.invalids[datas.id]}</em>
                </label>
              </div>
            </div>
          </section>
        )
    }

    renderSelectMultipleField(datas, values, disabled='') {
        var options = Object.keys(values).map(function(name, value){
            return <option key={name} value={name} >{values[name]}</option>
        });
        var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
        return (
          <section>
            <div className="row">
              <label className="label col col-2">{datas.title}</label>
              <div className="col col-10">
                <label className={label}>
                  <select multiple={true} id={datas.id} name={datas.id} ref={datas.id} value={datas.value} onChange={this.changeSelectMultiple.bind(this)}>
                    {options}
                  </select>
                  <i></i>
                  <em className="invalids">{this.state.invalids[datas.id]}</em>
                </label>
              </div>
            </div>
          </section>
        )
    }

    renderFileInput(datas, options, disabled='')
    {
      var self = this;
      var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');

      return (
        <section>
          <div className="row">
            <label className="label col col-2">
              {datas.title}
            </label>
            <div className="col col-10">
              <div className={label}>
                <input type="text" placeholder={datas.tooltip} readOnly="readonly" />
                <span className="button">
                  <input id={datas.id} type="file" name={datas.id} onChange={self.changeFile.bind(self)} />
                  Browse
                </span>
                <i></i>
                <em className="invalids">{this.state.invalids[datas.id]}</em>
              </div>
            </div>
          </div>
        </section>
      );
    }

    renderDatePickerInput(datas, timer, disabled='')
    {
      var self = this;
      var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
      var timeinput = jQuery.isPlainObject(timer) === true ? this.renderTimePickerInput(timer) : null;
      return (
        <section>
          <div className="row">
            <label className="label col col-2">
              {datas.title}
            </label>
            <div className="col col-5">
              <label className={label}>
                  <input id={datas.id} type="text" name={datas.id} placeholder={datas.tooltip} className="form-control" data-dateformat="yyyy-mm-dd" value={datas.value} />
              {timeinput}
                <i></i>
                <em className="invalids">{this.state.invalids[datas.id]}</em>
              </label>
            </div>
          </div>
        </section>
      );
    }

    renderTimePickerInput(datas, disabled='')
    {
      var self = this;
      var label = datas.label + " " + (this.state.invalids[datas.id] ? 'state-error' : '');
      return (
        <label className={label}>
          <input id={datas.id} type="text" name={datas.id} placeholder={datas.tooltip} className="form-control" value={datas.value} />
        </label>
      );
    }

    renderLabelForDatePickerInput(datas, timer) {
      var timeinput = jQuery.isPlainObject(timer) === true ? this.renderLabelForTimePickerInput(timer) : null;
        return (
          <section>
            <div className="row">
              <label className="label col col-2">{datas.title}</label>
              <label className="label col col-10">{datas.value} {timeinput}</label>
            </div>
          </section>
        )
    }

    renderLabelForTimePickerInput(timer) {
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

      switch(type) {
        case "textarea":
          result = this.renderTextareaInput(datas, arguments[1]);
          break;
        case "radio":
          result = this.renderRadioInput(datas, arguments[1], arguments[2]);
          break;
        case "select":
          result = this.renderSelectField(datas, arguments[1], arguments[2]);
          break;
        case "select_multiple":
          result = this.renderSelectMultipleField(datas, arguments[1], arguments[2]);
          break;
        case "date":
          result = this.renderDatePickerInput(datas, arguments[1], arguments[2]);
          break;
        case "datetime":
          result = this.renderDatePickerInput(datas, arguments[1], arguments[2]);
          break;
        case "password":
          result = this.renderPasswordInput(datas, arguments[2]);
          break;
        case "file":
          result = this.renderFileInput(datas, arguments[1]);
          break;
        default:
          result = this.renderTextInput(datas, arguments[1]);
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

      switch(type) {
        case "textarea":
          result = this.renderLabelForTextareaInput(datas);
          break;
        case "radio":
          result = this.renderLabelForRadioInput(datas);
          break;
        case "select":
          result = this.renderLabelForSelect(datas);
          break;
        case "select_multiple":
          result = this.renderLabelForSelectMultiple(datas);
          break;
        case "date":
          result = this.renderLabelForDatePickerInput(datas);
          break;
        case "datetime":
          result = this.renderLabelForDatePickerInput(datas, arguments[1]);
          break;
        case "password":
          result = this.renderLabelForPasswordInput(datas);
          break;
        case "file":
          result = this.renderLabelForFileInput(datas);
          break;
        default:
          result = this.renderLabelForTextInput(datas);
          break;
      }

      return result;
    }

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

    renderLabelForTextInput(datas) {
        return (
          <section>
            <div className="row">
              <label className="label col col-2">{datas.title}</label>
              <label className="label col col-10">{datas.value}</label>
            </div>
          </section>
        )
    }

    renderLabelForTextareaInput(datas)
    {
        return (
          <section>
            <div className="row">
              <label className="label col col-2">{datas.title}</label>
              <label className="label col col-10">
                <label className="textarea textarea-resizable">
                  <textarea rows="3"
                    className="custom-scroll"
                    disabled="disabled"
                    value={datas.value}
                  >
                  </textarea>
                </label>
              </label>
            </div>
          </section>
        );
    }

    renderLabelForFileInput(datas) {
        var element = document.getElementById(datas.id);
        var val;

        if (element) {
            val = document.getElementById(datas.id).parentNode.nextSibling.value;
        }

        return (
          <section>
            <div className="row">
              <label className="label col col-2">{datas.title}</label>
              <label className="label col col-10">{val}</label>
            </div>
          </section>
        )
    }

    renderLabelForPasswordInput(datas) {
        var dummy_val = '';
        if ('' !== datas.value && undefined !== datas.value) { dummy_val = '********'; }
        return (
          <section>
            <div className="row">
              <label className="label col col-2">{datas.title}</label>
              <label className="label col col-10">{dummy_val}</label>
            </div>
          </section>
        )
    }

    renderLabelForSelect(datas) {
        var value =  $('#' + datas.id + ' option:selected').text();

        return (
          <section>
            <div className="row">
              <label className="label col col-2">{datas.title}</label>
              <label className="label col col-10">{value}</label>
            </div>
          </section>
        )
    }

    renderLabelForRadioInput(datas) {
        var value = $("input[name='" + datas.id + "']:checked").parent().text();
        return (
          <section>
            <div className="row">
              <label className="label col col-2">{datas.title}</label>
              <label className="label col col-10">{value}</label>
            </div>
          </section>
        )
    }

    render() {
        return false;
    }

    renderModal(datasObj) {
    }

    executeValidation(rules) {
        this.initializeValidatorMethod();
        var message_templates = this.returnValidationMessageTemplates();
        var messages = {};
        Object.keys(rules).map(function(column) {
            var rule_hash = rules[column];
            var message_hash = {};
            Object.keys(rule_hash).map(function(rule) {
                var param = rule_hash[rule];
                var msg = message_templates[user_language][rule];
                msg = msg.replace(":attribute", trans('messages.core-user.' + column));
                msg = msg.replace(":max", param);
                message_hash[rule] = msg;
            });
            messages[column] = message_hash;
        });
        var validate_param = {
            // Rules for form validation
            rules : rules,

            // Messages for form validation
            messages : messages,

            // Do not change code below
            errorPlacement : function(error, element) {
                error.insertAfter(element.parent());
            }
        };

        $("#smart-form-register").validate(validate_param);
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
            },
            'en' : {
                required : "The :attribute field is required.",
                maxlength : "The :attribute may not be greater than :max characters.",
                required_if : "The :attribute field is required.",
                url_if : "The :attribute format is invalid.",
                regex : "The :attribute format is invalid.",
                email : "The :attribute format is invalid.",
                equalTo : "Please enter the same value again.",
            },
        };
        return message_templates;
    }

  returnDatasObject()
  {
    var datasObj = {};

    this.props.input_type.forEach(function(item) {
      var data = {
        id: item.id,
        type: item.type,
        title: trans(this.props.messages_prefix + '.form.' + item.id),
        label: 'input',
        icon: 'icon-prepend fa fa-user',
        value: this.state.datas[item.id],
        tooltip: trans(this.props.messages_prefix + '.tooltip.' + item.id)
      };
      if (item.type === 'select') {
        data['label'] = item.type;
      } else if (item.type === 'file') {
        data['label'] = data['label'] + ' input-file';
      } else if (item.type === 'select_multiple') {
        data['label'] = 'select select-multiple';
      } else if (item.type === 'textarea') {
        delete data.icon;
      }

      var ret = jQuery.extend(item, data);
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

    initializeValidatorMethod() {
        jQuery.validator.addMethod("required_if", function(value, element, param) {
            var params = param.split(',');
            var v = $(params[0], '#smart-form-register').val()
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
            var v = $(params[0], '#smart-form-register').val()
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
    datas: React.PropTypes.array,
    url_api: React.PropTypes.string.isRequired,
    url_redirect: React.PropTypes.string.isRequired,
};
