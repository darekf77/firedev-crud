//#region imports
//#region @backend
import * as FileSync from 'lowdb/adapters/FileSync';
import * as lowDb from 'lowdb';
//#endregion
//#region isomorphic
import {
  _,
  //#region @backend
  path
  //#endregion
} from 'tnp-core';
import { config } from 'tnp-config';
import { Helpers } from 'tnp-helpers';
//#endregion
import { DbCrud } from './db-crud';
import { Models } from 'tnp-models';
import { FiredevCrudInitOptions } from './firedev-crud-init-options';
//#endregion

declare const global: any;

export class FiredevCrud {
  //#region static methods
  public static from(
    controllers?: (typeof Models.db.BaseController)[],
    entities?: (typeof Models.db.DBBaseEntity)[],
  ) {
    const ins = new FiredevCrud(controllers, entities);
    return ins;
  }
  //#endregion

  //#region fields & getters
  private _adapter: any;
  public crud: DbCrud;
  protected location: string;
  //#endregion

  //#region constructor
  private constructor(
    protected controllers: (typeof Models.db.BaseController)[] = [],
    protected entities: (typeof Models.db.DBBaseEntity)[] = [],
  ) {
    //#region @backend
    this.location = path.join(process.cwd(), 'tmp-db', 'temp-db.json');
    //#endregion
  }
  //#endregion

  //#region api

  //#region api / get ctrl instance by class fn
  getCtrlInstanceBy<T_CTRL>(ctrlClassFn: typeof Models.db.BaseController) {
    const index = this.controllers.findIndex(ctrlClassFn as any);
    return this.crud.controllersInstances[index] as any as T_CTRL;
  }
  //#endregion

  //#region api / init
  async init(options?: FiredevCrudInitOptions) {
    //#region @backend
    const {
      alreadyInitedDb,
      callbackCreation,
      transformPathDb,
      recreate,
      location,
    } = fixOptions(options, this.location);

    if (alreadyInitedDb) {
      return;
    }
    this.location = location;

    this._adapter = new FileSync(this.location);

    this.crud = new DbCrud(
      lowDb(this._adapter) as any,
      this.controllers,
      this.entities,
    );

    this.crud.initControllers();

    Helpers.log('[db] controllers inited');

    if (recreate) {
      Helpers.log('[db] reinit transacton started');

      Helpers.log(`[db][reinit] writing default values`);
      await this.crud.clearDBandReinit(options.defaultValuesOverride || {});
      await this.crud.addExitedValues();

      if (!config) {
        Helpers.error(`config not available in db`)
      }
      if (_.isFunction(callbackCreation)) {
        await callbackCreation();
      }


      Helpers.info(`[db][reinit] DONE`);
      Helpers.log('[db] reinit transacton finish');
    }

    //#endregion
  }
  //#endregion

  //#endregion
}

//#region helpers

//#region helpers / fix options
//#region @backend
function fixOptions(options: FiredevCrudInitOptions, locationDefault: string): FiredevCrudInitOptions {
  if (!options) {
    options = {} as any;
  }
  if (_.isUndefined(options.alreadyInitedDb)) {
    options.alreadyInitedDb = false;
  }
  if (global.reinitDb) {
    options.recreate = true;
  }
  if (options.recreate) {
    if (global.dbAlreadyRecreated) {
      Helpers.log(`[tnp-db] db already recreated`);
      options.alreadyInitedDb = true;
      return options;
    }
    global.dbAlreadyRecreated = true;
    Helpers.log('[db] recreate db instance');
  }
  if (_.isString(options.location)) {
    locationDefault = options.location;
  }
  if (_.isFunction(options.transformPathDb)) {
    locationDefault = options.transformPathDb(locationDefault);
  }
  if (!options.location) {
    options.location = locationDefault;
  }
  if (
    !Helpers.exists(options.location)
    || ((Helpers.readFile(options.location) || '').trim() === '')
  ) {
    options.recreate = true;
  }
  if (_.isUndefined(options.recreate)) {
    options.recreate = false;
  }
  if (options.recreate) {
    Helpers.writeFile(options.location, '');
  }

  return options;
}
//#endregion
//#endregion

//#endregion
