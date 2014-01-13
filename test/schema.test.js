require('chai').should();
var BaseModel = require('..').Model;
var Schema = require('..').Schema;
var addressSchema = require('./fixtures').addressSchema;

describe('Test schema', function () {

  it('should set default attributes with a function', function() {
    var testSchema = {
      id: '/schemas/test',
      type: 'object',
      properties: {
        id: {
          type: 'integer'
        },
        date: {
          type: 'date',
          default: function() {
            return new Date();
          }
        }
      }
    };
    var TestModel = BaseModel.extend({
      type: 'test',
      schema: testSchema
    });
    var t = new TestModel();
    t.get('date').should.be.an.instanceof(Date);
  });

  it('should extend schema', function() {
    var newSchema = {
      properties: {
        street: {
          required: true
        }
      }
    };
    var streetRequiredSchema = Schema.extendSchema(addressSchema, newSchema);
    var street = streetRequiredSchema.properties.street;
    street.required.should.equal(true);
    street.type.should.equal('string');
  });


});