var should = require('chai').should();
var Model = require('..').Model;
var Person = require('./fixtures').ValidatingPerson;
var validator = require('../lib/validation').validator;
var jsonschema = require('jsonschema');

describe('Test validation', function () {

  it('should not validate with invalid data', function() {
    var employee = new Person({});
    employee.isValid().should.equal(false);
    employee.set('firstName', 1);
    employee.isValid().should.equal(false);
  });

  it('model should be valid', function() {
    var employee = new Person({firstName: 'Foo'});
    employee.isValid().should.equal(true);
  });

  it('should add custom validator', function() {
    validator.attributes.contains = function validateContains(instance, schema, options, ctx) {
      if(typeof instance !== 'string') return;
      if(typeof schema.contains !== 'string') throw new jsonschema.SchemaError('"contains" expects a string', schema);
      if(instance.indexOf()<0){
        return 'does not contain the string '+ JSON.stringify(schema.contains);
      }
    };
    var employee = new Person({firstName: 'Foo'});
    var errors = employee.validate();
    errors.length.should.equal(1);
  });
});