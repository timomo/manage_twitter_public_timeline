class ActionConditionForm extends Form
{
  constructor(props)
  {
    super(props);
    var datas = {
      input: {plugins: []},
      plugin: 0
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
    this.eIsa = null;
    this.elements = {};
    this.state = {
      selectId: null,
      data: {},
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
      width: 610,
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
      size: { width: 100, height: 40 },
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
          'font-size': 10,
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
    var eIsa = new erd.ISA({
      position: { x: 125, y: 300 },
      size: { width: 60, height: 40 },
      attrs: {
        text: {
          text: 'ISA',
          'font-size': 10,
          fill: '#ffffff',
          'letter-spacing': 0,
          style: { 'text-shadow': '1px 0 1px #333333' }
        },
        polygon: {
          fill: '#fdb664',
          stroke: 'none',
          filter: { name: 'dropShadow',  args: { dx: 0, dy: 2, blur: 1, color: '#333333' }}
        }
      }
    });

    paper.on('cell:pointerclick', function(cellView, evt, x, y) {
      this.selectId(cellView);
    }.bind(this));

    paper.on('cell:pointerdown', function(cellView, evt, x, y) {
      this.removeLink(cellView.model, 'both');
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
    this.eIsa = eIsa;
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

  changeLink(link)
  {
    if (link.isLink() === false) {
      return false;
    }

    var sourceId = link.prop('source/id');
    var targetId = link.prop('target/id');
    var source = this.returnPluginByElementId(sourceId);
    var target = this.returnPluginByElementId(targetId);

    if (
      _.isObject(source) === true &&
      _.isObject(target) === true
    ) {
      if (jQuery.inArray(target.id, source.outgoing) === -1) {
        source.outgoing.push(target.id);
      }
      this.setPlugin(source);
      if (jQuery.inArray(source.id, target.incoming) === -1) {
        target.incoming.push(source.id);
      }
      this.setPlugin(target);
    }
  }

  removeLink(link, mode)
  {
    if (link.isLink() === false) {
      return false;
    }

    var sourceId = link.prop('source/id');
    var targetId = link.prop('target/id');
    var source = this.returnPluginByElementId(sourceId);
    var target = this.returnPluginByElementId(targetId);

    if (mode === 'source' || mode === 'both') {
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
    }
    if (mode === 'target' || mode === 'both') {
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
  }

  createLink(a, b)
  {
    var target;
    var source;
    if (_.isObject(b) === true && b.hasOwnProperty('id') === true) {
      target = {id: b.id, selector: '.root'};
    } else if (_.isObject(b) === true) {
      target = jQuery.extend(true, {}, b, {selector: '.root'});
    } else {
      target = {x: 50, y: 50, selector: '.root'};
    }
    if (_.isObject(a) === true && a.hasOwnProperty('id') === true) {
      source = {id: a.id, selector: '.root'};
    } else {
      source = {x: 5, y: 5, selector: '.root'};
    }

    var link = new this.pn.Link({
      source: source,
      target: target,
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

    link.on('change:target', function() {
      this.changeLink(link);
    }.bind(this));
    link.on('change:source', function() {
      this.changeLink(link);
    }.bind(this));

    return link;
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
    if (model.source === 'S_1') {
console.log(model);
      collection.unshift(model);
    } else {
      collection.push(model);
    }
    return true;
  }

  draw()
  {
    this.graph.clear();
    var y = 30;
    var elementArray = [];
    var maxWidth = 0;
    var width = this.paper.options.width;
    var height = this.paper.options.height;
    // var elements = jQuery.extend({}, this.elements);
    var elements = {};
    var structureArray = [];
    var linkArray = [];
    var startOutgoing = [];
    var endIncoming = [];
    var tmpArray = [];
    var tmpHash = {};
    var runCnt = 0;
    var uniqueArray = [];

    // element
    this.state.datas.input.plugins.forEach(function(plugin) {
      var task = null;
      switch(plugin.type) {
        case 'start':
        case 'end':
          task = this.eNormal.clone().attr({text: {text: plugin.id + ":" + plugin.module}});
          break;
        case 'loop_start':
          // task = this.eIsa.clone().rotate(180).attr({text: {text: plugin.id + ":" + plugin.module}});
          // break;
        case 'loop_end':
          task = this.eIsa.clone().attr({text: {text: plugin.id + ":" + plugin.module}});
          break;
        default:
          task = this.eEntity.clone().attr({text: {text: plugin.id + ":" + plugin.module}});
          break;
      }
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

      task.position(50, y);

      this.graph.addCell([task]);

      y += 100;
    }.bind(this));

    y = 30;

    linkArray.sort(function(a, b) {
      if (a.source === 'S_1' || b.source === 'S_1') {
        return -1;
      }
      if (a.source === 'E_1' || b.source === 'E_1') {
        return 1;
      }
      if (a.source < b.source) {
        return -1;
      }
      if (a.source > b.source) {
        return 1;
      }
      return 0;
    }.bind(this));

    this.elements = elements;

    linkArray.forEach(function(link) {
      if (structureArray.length === 0) {
        structureArray[0] = [];
        structureArray[1] = [];
        structureArray[0][0] = link.source;
        structureArray[1][0] = link.target;
        tmpArray.push(link);
        return true;
      }
      var hit = 0;
      for (var x = 0; x < structureArray.length; x++) {
        if (structureArray[x] === undefined) {
          structureArray[x] = [];
        }
        if (this.checkDuplicateEntry(link, tmpArray) === true) {
          console.log(['here0', link.source, link.target].join(":"));
          continue;
        }
        var y = jQuery.inArray(link.source, structureArray[x]);
        if (y !== -1) {
          structureArray[x].push(link.source);
          if (structureArray[x + 1] === undefined) {
            structureArray[x + 1] = [];
          }
          structureArray[x + 1].push(link.target);
          hit += 1;
        } else {
          continue;
        }
      }
      if (hit === 0) {
        if (structureArray[x] === undefined) {
          structureArray[x] = [];
          structureArray[x + 1] = [];
        }
        structureArray[x].push(link.source);
        structureArray[x + 1].push(link.target);
        tmpArray.push(link);
      }
    }.bind(this));

    // uniq処理
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

    // 重複を消す
    tmpArray = [];
    tmpHash = {};
    for (var a = uniqueArray.length - 1; a > -1; a--) {
      for (var b = uniqueArray[a].length - 1; b > -1; b--) {
        if (uniqueArray[a][b] in tmpHash === true) {
          continue;
        }
        if (tmpArray[a] === undefined) {
          tmpArray[a] = [];
        }
        tmpHash[uniqueArray[a][b]] = true;
        tmpArray[a].push(uniqueArray[a][b]);
      }
    }
    // 空行を消す
    var i = 0;
    uniqueArray = [];
    for (var a = 0; a < tmpArray.length; a++) {
      if (tmpArray[a].length !== 0) {
        uniqueArray[i] = tmpArray[a];
        i++;
      }
    }

    // console.log(structureArray);
    console.log(uniqueArray);

    for (var a = 0; a < uniqueArray.length; a++) {
      var subUniqueArray = uniqueArray[a];
      if (subUniqueArray.length === 1) {
        var id = subUniqueArray[0];
        var element = elements[id];
        var x = (maxWidth - element.attributes.size.width) / 2 + (width / 4);
        element.position(x, y);
        // this.graph.addCell([element]);
      } else {
        var x = 50;
        if (subUniqueArray.length % 2 === 0) { // 偶数
          for (var b = 0; b < subUniqueArray.length; b++) {
            var id = subUniqueArray[b];
            var element = elements[id];
            element.position(x, y);
            x += 180;
            // this.graph.addCell([element]);
          }
        } else { // 奇数
          for (var b = 0; b < subUniqueArray.length; b++) {
            var id = subUniqueArray[b];
            var element = elements[id];
            element.position(x, y);
            x += 180;
            // this.graph.addCell([element]);
          }
        }
      }
      y += 100;
    }

    // startとendだけ別呼び出し
    /*
    (function() {
      if (uniqueArray.length > 0) {
        var element;
        if (uniqueArray[uniqueArray.length - 1].length !== 1 || uniqueArray[uniqueArray.length - 1][0] !== 'E_1') {
          element = this.returnElementByPluginId('E_1');
          var a = (maxWidth - element.attributes.size.width) / 2 + (width / 4);
          element.position(a, y);
        }
        if (uniqueArray[0].length !== 1 || uniqueArray[0][0] !== 'S_1') {
          element = this.returnElementByPluginId('S_1');
          var a = (maxWidth - element.attributes.size.width) / 2 + (width / 4);
          element.position(a, 30);
        }
      }
    }.bind(this)());
    */
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

  checkDuplicateEntry(check, master)
  {
    var hit = 0;
    master.forEach(function(cmp) {
      if (
        check.source === cmp.source &&
        check.target === cmp.target
      ) {
        hit++;
        return false;
      } else {
        return true;
      }
    });
    if (hit === 0) {
      return false;
    }
    return true;
  }

  returnIncomingItemKeys(element)
  {
    if (_.isObject(element) === false) {
      return undefined;
    }
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
    var hit = 0;

    input.plugins.forEach(function(p) {
      if (plugin.id !== p.id) {
        plugins.push(p);
      } else {
        hit += 1;
        plugins.push(plugin);
      }
    });
    if (hit === 0) {
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

  returnElementByPluginId(id)
  {
    var hit = undefined;
    this.graph.getElements().forEach(function(element) {
      var cmpId = element.prop('properties/id');
      if (id === cmpId) {
        hit = element;
      }
    }.bind(this));
    return hit;
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
    var data = {};
    var tmp = this.reconstructionData(data);
    var ret = {};
    ret.datas = {};
    ret.datas.input = tmp;
    ret.data = data;
    this.setState(ret);
    this.initCondition();
    this.copyDatas();
  }

  reconstructionData(datas)
  {
    var defaults = {};
    defaults.plugins = [];
    if (datas.flows === undefined) {
      return defaults;
    }
    var map = {};
    datas.flows.forEach(function(flow) {
      map[flow.orderby] = flow.action_sub_id;
    }.bind(this));

    datas.flows.forEach(function(flow) {
      var tmp = {};
      var orderby = flow.orderby;
      tmp.id = flow.action_sub_id;
      tmp.module = flow.plugin[0].plugin_name;
      tmp.config = flow.input;
      tmp.orderby = flow.orderby;
      tmp.incoming = [];
      tmp.outgoing = [];

      var outgoing1 = map[orderby + 10];
      var outgoing2 = map[orderby + 11];

      if (outgoing1 !== undefined) {
        tmp.outgoing.push(outgoing1);
      }
      if (outgoing2 !== undefined) {
        tmp.outgoing.push(outgoing2);
      }

      defaults.plugins.push(tmp);
    }.bind(this));
    return defaults;
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
    this.getPlugin();
    this.returnShowDatas(user_id);
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
        if (this.isLink(element, source) === true) {
          return true;
        }
        var link = this.createLink(source, element);
        link.set(this.createLabel('incoming:' + properties.module));
        this.graph.addCell([link]);
      }.bind(this));
      outgoing.forEach(function(key) {
        var target = this.returnElement(key);
        if (target === null) {
          return true;
        }
        if (this.isLink(target, element) === true) {
          return true;
        }
        var link = this.createLink(element, target);
        link.set(this.createLabel('outgoing:' + properties.module));
        this.graph.addCell([link]);
      }.bind(this));
    }.bind(this));
  }

  isLink(source, target)
  {
    var links = this.graph.getConnectedLinks(source);
    var ret = false;
    links.forEach(function(link) {
      var tmpSourceId = link.prop('source/id');
      var tmpTargetId = link.prop('target/id');
      if (target.id === tmpTargetId) {
        ret = true;
      }
      if (target.id === tmpSourceId) {
        ret = true;
      }
    }.bind(this));
    return ret;
  }

  returnConfigData(id)
  {
    var datasObj = {};
    if (id === null) {
      return datasObj;
    }
    var plugin = this.returnPluginById(id);
    Object.keys(plugin.config).forEach(function(key) {
      datasObj[key] = {
        id: id + '_' + key,
        label: 'input',
        type: 'input',
        icon: 'icon-prepend fa fa-user',
        value: plugin.config[key],
        title: key,
        tooltip: key
      };
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

    if (_.isObject(element) === false) {
      console.warn('element not found.' + id);
      return datasObj;
    }

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
    var key = 'input';
    datasObj[key] = {
      id: key,
      label: 'textarea',
      type: 'textarea',
      rows: 2,
      icon: 'icon-prepend fa fa-user',
      value: this.state.datas[key],
      title: trans('messages.action.' + key),
      tooltip: trans('messages.action.tooltip.' + key)
    };
    key = 'graph';
    datasObj[key] = {
      id: key,
      label: 'textarea',
      type: 'textarea',
      rows: 2,
      icon: 'icon-prepend fa fa-user',
      value: this.state.datas[key],
      title: trans('messages.action.' + key),
      tooltip: trans('messages.action.tooltip.' + key)
    };
    key = 'plugin';
    datasObj[key] = {
      id: key,
      label: 'select',
      type: 'select',
      icon: 'icon-prepend fa fa-user',
      value: this.state.datas[key],
      title: trans('messages.action.' + key),
      tooltip: trans('messages.action.tooltip.' + key)
    };
console.log(this.state);
    key = 'action_name';
    datasObj[key] = {
      id: key,
      label: 'input',
      type: 'input',
      icon: 'icon-prepend fa fa-user',
      value: this.state.data[key],
      title: trans('messages.action.' + key),
      onChange: function(e) {
        var data = this.state.data;
        data[e.target.id] = e.target.value;
        this.setState({data: data});
      }.bind(this),
      tooltip: trans('messages.action.tooltip.' + key)
    };
    key = 'action_comment';
    datasObj[key] = {
      id: key,
      label: 'textarea',
      type: 'textarea',
      icon: 'icon-prepend fa fa-user',
      value: this.state.data[key],
      title: trans('messages.action.' + key),
      onChange: function(e) {
        var data = this.state.data;
        data[e.target.id] = e.target.value;
        this.setState({data: data});
      }.bind(this),
      tooltip: trans('messages.action.tooltip.' + key)
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
            {this.renderEditEventPlugin(datasObj)}
            {this.renderEditEventAction(datasObj)}
            {this.renderAddPlugin(datasObj)}
            {this.renderRuleCondition(datasObj)}
            {this.renderGraphCondition(datasObj)}
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

  renderEditEventAction(datasObj)
  {
    return (
      <fieldset>
        {this.renderInput(datasObj.action_name)}
        {this.renderInput(datasObj.action_comment)}
      </fieldset>
    );
  }

  renderEditEventPlugin(datasObj)
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

console.log(configDatas);
    Object.keys(configDatas).forEach(function(id) {
console.log(this.renderInput(configDatas[id]));
      inputs.push(this.renderInput(configDatas[id]));
    }.bind(this));

    var display_type1 = inputs.length === 0 ? "none" : "block";

    return (
      <fieldset>
        {inputs}
        <section style={{display: display_type1}}>
          <div className="row">
            <label className="label col col-2" />
            <div className="col col-10">
              <button type="button" className="btn btn-sm" onClick={this.handleAddPlugin.bind(this)} >
                {trans('messages.button.edit-plugin')}
              </button>
            </div>
          </div>
        </section>
      </fieldset>
    );
  }

  renderAddPlugin(datasObj)
  {
    var plugins = {};
    Object.keys(this.state.plugin).forEach(function(id) {
      var plugin = this.state.plugin[id];
      plugins[plugin.plugin_id] = plugin.plugin_name;
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
              <i> </i>
              <button type="button" className="btn btn-sm" onClick={this.handleAddLink.bind(this)} >
                {trans('messages.button.add-link')}
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
                  {this.renderLabel(datasObj.input)}
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

  initCondition()
  {
    var datas = this.state.datas;
    var re1 = /\-(incoming|outgoing)\-/;
    Object.keys(datas).forEach(function(key) {
      if (re1.test(key) === true) {
        delete datas[key];
      }
    }.bind(this));
    var input = datas.input;

console.log(datas);
console.log(input);

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
    var datas = this.state.datas;
    // var datas = jQuery.extend(true, {}, this.state.datas);
    var input = datas.input;
    if (datas.plugin === undefined) {
      console.warn('plugin is empty.');
      return false;
    }
    var plugin = this.state.plugin[datas.plugin];
    var data = {
      id: _.uniqueId('T_'),
      module: plugin.plugin_name,
      config: {},
      orderby: 99,
      incoming: [],
      outgoing: [],
    };
    this.setPlugin(data);
    this.handleReCreateGraph(new Event('click'));
  }

  handleAddLink(e)
  {
    if (this.state.selectId === null) {
      return false;
    }
    var element = this.returnElementByPluginId(this.state.selectId);
    var position = element.position();
    position.y += 100;
    var newLink = this.createLink(element, position);
    this.graph.addCell([newLink]);
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

  /**
   * action_sub_id? plugin_id?
   */
  getPluginProperty(action_sub_id)
  {
    // url_api_plugin_property
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
      var ret = {};
      data.forEach(function(plugin) {
        ret[plugin.plugin_id] = plugin;
      });
      state[key] = ret;
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
  url_api_plugin_property: "/orion/api/v1/action/plugin/property",
  url_api_plugin: "/orion/api/v1/action/plugin",
  url_api_condition: "/orion/api/v1/action/condition",
  url_api: "/orion/api/v1/action",
  url_redirect: "/orion/action",
  fixed_values: [
    {id: 'interval', type: 'text'},
  ]
};
