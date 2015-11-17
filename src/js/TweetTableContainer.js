import React from 'react';
import TweetTablePagination from './TweetTablePagination.js';
import TweetTable from './TweetTable.js';

export default class TweetTableContainer extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      data: [],
      total_entries: 201,
      entries_per_page: 10,
      current_page: 1
    };
    this.actionDataLoad();
  }

  actionOnRefresh(pageNumber, pageSize)
  {
    this.actionDataLoad();
  }

  actionOnSelectPage(pageNumber, pageSize)
  {
    this.setState({
      current_page: pageNumber,
      entries_per_page: pageSize
    });
  }

  componentDidUpdate(prevProps, prevState)
  {
    var reload = false;
    if (prevState.current_page !== this.state.current_page) {
      reload = true;
    }
    if (prevState.entries_per_page !== this.state.entries_per_page) {
      reload = true;
    }
    if (reload === true) {
      this.actionDataLoad();
    }
  }

  actionDataLoad()
  {
    var deferred = jQuery.Deferred();
    var params = {
      select_per_page: this.state.entries_per_page,
      page: this.state.current_page
    };
    var request;
    var timerId;

    timerId = setTimeout(function() {
      request.abort();
      deferred.reject();
    }, 5000);

    request = jQuery.ajax({
      type: "POST",
      url: "manage_twitter_public_timeline_json.php",
      data: params,
      dataType: "json",
      cache: false
    })
    .done(function(data, dataType) {
      clearTimeout(timerId);
      this.setState({data: data});
      return deferred.resolve();
    }.bind(this))
    .fail(function(XMLHttpRequest, textStatus, errorThrown) {
      return deferred.reject();
    }.bind(this))
    .always(function() {
      clearTimeout(timerId);
    }.bind(this))
    ;

    return deferred.promise();
  }

  render()
  {
    return (
      <div>
        <TweetTablePagination
          total_entries={this.state.total_entries}
          entries_per_page={this.state.entries_per_page}
          current_page={this.state.current_page}
          actionOnSelectPage={this.actionOnSelectPage.bind(this)}
          actionOnRefresh={this.actionOnRefresh.bind(this)}
        />
        <TweetTable data={this.state.data} />
      </div>
    );
  }
}
