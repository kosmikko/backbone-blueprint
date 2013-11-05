var should = require('chai').should();
var Model = require('..').Model;
var formatProperties = require('..').formatProperties;

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
      spouse_id: 3300
    });
    employee.get('employer').get('id').should.equal(222);
    employee.get('spouse').get('id').should.equal(3300);
    employee.toJSON().employer.id.should.equal(222);
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


