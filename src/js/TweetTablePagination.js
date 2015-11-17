import React from 'react';

export default class TweetTablePagination extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
    };
  }

  reload()
  {
    if (jQuery("#" + this.props.id).hasClass("pagination") === false) {
      jQuery("#" + this.props.id).pagination({
        total: this.props.total_entries,
        pageSize: this.state.entries_per_page,
        pageNumber: this.props.current_page,
        onSelectPage: function(pageNumber, pageSize){
          this.props.actionOnSelectPage(pageNumber, pageSize);
        }.bind(this),
        onRefresh: function(pageNumber, pageSize){
          this.props.actionOnRefresh(pageNumber, pageSize);
        }.bind(this)
      });
    } else {
      jQuery("#" + this.props.id).pagination("refresh", {
        total: this.props.total,
        pageSize: this.props.current,
        pageNumber: this.props.current_page
      });
    }
  }

  componentDidUpdate(prevProps, prevState)
  {
    // noop
  }

  componentWillReceiveProps(nextProps)
  {
    this.reload();
  }

  render()
  {
    return (
      <div
        id="tweet_table_pagination"
        style={{background: "#efefef", border: "1px solid #ccc"}}
        data-options=""
      >
      </div>
    );
  }
}

TweetTablePagination.defaultProps = {
  id: "tweet_table_pagination"
};
