var should = require('chai').should();
var Model = require('..').Model;
var Collection = require('..').Collection;
var formatProperties = require('..').formatProperties;

var addressSchema = {
  id: '/schemas/address',
  title: 'Address',
  type: 'object',
  properties: {
    street: { type: 'string' },
    city: {type: 'string'},
    country: {type: 'string'}
  }
};

var Address = Model.extend({
  type: 'address',
  schema: addressSchema
});

var Addresses = Collection.extend({
  model: Address
});

var companySchema = {
  id: '/schemas/company',
  title: 'Company',
  type: 'object',
  properties: {
    id: {
      type: 'integer'
    },
    name: { type: 'string' }
  }
};

var Company = Model.extend({
  type: 'company',
  schema: companySchema,
});

var personSchema = {
  id: '/schemas/person',
  type: 'object',
  properties: {
    id: {
      type: 'integer'
    },
    firstName: {
      type: 'string',
      required: true
    },
    surname: {
      type: 'string'
    },
    employer: {
      type: 'relation',
      model: Company,
      references: {id: 'company_id'}
    },
    spouse: {
      type: 'relation',
      '$ref': '#',
      references: {id: 'spouse_id'}
    },
    addresses : {
      type: 'relation',
      collection: Addresses
    }
  }
};

var Employee = Model.extend({
  type: 'person',
  schema: personSchema
});

describe('Test Schema', function () {

  it('should create relations', function() {
    var employee = new Employee({
      id: 3340,
      firstName: 'John',
      surname: 'Foo',
      company_id: 222,
      spouse_id: 3300,
      addresses: [{street: 'Baker Street', city: 'London', country: 'GB'}]
    });
    employee.get('employer').get('id').should.equal(222);
    employee.get('spouse').get('id').should.equal(3300);
    should.not.exist(employee.get('spouse').get('employer'));
    employee.get('addresses').at(0).get('country').should.equal('GB');
    employee.toJSON().employer.id.should.equal(222);

    var employee2 = new Employee({
      id: 3341,
      firstName: 'Jane',
      surname: 'Foo',
    });
    should.not.exist(employee2.get('addresses'));
    should.not.exist(employee2.get('employer'));
    employee2.set('addresses', [{street: 'Baker Street', city: 'London', country: 'GB'}]);
    employee2.get('addresses').at(0).should.be.ok;
  });

  it('should format templated properties', function() {
    var Backbone = require('backbone');
    var TestModel = Model.extend({
      url: Model.formatTemplatedProperties('/companies/{company_id}/employees/{employer_id}')
    });
    var test = new TestModel({company_id: 222, employer_id: 11});
    test.url().should.equal('/companies/222/employees/11');
  });

});


