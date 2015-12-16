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

  renderLabel(data)
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
