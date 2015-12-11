class Mermaid extends React.Component
{
  constructor(props)
  {
    super(props);
    this.bindFunctions = null;
    this.state = {
      svgCode: null,
      graphDefinition: ' graph TB;\n aaaaa-->b;\n click aaaaa test "pe"'
    };
    mermaidAPI.initialize({startOnLoad: false, logLevel: 1});
  }

  componentDidMount()
  {
    this.handleUpdate();
  }

  componentDidUpdate(prevProps, prevState)
  {
    if (prevState.svgCode !== this.state.svgCode) {
      var node = document.getElementById("xxxx");
      this.bindFunctions(node);
    }
  }

  handleUpdate(e)
  {
    jQuery("#xxxx").html("");
    var svgCode = mermaidAPI.render('id1', this.state.graphDefinition, this.setBindFunctions.bind(this), "#xxxx");
    this.setState({svgCode: svgCode});
  }

  setBindFunctions(svgCode, bindFunctions)
  {
    this.bindFunctions = bindFunctions;
  }

  changeTextarea(e)
  {
    this.setState({graphDefinition: e.target.value});
  }

  test(id)
  {
    console.log(id);
  }

  render()
  {
    return (
      <div>
        <h1>test</h1>
        <div id="xxxx" className="mermaid" dangerouslySetInnerHTML={{__html: this.state.svgCode}}>
        </div>
        <textarea id="graph_definition" onChange={this.changeTextarea.bind(this)} value={this.state.graphDefinition} />
        <button className="btn btn-default" type="button" onClick={this.handleUpdate.bind(this)}>Update</button>
      </div>
    );
  }
}

var mermaidInstance = ReactDOM.render(
  <Mermaid />,
  document.getElementById('aquarium')
);

window.test = function(id) {
  mermaidInstance.test(id);
  console.log("xxxxxxxxxxxx");
}
