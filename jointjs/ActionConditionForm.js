function trans(key)
{
  var map = {
    'messages.button.recreate-graph': 'recreate-graph',
    'messages.button.tojson': 'tojson',
    'messages.button.fromjson': 'fromjson',
    'messages.button.add-plugin': 'add-plugin',
    'messages.button.update': 'update',
    'messages.button.cancel': 'cancel',
    'messages.button.create': 'create',
  };
  return map[key];
}

class Form extends React.Component
{
  render()
  {
    return (
      <div />
    );
  }

  handleSubmit()
  {
  }

  handleCancel()
  {
  }

  handleDelete()
  {
  }

  initializeValidatorMethod()
  {
  }

  returnValidationMessageTemplates()
  {
  }

  changeInput(e)
  {
    var datas = this.state.datas;
    datas[e.target.id] = e.target.value;
    this.setState({datas: datas});
  }

  renderSection(data)
  {
    return (
      <section>
        <div className="row">
          <label className="label col col-2">
            {data.label}
          </label>
          <div className="input col col-10">
            {data.input}
          </div>
        </div>
      </section>
    );
  }

  renderInputTextarea(data)
  {
    var tmp = _.clone(data);
    tmp.input = <textarea
      type="text"
      className={data.type}
      id={data.id}
      value={data.value}
      onChange={this.changeInput.bind(this)}
    />;

    return (
      <section>
        <div className="row">
          <label className="label col col-2">
            {tmp.label}
          </label>
          <div className="textarea col col-10">
            {tmp.input}
          </div>
        </div>
      </section>
    );
  }

  renderInputText(data)
  {
    var tmp = _.clone(data);
    tmp.input = <input
      type="text"
      className="input"
      id={data.id}
      value={data.value}
      onChange={this.changeInput.bind(this)}
    />;

    return this.renderSection(tmp);
  }

  renderSelect(data, options)
  {
    var inputs = Object.keys(options).map(function(id) {
      return <option key={id} value={id}>{options[id]}</option>
    }.bind(this));
    var tmp = _.clone(data);
    tmp.input = <select
      type="text"
      className="input"
      id={data.id}
      value={data.value}
      onChange={this.changeInput.bind(this)}
    >
      {inputs}
    </select>;

    return (
      <section>
        <div className="row">
          <label className="label col col-2">
            {tmp.label}
          </label>
          <div className="select col col-10">
            {tmp.input}
          </div>
        </div>
      </section>
    );
  }

  renderInput(data)
  {
console.log(arguments[1]);
    switch (data.type) {
      case 'select':
        return this.renderSelect(data, arguments[1]);
        break;
      case 'textarea':
        return this.renderInputTextarea(data);
        break;
      default:
        return this.renderInputText(data);
        break;
    }
  }
}

class ActionConditionForm extends Form
{
  constructor(props)
  {
    super(props);
    var datas = {
      input: ""
    };
    this.graph = null;
    this.paper = null;
    this.pn = null;
    this.erd = null;
    this.pReady = null;
    this.pShape = null;
    this.pProduce = null;
    this.pRect = null;
    this.eRel = null;
    this.eEntity = null;
    this.eNormal = null;
    this.elements = {};
    this.state = {
      selectId: null,
      svgCode: null,
      datas: datas,
      commitDatas: {},
      server_error: null,
      invalids: {},
      plugin: [],
      disabled_button: false
    };
    this.setup();
  }

  setup()
  {
    var graph = new joint.dia.Graph();
    var paper = new joint.dia.Paper({
      el: jQuery('#mermaid-view'),
      width: 450,
      height: 1360,
      gridSize: 10,
      perpendicularLinks: true,
      model: graph
    });
    var pn = joint.shapes.pn;
    var erd = joint.shapes.erd;
    var pReady = new pn.Place({
      position: {x: 120, y: 50},
      attrs: {
        '.label': {text: 'ready', fill: '#7c68fc'},
        '.root' : {stroke: '#9586fd', 'stroke-width': 3},
        '.tokens > circle': {fill : '#7a7e9b'}
      },
      tokens: 0
    });
    var pShape = new joint.shapes.basic.Path({
      position: { x: 120, y: 50 },
      size: { width: 100, height: 40 },
      attrs: {
        text: { text: 'joint', 'ref-y': 0.5, 'y-alignment': 'middle' },
        path: { d: 'M 0 0 L 100 0 80 20 100 40 0 40 Z' }
      }
    });
    var pRect = new joint.shapes.basic.Rect({
      position: { x: 120, y: 50 },
      size: { width: 210, height: 40 },
      attrs: {
        text: { text: 'joint', 'ref-y': 0.5, 'y-alignment': 'middle' }
      }
    });
    var pProduce = new pn.Transition({
      position: { x: 50, y: 160 },
      attrs: {
        '.label': { text: 'produce', fill: '#fe854f' },
        '.root' : { fill: '#9586fd', stroke: '#9586fd' }
      }
    });
    var eRel = new erd.Relationship({
      position: { x: 300, y: 390 },
      size: { width: 40, height: 40 },
      attrs: {
        text: {
          fill: '#ffffff',
          text: '正常/異常',
          'letter-spacing': 0,
          style: { 'text-shadow': '1px 0 1px #333333' }
        },
        '.outer': {
          fill: '#797d9a',
          stroke: 'none',
          filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 1, color: '#333333' }}
        }
      }
    });
    var eEntity = new erd.Entity({
      position: { x: 100, y: 200 },
      size: { width: 150, height: 40 },
      attrs: {
        text: {
          fill: '#ffffff',
          text: 'Employee',
          'font-size': 10,
          'letter-spacing': 0,
          style: { 'text-shadow': '1px 0 1px #333333' }
        },
        '.outer, .inner': {
          fill: '#31d0c6',
          stroke: 'none',
          filter: { name: 'dropShadow',  args: { dx: 0.5, dy: 2, blur: 2, color: '#333333' }}
        }
      }
    });
    var eNormal = new erd.Normal({
      position: { x: 75, y: 30 },
      size: { width: 40, height: 40 },
      attrs: {
        text: {
          fill: '#ffffff',
          text: 'Name',
          'letter-spacing': 0,
          style: { 'text-shadow': '1px 0 1px #333333' }
        },
        '.outer': {
          fill: '#fe8550',
          stroke: '#fe854f',
          filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 2, color: '#222138' }}
        }
      }
    });

    paper.on('cell:pointerclick', function(cellView, evt, x, y) {
      this.selectId(cellView);
    }.bind(this));

    paper.on('cell:pointerdown', function(cellView, evt, x, y) {
      this.removeLink(cellView.model);
    }.bind(this));

    this.graph = graph;
    this.paper = paper;
    this.pn = pn;
    this.erd = erd;
    this.pReady = pReady;
    this.pShape = pShape;
    this.pProduce = pProduce;
    this.pRect = pRect;
    this.eRel = eRel;
    this.eEntity = eEntity;
    this.eNormal = eNormal;
  }

  selectId(cellView)
  {
    var id = cellView.model.prop('properties/id');
    this.setState({selectId: id});
    var element = this.graph.getCell(cellView.model.id);
    this.graph.getElements().forEach(function(e) {
      if (element.id === e.id) {
        e.attr('text/font-size', 20);
      } else {
        e.attr('text/font-size', 10);
      }
    }.bind(this));
  }

  removeLink(link)
  {
    if (link.isLink() === false) {
      return false;
    }
    var source = this.returnPluginByElementId(link.prop('source'));
    var target = this.returnPluginByElementId(link.prop('target'));
    if (_.isObject(source) === true && source.outgoing !== undefined) {
      if (_.isObject(target) === true) {
        var outgoing = [];
        source.outgoing.forEach(function(key) {
          if (target.id !== key) {
            outgoing.push(key);
          }
        }.bind(this));
        source.outgoing = outgoing;
        this.setPlugin(source);
      }
    }
    if (_.isObject(target) === true && target.incoming !== undefined) {
      if (_.isObject(source) === true) {
        var incoming = [];
        target.incoming.forEach(function(key) {
          // console.warn([source.id, key].join("="));
          if (source.id !== key) {
            incoming.push(key);
          }
        }.bind(this));
        target.incoming = incoming;
        this.setPlugin(target);
      }
    }
  }

  createLink(a, b)
  {
    return new this.pn.Link({
      source: {id: a.id, selector: '.root'},
      target: {id: b.id, selector: '.root'},
      // router: {name: 'metro'},
      attrs: {
        '.connection': {
          'fill': 'none',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          'stroke': '#e2e2e2'
        },
        text: {
          'font-size': 10
        },
        '.marker-source': {fill: '#e2e2e2'},
        '.marker-target': {fill: '#e2e2e2'},
      }
    });
  }

  createLabel(txt)
  {
    return {
      labels: [
        {
          position: -20,
          attrs: {
            text: {dy: -8, text: txt, fill: '#ffffff'},
            rect: {fill: 'none'}
          }
        }
      ]
    };
  }

  // @see http://stackoverflow.com/questions/12376870/create-an-array-of-characters-from-specified-range
  range(start, stop)
  {
    var result=[];
    for (var idx=start.charCodeAt(0),end=stop.charCodeAt(0); idx <=end; ++idx){
      result.push(String.fromCharCode(idx));
    }
    return result;
  }

  pushLink(collection, model)
  {
    for (var i = 0; i < collection.length; i++) {
      var tmp = collection[i];
      if (tmp.source === model.source) {
        if (tmp.target === model.target) {
          return false;
        }
      }
    }
    collection.push(model);
    return true;
  }

  draw()
  {
    this.graph.clear();
    var y = 30;
    var elementArray = [];
    var maxWidth = 0;
    var bbox = this.paper.getContentBBox();
    var width = this.paper.options.width;
    var height = this.paper.options.height;
    var i = 1;
    // var elements = jQuery.extend({}, this.elements);
    var elements = {};
    var structureArray = [];
    var linkArray = [];
    var start = this.eNormal.clone().attr({text: {text: 'start'}});
    var end = this.eNormal.clone().attr({text: {text: 'end'}});
    var left = 0;
    var cnt = 0;
    var input = this.state.datas.input;
    var startOutgoing = [];
    var endIncoming = [];

    // element
    input.plugins.forEach(function(plugin) {
      var task = this.eEntity.clone().attr({text: {text: plugin.id + ":" + plugin.module}});
      if (maxWidth < task.attributes.size.width) {
        maxWidth = task.attributes.size.width;
      }
      task.prop('properties', plugin);
      plugin.incoming.forEach(function(id) {
        this.pushLink(linkArray, {source: id, target: plugin.id});
        if (id === 'S_1') {
          startOutgoing.push(plugin.id);
        }
      }.bind(this));
      plugin.outgoing.forEach(function(id) {
        this.pushLink(linkArray, {source: plugin.id, target: id});
        if (id === 'E_1') {
          endIncoming.push(plugin.id);
        }
      }.bind(this));
      elementArray.push(task);
      elements[plugin.id] = task;
    }.bind(this));

    linkArray.sort(function(a, b) {
      return a.source - b.source;
    });

    // start
    (function() {
      var properties = {id: 'S_1', module: 'start', outgoing: startOutgoing};
      start.prop('properties', properties);
      elementArray.unshift(start);
      elements[properties.id] = start;
      properties.outgoing.forEach(function(id) {
        this.pushLink(linkArray, {source: properties.id, target: id});
      }.bind(this));
    }.bind(this)());

    // end
    (function() {
      var properties = {id: 'E_1', module: 'end', incoming: endIncoming};
      end.prop('properties', properties);
      elementArray.push(end);
      elements[properties.id] = end;
      properties.incoming.forEach(function(id) {
        this.pushLink(linkArray, {source: id, target: properties.id});
      }.bind(this));
    }.bind(this)());

    elementArray.push(end);

    // this.setState({elements: elements});
    this.elements = elements;

    linkArray.forEach(function(link) {
      if (structureArray.length === 0) {
        structureArray[left] = [];
        structureArray[left + 1] = [];
        structureArray[left][cnt] = link.source;
        structureArray[left + 1][cnt] = link.target;
      } else {
        if (structureArray[left] === undefined) {
          structureArray[left] = [];
        }
        if (structureArray[left + 1] === undefined) {
          structureArray[left + 1] = [];
        }
        if (structureArray[left][cnt - 1] == link.source) {
          structureArray[left][cnt] = link.source;
          structureArray[left + 1][cnt] = link.target;
        } else {
          if (jQuery.inArray(link.source, structureArray[left]) !== -1) {
            structureArray[left][cnt] = link.source;
            structureArray[left + 1][cnt] = link.target;
          } else {
            left += 1;
            if (structureArray[left] === undefined) {
              structureArray[left] = [];
            }
            if (structureArray[left + 1] === undefined) {
              structureArray[left + 1] = [];
            }
            structureArray[left][cnt] = link.source;
            structureArray[left + 1][cnt] = link.target;
          }
        }
      }
      cnt += 1;
    }.bind(this));

// console.debug(structureArray);

    var uniqueArray = [];

    for (var a = 0; a < structureArray.length; a++) {
      uniqueArray[a] = [];
      for (var b = 0; b < structureArray[a].length; b++) {
        if (structureArray[a][b] === undefined) {
          continue;
        }
        uniqueArray[a].push(structureArray[a][b]);
      }
      uniqueArray[a] = jQuery.unique(uniqueArray[a]);
    }

console.debug(structureArray);
console.debug(uniqueArray);

    // elementArray.unshift(start);
    // elementArray.push(end);

    for (var a = 0; a < uniqueArray.length; a++) {
      var subUniqueArray = uniqueArray[a];
      if (subUniqueArray.length === 1) {
        var id = subUniqueArray[0];
        var element = elements[id];
        var x = (maxWidth - element.attributes.size.width) / 2 + (width / 2);
        element.position(x, y);
        this.graph.addCell([element]);
      } else {
        var x = 50;
        if (subUniqueArray.length % 2 === 0) { // 偶数
          for (var b = 0; b < subUniqueArray.length; b++) {
            var id = subUniqueArray[b];
            var element = elements[id];
            element.position(x, y);
            x += 180;
            this.graph.addCell([element]);
            // console.log([b, id, x, y].join(":"));
          }
        } else { // 奇数
          for (var b = 0; b < subUniqueArray.length; b++) {
            var id = subUniqueArray[b];
            var element = elements[id];
            element.position(x, y);
            x += 180;
            this.graph.addCell([element]);
            // console.log([b, id, x, y].join(":"));
          }
        }
      }
      y += 100;
    }

/*
    this.paper.scaleContentToFit({
      scaleGrid: 0.9
    });
*/
/*
    this.paper.fitToContent({
      padding: 10,
      gridWidth: 0,
      gridHeight: 0,
      allowNewOrigin: "any"
    });
*/
  }

  returnIncomingItemKeys(element)
  {
    var properties = element.prop('properties');
    if (properties === undefined) {
      return properties;
    }
    var incoming = properties.incoming;
    if (incoming === undefined) {
      return incoming;
    }
    if (typeof incoming === 'string') {
      incoming = [incoming];
    }
    return incoming;
  }

  setPlugin(plugin)
  {
    var datas = this.state.datas;
    var input = datas.input;
    var plugins = [];
    var len = input.plugins.lenth;

    input.plugins.forEach(function(p) {
      if (plugin.id !== p.id) {
        plugins.push(p);
      }
    });
    if (len === plugins.length) {
      plugins.push(plugin);
    }
    input.plugins = plugins;
    datas.input = input;
    this.setState({datas: datas});
    this.initCondition();
  }

  returnPluginByElementId(id)
  {
    var element = this.graph.getCell(id);
    return this.returnPluginByElement(element);
  }

  returnPluginByElement(element)
  {
    if (_.isObject(element) === false) {
      return undefined;
    }
    var id = element.prop('properties/id');
    if (id == '') {
      return undefined;
    }
    return this.returnPluginById(id);
  }

  returnPluginById(id)
  {
    var datas = this.state.datas;
    var input = datas.input;
    var ret = undefined;
    input.plugins.forEach(function(plugin) {
      if (plugin.id === id) {
        ret = plugin;
      }
    }.bind(this));
    return ret;
  }

  returnOutgoingItemKeys(element)
  {
    if (_.isObject(element) === false) {
      return undefined;
    }
    var properties = element.prop('properties');
    if (properties === undefined) {
      return properties;
    }
    var outgoing = properties.outgoing;
    if (outgoing === undefined) {
      return outgoing;
    }
    if (typeof outgoing === 'string') {
      outgoing = [outgoing];
    }
    return outgoing;
  }

  returnElement(key)
  {
    var ret = null;
    if (key == '') {
      return null;
    }
    Object.keys(this.elements).forEach(function(id) {
      var element = this.elements[id];
      var properties = element.prop('properties');
      if (properties === undefined) {
        return true;
      }
      if (properties.id === key) {
        ret = element;
        return false;
      }
    }.bind(this));
    return ret;
  }

  returnShowDatas(id)
  {
    var url = this.state.url_api + "/" + id;
    this.getCondition(id);
  }

  returnValidationRules()
  {
    var rules = {};
    return rules;
  }

  componentDidMount()
  {
    // validation
    var rules = this.returnValidationRules();
    this.executeValidation(rules);
  }

  componentWillMount()
  {
    var user_id = "";
    this.returnShowDatas(user_id);
    this.getPlugin();
  }

  componentDidUpdate(prevProps, prevState)
  {
    if (_.isEqual(this.state.commitDatas, prevState.commitDatas) === false) {
      this.draw();
      this.reCreateLink();
    }
    if (_.isEqual(this.state.datas, prevState.datas) === false) {
      if (typeof this.state.datas.input === 'string') {
        var input;
        try {
          input = JSON.parse(this.state.datas.input);
        } catch(e) {
          // noop
        }
        this.state.datas.input = input;
      }
    }
/*
    if (_.isEqual(this.state.elements, prevState.elements) === false) {
    }
*/
  }

  reCreateLink()
  {
    // delete link
    this.graph.getElements().forEach(function(element) {
      this.graph.removeLinks(element);
    }.bind(this));

    // create link
    Object.keys(this.elements).forEach(function(id) {
      var tmp = this.elements[id];
      var element = this.graph.getCell(tmp.id);
      if (element === undefined) {
        console.warn(tmp.id + 'is not found element.');
        return true;
      }
      var properties = element.prop('properties');
      if (properties === undefined) {
        return true;
      }
      var outgoing = this.returnOutgoingItemKeys(element);
      if (outgoing === undefined) {
        outgoing = [];
      }
      var incoming = this.returnIncomingItemKeys(element);
      if (incoming === undefined) {
        incoming = [];
      }
      incoming.forEach(function(key) {
        var source = this.returnElement(key);
        if (source === null) {
          return true;
        }
/*
        var link = this.createLink(source, element);
        link.set(this.createLabel('incoming:' + properties.module));
        this.graph.addCell([link]);
*/
      }.bind(this));
      outgoing.forEach(function(key) {
        var target = this.returnElement(key);
        // console.log(target);
        if (target === null) {
          return true;
        }
/*
        if (this.isLink(element, target, element) === true) {
          return true;
        }
*/
        var link = this.createLink(element, target);
        link.set(this.createLabel('outgoing:' + properties.module));
        this.graph.addCell([link]);
      }.bind(this));
    }.bind(this));
  }

  isLink(element, source, target)
  {
    var links = this.graph.getConnectedLinks(element);
    var ret = false;
    return ret;
    links.forEach(function(link) {
      var tmpSourceId = link.get('source').id;
      var tmpTargetId = link.get('target').id;
      if (target.id === tmpTargetId) {
/*
console.log([source.id, tmpSourceId].join("\n"));
console.log(this.graph.getCell(source.id));
console.log(this.graph.getCell(tmpSourceId));
*/
        ret = true;
        return false;
      }
    }.bind(this));
console.log(ret);
    return ret;
  }

  returnConfigData(id)
  {
    var datasObj = {};
    if (id === null) {
      return datasObj;
    }
console.log(id);
console.log(this.state.datas);
    this.props.fixed_values.forEach(function(element) {

    }.bind(this));
    return datasObj;
  }

  returnDirectionData(id)
  {
    var datasObj = {
      incoming: {},
      outgoing: {},
    };
    if (id === null) {
      return datasObj;
    }
    var defaults = {};
    var key = 'incoming';
    defaults[key] = {
      id: key,
      label: 'select',
      type: 'select',
      icon: 'icon-prepend fa fa-user',
      value: this.state.datas[key],
      title: trans('messages.action.' + key),
      tooltip: trans('messages.action.tooltip.' + key)
    };
    key = 'outgoing';
    defaults[key] = {
      id: key,
      label: 'select',
      type: 'select',
      icon: 'icon-prepend fa fa-user',
      value: this.state.datas[key],
      title: trans('messages.action.' + key),
      tooltip: trans('messages.action.tooltip.' + key)
    };

    var element = this.elements[id];
    var outgoing = this.returnOutgoingItemKeys(element);
    if (outgoing === undefined) {
      outgoing = [];
    }
    var incoming = this.returnIncomingItemKeys(element);
    if (incoming === undefined) {
      incoming = [];
    }

    var i = 1;
    outgoing.forEach(function(key) {
      var data = _.clone(defaults.outgoing);
      data.id = [id, data.id, i].join('-');
      data.value = this.state.datas[data.id];
console.warn(data.id);
      datasObj.outgoing[data.id] = data;
      i += 1;
    }.bind(this));

    i = 1;
    incoming.forEach(function(key) {
      var data = _.clone(defaults.incoming);
      data.id = [id, data.id, i].join('-');
      data.value = this.state.datas[data.id];
      datasObj.incoming[data.id] = data;
      i += 1;
    }.bind(this));

    return datasObj;
  }

  returnDatasObject()
  {
    var datasObj = {};
    datasObj.input = {
      id: 'input',
      label: 'textarea',
      type: 'textarea',
      rows: 2,
      icon: 'icon-prepend fa fa-user',
      value: this.state.datas.input,
      title: trans('messages.action.input'),
      tooltip: trans('messages.action.tooltip.input')
    };
    datasObj.graph = {
      id: 'graph',
      label: 'textarea',
      type: 'textarea',
      rows: 2,
      icon: 'icon-prepend fa fa-user',
      value: this.state.datas.graph,
      title: trans('messages.action.graph'),
      tooltip: trans('messages.action.tooltip.graph')
    };
    datasObj.plugin = {
      id: 'plugin',
      label: 'select',
      type: 'select',
      icon: 'icon-prepend fa fa-user',
      value: this.state.datas.plugin,
      title: trans('messages.action.plugin'),
      tooltip: trans('messages.action.tooltip.plugin')
    };
    return datasObj;
  }

  returnSubmitDatas()
  {
    var params = {};
    return params;
  }

  handleConfirm(e)
  {
    var ret = $("#smart-form-register1").valid();
    if (ret) {
      $('#myModal').modal('show');
    }
  }

  handleUpdate(e)
  {
  }

  handleToJson(e)
  {
    var datas = this.state.datas;
    datas.graph = this.graph.toJSON();
    this.setState({datas: datas});
  }

  handleFromJson(e)
  {
    var datas = this.state.datas;
    if (typeof datas.graph === 'string') {
      this.graph.fromJSON(JSON.parse(datas.graph));
    } else {
      this.graph.fromJSON(datas.graph);
    }
// console.log(this.graph.getBBox(this.graph.getElements()));
  }

  changeSelect(e)
  {
    var id = e.target.id;
    var value = e.target.value;
    var re1 = /\-(incoming|outgoing)\-/;
    (function() {
      var datas = this.state.datas;
      datas[e.target.id] = e.target.value;
      this.setState({datas: datas});
    }.bind(this)());

    if (re1.test(id) === true) {
      var tmpArray = id.split('-');
      tmpArray[2] = parseInt(tmpArray[2]);
      var datas = this.state.datas;
      var input = datas.input;
      input.plugins.forEach(function(plugin) {
        if (plugin.id !== tmpArray[0]) {
          // console.debug('"' + plugin.id + '" = "' + tmpArray[0] + '"');
          return false;
        }
        plugin[tmpArray[1]][tmpArray[2] - 1] = value;
        return true;
      });
      datas.input = input;
      this.setState({datas: datas});
    }
  }

  render()
  {
    var datasObj = this.returnDatasObject();
    if (typeof datasObj.input.value !== "string") {
      datasObj.input.value = JSON.stringify(datasObj.input.value);
    }
    if (typeof datasObj.graph.value !== "string") {
      datasObj.graph.value = JSON.stringify(datasObj.graph.value);
    }

    return (
      <div role="content" >
        <div className="jarviswidget-editbox">
        </div>
        <div className="widget-body no-padding">
          <form id="smart-form-register1" className="smart-form">
            {this.renderRuleCondition(datasObj)}
            {this.renderGraphCondition(datasObj)}
            {this.renderAddPlugin(datasObj)}
            {this.renderEditPlugin(datasObj)}
            <footer>
              <button type="button" className="btn btn-primary btn-lg pull-right header-btn" onClick={this.handleConfirm.bind(this)} >
                <i className="fa fa-circle-arrow-up fa-lg"></i>
                {trans('messages.button.create')}
              </button>
              <button type="button" className="btn btn-default" onClick={this.handleCancel.bind(this)} >
                {trans('messages.button.cancel')}
              </button>
              <button type="button" className="btn btn-default" onClick={this.handleUpdate.bind(this)} >
                {trans('messages.button.update')}
              </button>
            </footer>
          </form>
        </div>
        {this.renderModal(datasObj)}
        {this.renderModalDel(datasObj)}
      </div>
    );
  }

  renderEditPlugin(datasObj)
  {
    var configDatas = this.returnConfigData(this.state.selectId);
    var elements = {};
    var inputs = [];
    var directionDatas = this.returnDirectionData(this.state.selectId);

    this.graph.getElements().forEach(function(element) {
      var id = element.prop('properties/id');
      elements[id] = [id, element.prop('properties/module')].join(':');
    }.bind(this));
    elements[''] = '';

    Object.keys(directionDatas.incoming).forEach(function(id) {
      inputs.push(this.renderInput(directionDatas.incoming[id], elements));
    }.bind(this));
    Object.keys(directionDatas.outgoing).forEach(function(id) {
      inputs.push(this.renderInput(directionDatas.outgoing[id], elements));
    }.bind(this));

    return (
      <fieldset>
        {inputs}
      </fieldset>
    );
  }

  renderAddPlugin(datasObj)
  {
    var plugins = {};
    this.state.plugin.forEach(function(plugin) {
      plugins[plugin.name] = plugin.name;
    }.bind(this));

    return (
      <fieldset>
        {this.renderInput(datasObj.plugin, plugins)}
        <section>
          <div className="row">
            <label className="label col col-2" />
            <div className="col col-10">
              <button type="button" className="btn btn-sm" onClick={this.handleAddPlugin.bind(this)} >
                {trans('messages.button.add-plugin')}
              </button>
            </div>
          </div>
        </section>
      </fieldset>
    );
  }

  renderRuleCondition(datasObj)
  {
    return (
      <fieldset>
        {this.renderInput(datasObj.input)}
        <section>
          <div className="row">
            <label className="label col col-2" />
            <div className="col col-10">
              <button type="button" className="btn btn-sm" onClick={this.handleReCreateGraph.bind(this)} >
                {trans('messages.button.recreate-graph')}
              </button>
            </div>
          </div>
        </section>
      </fieldset>
    );
  }

  renderGraphCondition(datasObj)
  {
    return (
      <fieldset>
        {this.renderInput(datasObj.graph)}
        <section>
          <div className="row">
            <label className="label col col-2" />
            <div className="col col-10">
              <button type="button" className="btn btn-sm" onClick={this.handleToJson.bind(this)} >
                {trans('messages.button.tojson')}
              </button>
              <i> </i>
              <button type="button" className="btn btn-sm" onClick={this.handleFromJson.bind(this)} >
                {trans('messages.button.fromjson')}
              </button>
            </div>
          </div>
        </section>
      </fieldset>
    );
  }

  renderModal(datasObj)
  {
    return (
      <div className="modal fade" id="myModal" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                &times;
              </button>
              <h4 className="modal-title">
                {trans('messages.action.title-confirm-popup')}
              </h4>
            </div>
            <div className="modal-body no-padding">
              <form id="check-form" className="smart-form">
                <fieldset>
                </fieldset>
                <footer>
                  <button type="button" className="btn btn-primary" onClick={this.handleSubmit.bind(this)} disabled={this.state.disabled_button} >
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
    )
  }

  renderModalDel(datasObj)
  {
    return (
      <div className="modal fade" id="myModalDel" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                &times;
              </button>
              <h4 className="modal-title">
               {trans('messages.action.title-confirm-popup')}
              </h4>
            </div>
            <div className="modal-body no-padding">
              <form id="check-form" className="smart-form">
                <fieldset>
                  {trans('messages.action.remind-delete')}
                </fieldset>
                <footer>
                  <button type="button" className="btn btn-danger" onClick={this.handleDelete.bind(this)} disabled={this.state.disabled_button} >
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
    )
  }

  executeValidation(rules)
  {
    this.initializeValidatorMethod();
    var message_templates = this.returnValidationMessageTemplates();
    var messages = {};
    Object.keys(rules).map(function(column) {
      var rule_hash = rules[column];
      var message_hash = {};
      Object.keys(rule_hash).map(function(rule) {
        var param = rule_hash[rule];
        var msg = message_templates[user_language][rule];
        msg = msg.replace(":attribute", trans('messages.action.' + column));
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
    $("#smart-form-register1").validate(validate_param);
  }

  getCondition(id)
  {
    var params = {};
    var request;
    params.id = id;

    request = jQuery.ajax({
      url: this.props.url_api_condition,
      dataType: 'json',
      type: 'GET',
      cache: false,
      data: params
    })
    .done(function(data) {
      this.setState({datas: data});
      this.initCondition();
      this.copyDatas();
    }.bind(this))
    .fail(function(xhr, status, err) {
    }.bind(this))
    .always(function(xhr, status) {
    }.bind(this))
    ;
  }

  initCondition()
  {
    var datas = jQuery.extend(true, {}, this.state.datas);
    var re1 = /\-(incoming|outgoing)\-/;
    Object.keys(datas).forEach(function(key) {
      if (re1.test(key) === true) {
        delete datas[key];
      }
    }.bind(this));
    var input = datas.input;
    input.plugins.forEach(function(plugin) {
      var id = plugin.id;

      // incoming, outgoing
      var incoming = [];
      var outgoing = [];
      var i = 1;
      if (typeof plugin.incoming === 'string') {
        incoming = [plugin.incoming];
      } else if (plugin.incoming === undefined) {
        incoming = incoming;
      } else {
        incoming = plugin.incoming;
      }
      if (typeof plugin.outgoing === 'string') {
        outgoing = [plugin.outgoing];
      } else if (plugin.outgoing === undefined) {
        outgoing = outgoing;
      } else {
        outgoing = plugin.outgoing;
      }
      plugin.incoming = incoming;
      plugin.outgoing = outgoing;
      i = 1;
      incoming.forEach(function(key) {
        var tmpId = [id, 'incoming', i].join('-');
        datas[tmpId] = key;
        i += 1;
      });
      i = 1;
      outgoing.forEach(function(key) {
        var tmpId = [id, 'outgoing', i].join('-');
        datas[tmpId] = key;
        i += 1;
      });
    });
    this.setState({datas: datas});
  }

  handleAddPlugin(e)
  {
    var datas = jQuery.extend(true, {}, this.state.datas);
    var input = datas.input;
    var data = {
      module: datas.plugin,
      id: _.uniqueId('T_'),
      config: null,
      incoming: ['S_1'],
      outgoing: ['E_1'],
    };
    input.plugins.unshift(data);
    datas.input = input;
    this.setState({datas: datas});
    this.handleReCreateGraph(new Event('click'));
  }

  setSelect(key)
  {
    var datas = jQuery.extend({}, this.state.datas);
    if (
      jQuery('#' + key + ' option').size() === 1 ||
      jQuery('#' + key + ' option[value="' + datas[key] + '"]').size() === 0
    ) {
      datas[key] = jQuery('#' + key + ' option:first').val();
    }
    this.setState({datas: datas});
  }

  getPlugin()
  {
    var params = {};
    var key = 'plugin';
    var api = 'url_api_' + key;

    jQuery.ajax({
      url: this.props[api],
      dataType: 'json',
      type: 'GET',
      cache: false,
      data: params
    })
    .done(function(data) {
      var state = {};
      state[key] = data;
      this.setState(state);
      this.setSelect(key);
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

  copyDatas()
  {
    var datas = jQuery.extend(true, {}, this.state.datas);
    this.setState({commitDatas: datas});
  }

  handleReCreateGraph(e)
  {
    this.copyDatas();
  }
}

ActionConditionForm.defaultProps = {
  url_api_plugin: "/orion/api/v1/action/plugin",
  url_api_condition: "/orion/api/v1/action/condition2",
  url_api: "/orion/api/v1/action",
  url_redirect: "/orion/action",
  fixed_values: [
    {id: 'incoming', type: 'select'},
    {id: 'outgoing', type: 'select'},
  ]
};

var actionConditionForm = ReactDOM.render(
    <ActionConditionForm />,
    document.getElementById('action-form')
);