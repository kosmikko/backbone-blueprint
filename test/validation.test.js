var should = require('chai').should();
var Model = require('..').Model;
var Person = require('./fixtures').ValidatingPerson;

describe('Test validation', function () {

  it('should not validate with invalid data', function() {
    var employee = new Person({});
    employee.isValid().should.equal(false);
  });

  it('model should be valid', function() {
    var employee = new Person({firstName: 'Foo'});
    employee.isValid().should.equal(true);
  })

});