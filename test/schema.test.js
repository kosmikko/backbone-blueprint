require('chai').should();
var BaseModel = require('..').Model;
var Schema = require('..').Schema;
var addressSchema = require('./fixtures').addressSchema;

describe('Test schema', function () {

  it('should set default attributes correctly', function(done) {
    var now = new Date();
    var date;
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

    function proceed() {
      var t = new TestModel();
      date = t.get('date');
      date.should.be.an.instanceof(Date);
      date.getTime().should.be.above(now.getTime());
      setTimeout(testAnother, 10);
    }

    function testAnother() {
      var t = new TestModel();
      t.get('date').should.be.above(date);
      done();
    }

    setTimeout(proceed, 10);
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