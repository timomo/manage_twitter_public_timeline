class ActionConditionFormEdit extends ActionConditionForm
{
  returnShowDatas(id)
  {
    var params = {};
    var api = 'url_api';

    jQuery.ajax({
      url: this.props[api],
      dataType: 'json',
      type: 'GET',
      cache: false,
      data: params
    })
    .done(function(data) {

      var tmp = this.reconstructionData(data);
console.log(tmp);
      var ret = {};
      ret.datas = {};
      ret.datas.input = tmp;
      ret.data = data;
      this.setState(ret);
      this.initCondition();
      this.copyDatas();

    }.bind(this))
    .fail(function(xhr, status, err) {
      var state = {};
      state[key] = [];
      this.setState(state);
      console.error(status, err.toString());
    }.bind(this))
    .always(function(xhr, status) {
    }.bind(this));
  }
}
