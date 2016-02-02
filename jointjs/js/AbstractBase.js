class AbstractBase extends React.Component
{
    // @see https://github.com/js-cookie/js-cookie/blob/master/src/js.cookie.js
    returnCookieXSRFToken()
    {
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

    getParameters()
    {
        var arg = new Object;
        var pair = location.search.substring(1).split('&');
        for(var i=0; pair[i]; i++) {
            var kv = pair[i].split('=');
            arg[kv[0]] = kv[1];
        }
        return arg;
    }

    render()
    {

    }

  returnPluginUrl()
  {
    var url = location.href.replace(base_path, '');
    url = url.replace(/\?.*/, '');
    url = url.replace(/\#.*/, '');
    var tmp = url.split('/');
    return tmp[1];
  }

  returnExcludePattern()
  {
    return [
      /^(get|edit)_profile$/,
      /^get_home$/,
    ];
  }

  canGet()
  {
    var plugin = this.returnPluginUrl();
    var key = 'get_' + plugin;
    return this.canAction(key);
  }

  canAdd()
  {
    var plugin = this.returnPluginUrl();
    var key = 'add_' + plugin;
    return this.canAction(key);
  }

  canEdit()
  {
    var plugin = this.returnPluginUrl();
    var key = 'edit_' + plugin;
    return this.canAction(key);
  }

  canDelete()
  {
    var plugin = this.returnPluginUrl();
    var key = 'del_' + plugin;
    return this.canAction(key);
  }

  canImport()
  {
    var plugin = this.returnPluginUrl();
    var key = 'add_' + plugin;
    if(this.canAction(key) === true) {
      return true;
    }
    key = 'edit_' + plugin;
    if(this.canAction(key) === true) {
      return true;
    }
    return false;
  }

  canExport()
  {
    var plugin = this.returnPluginUrl();
    var key = 'csv_' + plugin;
    return this.canAction(key);
  }

  /**
   * 互換性の維持の為、元のメソッドを残してあります
   */
  canCreate()
  {
    console.warn('canCreate is departed. please call function canAdd.');
    return this.canAdd();
  }

  canDestroy()
  {
    console.warn('canDestroy is departed. please call function canDelete.');
    return this.canDelete();
  }

  canAction(action)
  {
    var patterns = this.returnExcludePattern();
    var ret = false;
    // ホーム全般は許可
    patterns.forEach(function(pattern) {
      switch (jQuery.type(pattern)) {
        case 'regexp':
          if (action.match(pattern) !== null) {
            ret = true;
            return true;
          }
          break;
        case 'string':
          if (action === pattern) {
            ret = true;
            return true;
          }
          break;
        default:
          return false;
      }
    }.bind(this));
    if (ret === true) {
      return ret;
    }
    var json = JSON.parse(matched_actions.replace(/&quot;/g, '"'));
    if (json.hasOwnProperty(action) === true) {
      ret = json[action] === 1 ? true : false;
    }
    return ret;
  }

  // @see http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
  getName()
  {
    var funcNameRegex = /function (.{1,})\(/;
    var results = (funcNameRegex).exec((this).constructor.toString());
    if (results && results.length > 1) {
      var tmp = results[1].split('(');
      return tmp[0];
    }
    return "";
  }

  // @see https://github.com/jashkenas/underscore/blob/master/underscore.js#L690-L707
  range(start, stop, step)
  {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  }
}
