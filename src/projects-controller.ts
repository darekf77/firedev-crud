//#region imports
//#region @backend
import * as path from 'path';
import * as fse from 'fs-extra';
import * as os from 'os';
//#endregion
//#region isomorphic
import { _ } from 'tnp-core';
import { Models } from 'tnp-models';
//#endregion
//#endregion

export class ProjectsBaseController
  //#region @backend
  extends Models.db.BaseController<any>
//#endregion
{
  location: string;
  async addExisted() {

  }
  async update() {

  }

}
