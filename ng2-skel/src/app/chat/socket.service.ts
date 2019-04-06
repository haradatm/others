import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {
  socket;

  constructor() {
    this.socket = io();
  }

  /**
   * Register listeners to sync an array with updates on a model
   *
   * Takes the array we want to sync, the model name that socket updates are sent from,
   * and an optional callback function after new items are updated.
   *
   * @param {String} modelName
   * @param {Array} array
   * @param {Function} cb
   */
  syncUpdates(modelName, array, cb) {
    cb = cb || function() {};

    /**
     * Syncs item creation/updates on 'model:save'
     */
    this.socket.on(`${modelName}:save`, function(item) {
      // var oldItem = find(array, {_id: item._id});
      var oldItem = array.find(array => array._id === item._id);
      var index = array.indexOf(oldItem);
      var event = 'created';

      // replace oldItem if it exists
      // otherwise just add item to the collection
      if(oldItem) {
        array.splice(index, 1, item);
        event = 'updated';
      } else {
        array.push(item);
      }

      cb(event, item, array);
    });

    /**
     * Syncs removed items on 'model:remove'
     */
    this.socket.on(`${modelName}:remove`, function(item) {
      var event = 'deleted';
      // remove(array, {_id: item._id});
      var oldItem = array.find(array => array._id === item._id);
      var index = array.indexOf(oldItem);
      array.splice(index, 1);

      cb(event, item, array);
    });
  }

  /**
   * Removes listeners for a models updates on the socket
   *
   * @param modelName
   */
  unsyncUpdates(modelName) {
    this.socket.removeAllListeners(`${modelName}:save`);
    this.socket.removeAllListeners(`${modelName}:remove`);
  }
}