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

    canCreate() {
        return this.canAction('create');
    }

    canEdit() {
        return this.canAction('edit');
    }

    canDestroy() {
        return this.canAction('destroy');
    }
 
    canAction(action) {
        var json = JSON.parse(matched_actions.replace(/&quot;/g, '"'));
        var ret = false;
        json.forEach(function(val, index) {
            if (val === action) {
                ret = true;
            }
        });
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
}
