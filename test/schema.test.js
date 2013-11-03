var should = require('chai').should();
var Model = require('..').Model;
var formatProperties = require('..').formatProperties;

var companySchema = {
  id: '/schemas/company',
  title: 'Company',
  type: 'object',
  properties: {
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
      firstName: 'John', 
      surname: 'Foo',
      company_id: 222
    });
    employee.get('employer').get('id').should.equal(222);
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


