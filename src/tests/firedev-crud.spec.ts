import { Project } from 'tnp-helpers';
import * as low from 'lowdb';
import { crossPlatformPath, path, fse, _ } from 'tnp-core';
import FileSync = require('lowdb/adapters/FileSync');
import { CLASS } from 'typescript-class-helpers';

import { describe, it } from 'mocha';
import { expect, use } from 'chai';

import { Helpers } from 'tnp-helpers';
import { Models } from 'tnp-models';

import { DbCrud } from '../db-crud';
import { FiredevCrud } from '../firedev-crud';


class TestInstance extends Models.db.DBBaseEntity {
  async prepareInstance() {
    this.value = this.data.value;
    return this;
  }

  async getRawData() {
    return {
      value: this.value
    }
  }

  static from(value: number): TestInstance {
    const i = new TestInstance({ value });
    return i;
  }
  public value: number;


  isEqual(anotherInstace: TestInstance): boolean {
    return this.value === anotherInstace.value;
  }

}


describe('Db crud for tnp-db', () => {

  Project.projects.length;

  it('should handle test instance of entity', async function () {


    let fc = FiredevCrud.from([], [TestInstance])
    await fc.init({
      recreate: true,
      transformPathDb: p => path.join(
        path.dirname(p),
        path.basename(p, '.json') + '_' + _.snakeCase(this.test.title) + '.json'
      )
    });

    const crud = fc.crud;
    const entityName = Models.db.DBBaseEntity
      .entityNameFromClassName(CLASS.getName(TestInstance));

    expect(entityName).to.be.eq('tests');

    const instancesAtBegin = (await crud.getAll(TestInstance));
    expect(instancesAtBegin.length).to.be.eq(0);

    const exampleValue = 47;

    await crud.addIfNotExist(TestInstance.from(exampleValue));

    const instancesExistsCheck = (await crud.getAll<TestInstance>(TestInstance));
    expect(instancesExistsCheck.length).to.be.eq(1);

    const firstInstace = _.first(instancesExistsCheck);
    console.log(firstInstace)
    expect(firstInstace instanceof TestInstance).to.be.true;

    expect(firstInstace.value).to.be.eq(exampleValue);
  });


});
