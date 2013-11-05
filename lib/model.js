var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('./utils');

var Model = Backbone.Model.extend({
  constructor: function(attributes, options) {
    var ret = Backbone.Model.call(this, attributes, options);
    return ret;
  },

  set: function(key, value, options) {
    var attributes;
    if(_.isObject(key) || key === undefined) {
      attributes = key;
      options = value;
    } else {
      attributes = {};
      attributes[key] = value;
    }

    options = options || {};
    if(options.validate === undefined) {
      options.validate = false;
    }
    attributes = this._prepareRelations(attributes, options);

    return Backbone.Model.prototype.set.call(this, attributes, options);
  },

  toJSON: function(options) {
    options = options || {};
    var json = {};

    function convertProperty(property, name) {
      var value;
      var attribute = this.attributes[name];
      if(!attribute) return;

      if(this.relationDefinitions[name]) {
        // recursively create json for relations
        if(options.recursive && typeof attribute.toJSON === 'function') {
          value = attribute.toJSON(options);
        }
      } else {
        value = attribute;
      }
      if(value !== undefined) {
        json[name] = value;
      }
    }

    if(this.schema && this.schema.properties) {
      _.each(this.schema.properties, convertProperty, this);
    } else {
      json = Backbone.Model.prototype.toJSON.apply(this, arguments);
    }

    return json;
  },

  _prepareRelations: function(attributes, options) {
    var self = this;
    if(!attributes) attributes = {};

    _.each(this.relationDefinitions, function(relation, name) {
      var relationInited =
        attributes[name] instanceof Backbone.Model ||
        attributes[name] instanceof Backbone.Collection;
      if(!relationInited && relation.Class) {
        if(relation.type === 'model') {
          var relationValues = getRelationValues(relation, attributes);
          if(relationValues) {
            // only create relation Model if some values have been set
            attributes[name] = new relation.Class(relationValues, _.extend({silent: true}, options));
          }
        } else if(relation.type === 'collection') {
          var models = attributes[name];
          if(models && !_.isArray(models)) models = [models];
          if(models && models.length) {
            // only create relation Collection if some values have been set
            attributes[name] = new relation.Class(models, _.extend({silent: true}, options));
          }
        }

      } else if(!relationInited && relation['$ref'] && !options.noRelations) {
        var relationValues = getRelationValues(relation, attributes);
        if(relationValues) {
          attributes[name] = new self.constructor(relationValues, _.extend({silent: true, noRelations: true}, options));
        }
      }
    });
    return attributes;
  }

});

// init relation's attributes with ones from current model
function getRelationValues(relation, modelAttributes) {
  var attrs = {};
  _.each(relation.references, function(ref, key) {
    if(modelAttributes[ref]) attrs[key] = modelAttributes[ref];
  });
  if(_.keys(attrs).length) {
    return attrs;
  }
}

Model.extend = function(protoProps, staticProps) {
  var schema = protoProps.schema;
  if(schema) {
    var relationDefinitions = protoProps.relationDefinitions = {};
    var properties = schema.properties;
    // preprocess relationDefinitions
    _.each(properties, function(property, name) {
      if(property.type === 'relation') {
        relationDefinitions[name] = {
          Class: property.model || property.collection,
          references: property.references,
          type: property.model ? 'model' : 'collection',
          '$ref': property['$ref']
        }
      }
    });
  }

  return Backbone.Model.extend.call(this, protoProps, staticProps);
};


Model.formatTemplatedProperties = utils.formatTemplatedProperties;

module.exports = Model;