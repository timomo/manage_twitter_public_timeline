import React from 'react';
import TweetTableHeader from './TweetTableHeader.js';
import TweetTableBody from './TweetTableBody.js';

export default class TweetTable extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      id: "tweet_table"
    };
  }

  reload()
  {
    if (jQuery("#" + this.props.id).hasClass("easyui-datagrid") === false) {
      jQuery("#" + this.props.id).datagrid();
    } else {
      jQuery("#" + this.props.id).datagrid("reload");
    }
  }

  componentDidUpdate(prevProps, prevState)
  {
    this.reload();
  }

  componentWillReceiveProps(nextProps)
  {
    this.reload();
  }

  render()
  {
    return (
      <table
        className="table table-bordered"
        style={{height: "auto", border:"1px solid #ccc", width: "100%"}}
        id={this.state.id}
      >
        <TweetTableHeader />
        <TweetTableBody data={this.props.data} />
      </table>
    );
  }
}
