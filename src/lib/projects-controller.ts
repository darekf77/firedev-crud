//#region imports
import {
  //#region @backend
  path, fse
  //#endregion
} from 'tnp-core';

//#region isomorphic
import { _ } from 'tnp-core';
import { DbCrud } from './db-crud';
import { config } from 'tnp-config';
import { CLASS } from 'typescript-class-helpers';
import {  BaseProject as Project, Helpers } from 'tnp-helpers';
import { Models, BaseController } from 'tnp-models';
//#endregion
import { ProjectInstance } from './project-instance';
declare const global: any;
//#endregion

@CLASS.NAME('ProjectsController')
export class ProjectsController extends BaseController<DbCrud> {
  private recognized: ProjectInstance[] = [];

  //#region update
  async update() {

  }
  //#endregion

  //#region add existed
  async addExisted() {
    //#region @backend
    Helpers.log(`[db][reinit] adding existed projects`);
    if (global['frameworkName'] === 'firedev') {
      Helpers.log(`[tnp-db] For now dont discover project in tnp db`);
      return;
    }
    //#region TODO QUCIK_FIX something here is causing nest projects data proeprty
    // await this.discoverProjectsInLocation(path.resolve(path.join(Project.Tnp.location, '..')));
    // if (global.testMode) {
    //   await this.discoverProjectsInLocation(path.resolve(config.pathes.tnp_tests_context), true);
    // } else {
    //   await this.discoverProjectsInLocation(path.resolve(path.join(Project.Tnp.location, '../firedev-projects')));
    // }
    //#endregion
    //#endregion
  }
  //#endregion

  //#region add if not exists
  async addIfNotExists(projectInstance: ProjectInstance): Promise<boolean> {
    //#region @backendFunc
    if (!projectInstance) {
      // Helpers.log(`[tnp-db] no project instance `)
      return;
    }
    // Helpers.info('HELLO')

    if (this.recognized.find(p => p.project.location === projectInstance.project.location)) {
      // Helpers.log(`[tnp-db] already recognized`)
      return;
    }
    this.recognized.push(projectInstance);

    if (await this.crud.addIfNotExist(projectInstance)) {

      if (_.isArray(projectInstance.project.children)) {
        const children = projectInstance.project.children;
        for (let index = 0; index < children.length; index++) {
          const c = children[index];
          // Helpers.log(`[tnp-db] adding child`)
          await this.addIfNotExists(ProjectInstance.from(c as any as Project));
        }
      }
    }
    // Helpers.log(`[tnp-db] done adding`)
    //#endregion
  }
  //#endregion

  //#region discover projects in location
  async discoverProjectsInLocation(location: string, searchSubfolders = false) {
    //#region @backend
    if (searchSubfolders) {
      const locations = fse
        .readdirSync(location)
        .map(name => path.join(location, name));

      for (let index = 0; index < locations.length; index++) {
        const subLocation = locations[index];
        await this.discoverProjectsInLocation(subLocation);
      }
      return;
    }

    const projects = fse.readdirSync(location)
      .map(name => path.join(location, name))
      .map((loc) => {
        // console.log(location)
        return Project.ins.From(loc) as any;
      })
      .filter(f => !!f)
      .filter(f => {
        return f.typeIsNot('unknow-npm-project');
      });

    for (let index = 0; index < projects.length; index++) {
      const project = projects[index];
      await this.addIfNotExists(ProjectInstance.from(project));
    }
    //#endregion
  }
  //#endregion

}


// //#region imports
// //#region @backend
// import * as path from 'path';
// import * as fse from 'fs-extra';
// import * as os from 'os';
// //#endregion
// //#region isomorphic
// import { _ } from 'tnp-core';
// import { Models } from 'tnp-models';
// //#endregion
// //#endregion

// export class ProjectsBaseController
//   //#region @backend
//   extends Models.db.BaseController<any>
// //#endregion
// {
//   location: string;
//   async addExisted() {

//   }
//   async update() {

//   }

// }
