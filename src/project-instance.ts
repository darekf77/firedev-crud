//#region imports
import { _ } from 'tnp-core';
import { Models } from 'tnp-models';
import { Project } from 'tnp-helpers';
//#endregion

export class ProjectInstance
  //#region @backend
  extends Models.db.DBBaseEntity<ProjectInstance>
//#endregion
{
  //#region static methods
  public static from(project: Project): ProjectInstance {
    //#region @backendFunc
    if (!project) {
      return;
    }
    return new ProjectInstance({ locationOfProject: project.location });
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

  //#region api / prepare instance
  async prepareInstance(): Promise<ProjectInstance> {
    //#region @backendFunc
    const { locationOfProject } = this.data;
    this.locationOfProject = locationOfProject;
    //#endregion
    return this;
  }
  //#endregion

  //#region api / get raw data
  async getRawData(): Promise<object> {
    return {
      locationOfProject: this.locationOfProject
    }
  }
  //#endregion

  //#region api / is equal
  isEqual(anotherInstace: ProjectInstance): boolean {
    return _.isString(this.locationOfProject)
      && _.isString(anotherInstace.locationOfProject)
      && (this.locationOfProject === anotherInstace.locationOfProject)
  }
  //#endregion

  //#endregion
}
