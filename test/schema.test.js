require('chai').should();
var Schema = require('..').Schema;
var addressSchema = require('./fixtures').addressSchema;

describe('Test schema', function () {

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