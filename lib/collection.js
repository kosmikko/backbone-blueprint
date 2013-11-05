var modules = require('./modules');
var Backbone = modules.Backbone;
var _ = modules._;

var Collection = Backbone.Collection.extend({
  /**
   * JSON Schema associated with this model
   * @type {Object}
   */
  schema: {},

  constructor: function Collection(models, options) {
    Backbone.Collection.prototype.constructor.call(this, models, options);
  },

  /**
   * Validates the Collection against the schema
   * @param  {Object}  options Passed to the validate method
   * @return {Boolean}         Returns true if valid, otherwise false
   */
  isValid: function(options) {
    return this.validate(options) === undefined;
  },

  /**
   * Adds one or more models to the collection
   * @param {SchemaModel|array} models  Model or array of Models
   * @param {Object=} options
   */
  add: function(models, options) {
    if (options && options.parse) {
      models = this.parse(_.isArray(models) ? models : [models], options);
    }
    return Backbone.Collection.prototype.add.call(this, models, options);
  },

  /**
   * Removes one or more models from the collection
   * @param {SchemaModel|array} models  Model or array of Models
   * @param {Object=} options
   */
  remove: function(models, options) {
    if (options && options.parse) {
      models = this.parse(_.isArray(models) ? models : [models], options);
    }
    return Backbone.Collection.prototype.remove.call(this, models, options);
  },

  /**
   * Resets the collection with the provided Models
   * @param {SchemaModel|array} models  Model or array of Models
   * @param {Object=} options
   */
  reset: function(models, options) {
    if (options && options.parse) {
      models = this.parse(_.isArray(models) ? models : [models], options);
    }
    return Backbone.Collection.prototype.reset.call(this, models, options);
  },


  /**
   * Lock used to stop circular references from causing a stack overflow
   * during toJSON serializtion
   * @type {Boolean}
   * @private
   */
  toJSONInProgress: false,

  /**
   * Creates a serializable array of models from the collection
   * @param  {Object=} options
   * @return {Array}  array of model objects that have themselves been passed through toJSON
   */
  toJSON: function(options) {
    if (this.toJSONInProgress) {
      // This only happens when there is a circular reference
      // and the model has already been serialized previously
      return undefined;
    }
    this.toJSONInProgress = true;

    var toReturn;
    if (this.schema) {
      var models = this.models;
      if (models.length === 0) {
        this.toJSONInProgress = false;
        return [];
      }

      toReturn = [];
      _.each(models, function(model) {
        var value = model.toJSON(options);
        if (value !== undefined) {
          toReturn.push(value);
        }
      });
    } else {
      toReturn = Backbone.Collection.prototype.toJSON.apply(this, arguments);
    }

    this.toJSONInProgress = false;

    return toReturn;
  },

  /**
   * Lock which allows dispose to be called multiple times without disposing mutliple times
   * during toJSON serializtion
   * @type {Boolean}
   * @private
   */
  isDisposed: false,

  /**
   * Dispose the collection and all colletions models
   */
  dispose: function() {
    // TODO: Add reference count functionality to avoid situation
    // where collection is used multiple times
    /*if(!this.isDisposed) {
            this.isDisposed = true;
            _.each(this.models, function(model) {
                if(model.dispose) {
                    model.dispose();
                }
            });
        }*/
  }
});

module.exports = Collection;