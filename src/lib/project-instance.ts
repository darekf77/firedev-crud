//#region imports
import { _ } from 'tnp-core';
import { DBBaseEntity, Models } from 'tnp-models';
import { Project } from 'tnp-helpers';
//#endregion

export class ProjectInstance extends DBBaseEntity<ProjectInstance> {

  //#region static methods
  public static from(projectOrPath: Project | string): ProjectInstance {
    //#region @backendFunc
    if (!projectOrPath) {
      return;
    }
    let inst: ProjectInstance;
    // console.log('PROJECT FROM', projectOrPath)
    if (_.isObject(projectOrPath)) {
      projectOrPath = (projectOrPath as Project).location;
    }

    if (_.isString(projectOrPath)) {
      projectOrPath = Project.From(projectOrPath) as Project;
      inst = new ProjectInstance({ locationOfProject: projectOrPath.location });
    }

    inst.assignProps();
    return inst;
    //#endregion
  }
  //#endregion

  //#region fields & getters
  locationOfProject: string;
  get project() {
    return Project.From<Project>(this.locationOfProject);
  }
  //#endregion

  //#region api

  //#region api / assign props
  assignProps(): void {
    //#region @backendFunc
    const { locationOfProject } = this.data;
    this.locationOfProject = locationOfProject;
    //#endregion
  }
  //#endregion

  //#region api / prepare instance
  async prepareInstance(): Promise<ProjectInstance> {
    this.assignProps();
    return this;
  }
  //#endregion

  //#region api / get raw data
  async getRawData(): Promise<object> {
    return {
      locationOfProject: this.locationOfProject
    };
  }
  //#endregion

  //#region api / is equal
  isEqual(anotherInstace: ProjectInstance): boolean {
    return _.isString(this.locationOfProject)
      && _.isString(anotherInstace.locationOfProject)
      && (this.locationOfProject === anotherInstace.locationOfProject);
  }
  //#endregion

  //#endregion
}
