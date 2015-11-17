import Backbone from 'backbone';

export default class State extends Backbone.Model
{
  defaults()
  {
    return {
      state: "init",
      timeout: 3,
      timerId: 0
    };
  }
}
