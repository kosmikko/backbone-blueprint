var should = require('chai').should();
var Model = require('..').Model;
var Employee = require('./fixtures').Employee;
var personSchema = require('./fixtures').personSchema;
var Schema = require('..').Schema;

describe('Test relations', function () {
  it('should create relations', function() {
    var employee = new Employee({
      id: 3340,
      firstName: 'John',
      surname: 'Foo',
      company_id: 222,
      spouse_id: 3300,
      addresses: [{street: 'Baker Street', city: 'London', country: 'GB'}]
    });
    employee.get('title').should.equal('mr');
    employee.get('employer').get('id').should.equal(222);
    employee.get('spouse').get('id').should.equal(3300);
    should.not.exist(employee.get('spouse').get('employer'));
    employee.get('addresses').at(0).get('country').should.equal('GB');
    employee.toJSON({recursive: true}).employer.id.should.equal(222);

    var employee2 = new Employee({
      id: 3341,
      firstName: 'Jane',
      surname: 'Foo',
    });
    should.not.exist(employee2.get('addresses'));
    should.not.exist(employee2.get('employer'));
    should.not.exist(employee2.get('spouse'));
    employee2.set('addresses', [{street: 'Baker Street', city: 'London', country: 'GB'}]);
    employee2.get('addresses').at(0).should.be.ok;
    employee2.set('spouse_id', 3333);
    employee2.get('spouse').get('id').should.equal(3333);
  });

  it('should not save relations, unless specified so', function(done) {
    var id;
    var employee = new Employee({
      firstName: 'John',
      surname: 'Foo',
      company_id: 222,
      spouse_id: 3300,
      addresses: [{street: 'Baker Street', city: 'London', country: 'GB'}]
    });

    function save(cb) {
      employee.save(null, {
        success: function() {
          id = employee.id;
          cb()
        },
        error: function(err) {
          cb(err);
        }
      });
    }

    function fetch(cb) {
      employee = new Employee({id: id});
      employee.fetch({
        success: function() {
          cb();
        },
        error: function(err) {
          cb(err);
        }
      });
    }

    save(function(err) {
      fetch(function(err) {
        should.not.exist(employee.get('addresses'));
        employee.get('spouse').get('id').should.equal(3300);
        done();
      });
    });

  });

  it('should format templated properties', function() {
    var Backbone = require('backbone');
    var TestModel = Model.extend({
      url: Model.formatTemplatedProperties('/companies/{company_id}/employees/{employer_id}')
    });
    var test = new TestModel({company_id: 222, employer_id: 11});
    test.url().should.equal('/companies/222/employees/11');
  });

  it('should test inheritance', function() {
    var Manager = Employee.extend({
      title: function() {
        return 'manager' + this.id;
      }
    });
    var engineerSchema = Schema.extendSchema(personSchema, {
      properties: {
        manager: {
          type: 'relation',
          model: Manager,
          references: {id: 'manager_id'}
        }
      }
    });
    var Engineer = Employee.extend({
      schema: engineerSchema,
      title: function() {
        return 'engineer' + this.id;
      }
    });
    var managerSchema = Schema.extendSchema(personSchema, {
      properties: {
        subordinate: {
          type: 'relation',
          model: Engineer,
          references: {id: 'subordinate_id'}
        }
      }
    });
    Manager.prototype.changeSchema(managerSchema);

    var engineer = new Engineer({id: 1, manager_id: 2});
    var manager = new Manager({id: 2, subordinate_id: 1});
    engineer.title().should.equal('engineer1');
    manager.title().should.equal('manager2');
    engineer.get('manager').id.should.equal(2);
    engineer.get('manager').title().should.equal('manager2');
    manager.get('subordinate').title().should.equal('engineer1');
  });

});


