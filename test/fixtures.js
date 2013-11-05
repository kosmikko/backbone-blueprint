var Model = require('..').Model;
var Collection = require('..').Collection;

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

var Employee = exports.Employee = Model.extend({
  type: 'person',
  schema: personSchema
});