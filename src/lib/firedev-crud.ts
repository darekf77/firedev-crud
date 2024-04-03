// // @ts-nocheck
// //#region imports
// //#region @backend
// import * as FileSync from 'lowdb/adapters/FileSync';
// import * as lowDb from 'lowdb';
// //#endregion
// //#region isomorphic
// import {
//   _,
//   //#region @backend
//   path
//   //#endregion
// } from 'tnp-core';
// import { config } from 'tnp-config';
// import { Helpers } from 'tnp-helpers';
// //#endregion
// import { DbCrud } from './db-crud';
// import { BaseController, DBBaseEntity, Models } from 'tnp-models';
// import { FiredevCrudInitOptions } from './firedev-crud-init-options';
// import { CLASS } from 'typescript-class-helpers';
// import { ProjectsController } from './projects-controller';
// import { ProjectInstance } from './project-instance';
// //#endregion

// declare const global: any;

// @CLASS.NAME('FiredevCrud')
// export class FiredevCrud {

//   //#region fields & getters
//   private _adapter: any;
//   public crud: DbCrud;

//   /**
//    * full path to db.json
//    */
//   protected location: string;
//   //#endregion

//   //#region constructor
//   constructor(
//     protected controllers: (typeof BaseController)[] = [],
//     protected entities: (typeof DBBaseEntity)[] = [],
//   ) {
//     //#region @backend
//     controllers.push(ProjectsController as any);
//     entities.push(ProjectInstance as any);
//     this.entities = Helpers.arrays.uniqArray(entities);
//     this.controllers = Helpers.arrays.uniqArray(controllers);
//     this.location = path.join(process.cwd(), 'tmp-db', 'temp-db.json');
//     //#endregion
//   }
//   //#endregion

//   //#region api

//   //#region api / get ctrl instance by class fn
//   getCtrlInstanceBy<T_CTRL>(ctrlClassFn: typeof BaseController) {
//     const index = this.controllers.findIndex(c => c === ctrlClassFn);
//     return this.crud.controllersInstances[index] as any as T_CTRL;
//   }
//   //#endregion

//   //#region api / init
//   async init(options?: FiredevCrudInitOptions) {
//     //#region @backend
//     const {
//       alreadyInitedDb,
//       callbackCreation,
//       recreateScopeFn,
//       recreate,
//       location,
//     } = fixOptions(options, this.location);

//     if (alreadyInitedDb) {
//       return;
//     }
//     this.location = location;

//     this._adapter = new FileSync(this.location);

//     this.crud = new DbCrud(
//       lowDb(this._adapter) as any,
//       this.controllers,
//       this.entities,
//     );

//     this.crud.initControllers();

//     Helpers.log('[db-crud] controllers inited');

//     if (recreate) {
//       Helpers.log('[db-crud] reinit transacton started');

//       Helpers.log(`[db-crud][reinit] writing default values`);

//       const recreateScope = _.isFunction(recreateScopeFn) ? await (recreateScopeFn(this.crud)) : {};
//       await this.crud.clearDBandReinit(options.defaultValuesOverride || {});
//       await this.crud.addExitedValues(recreateScope);

//       if (!config) {
//         Helpers.error(`config not available in db`);
//       }
//       if (_.isFunction(callbackCreation)) {
//         await callbackCreation(this.crud);
//       }


//       Helpers.info(`[db-crud][reinit] DONE`);
//       Helpers.log('[db-crud] reinit transacton finish');
//     }

//     //#endregion
//   }
//   //#endregion

//   //#region api / raw get
//   public async rawGet<T = any>(keyOrEntityName: string) {
//     //#region @backendFunc
//     if (!this.crud) {
//       return;
//     }
//     return await this.crud.db.get(keyOrEntityName).value() as T;
//     //#endregion
//   }
//   //#endregion

//   //#region api / raw set
//   public async rawSet<T = any>(keyOrEntityName: string, json: T) {
//     if (!this.crud) {
//       // Helpers.error(`[tnp-db][rawSet] cannot set db not defined`, true, true);
//       return;
//     }
//     let trys = 0;
//     while (true) {
//       trys++;
//       try {
//         await this.crud.db.set(keyOrEntityName, json as any).write();
//         break;
//       } catch (error) {
//         if (trys > 2) {
//           Helpers.warn(`[tnp-db][rawSet] http request to db  ${trys}th TIME REQUEST IS OK`);
//         }
//         continue;
//       }
//     }
//   }
//   //#endregion

//   //#endregion

// }

// //#region helpers

// //#region helpers / fix options
// //#region @backend
// function fixOptions(options: FiredevCrudInitOptions, locationDefault: string): FiredevCrudInitOptions {
//   if (!options) {
//     options = {} as any;
//   }
//   if (_.isUndefined(options.alreadyInitedDb)) {
//     options.alreadyInitedDb = false;
//   }
//   if (global.reinitDb) {
//     options.recreate = true;
//   }
//   if (options.recreate) {
//     if (global.dbAlreadyRecreated) {
//       Helpers.log(`[tnp-db] db already recreated`);
//       options.alreadyInitedDb = true;
//       return options;
//     }
//     global.dbAlreadyRecreated = true;
//     Helpers.log('[db] recreate db instance');
//   }
//   if (_.isString(options.location)) {
//     locationDefault = options.location;
//   }
//   if (_.isFunction(options.transformPathDb)) {
//     locationDefault = options.transformPathDb(locationDefault);
//   }
//   if (!options.location) {
//     options.location = locationDefault;
//   }
//   if (
//     !Helpers.exists(options.location)
//     || ((Helpers.readFile(options.location) || '').trim() === '')
//   ) {
//     options.recreate = true;
//   }
//   if (_.isUndefined(options.recreate)) {
//     options.recreate = false;
//   }
//   if (options.recreate) {
//     Helpers.writeFile(options.location, '');
//   }

//   return options;
// }
// //#endregion
// //#endregion

// //#endregion
