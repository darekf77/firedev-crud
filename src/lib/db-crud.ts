//#region imports
//#region isomorphic
import { _ } from 'tnp-core';
import { CLASS } from 'typescript-class-helpers';
import { Helpers, Project } from 'tnp-helpers';
import { BaseController, DBBaseEntity, Models } from 'tnp-models';
import { Morphi } from 'morphi';
//#endregion
import { IDBCrud } from './db-crud.model';

//#endregion

export class DbCrud {
  //#region fields & getters
  public controllersInstances: (BaseController<any>)[] = [];
  public readonly context: Morphi.FrameworkContext;
  public get db() {
    return this.dbFromFile;
  }
  //#endregion

  //#region constructor
  constructor(
    private dbFromFile: IDBCrud,
    protected controllers: (typeof BaseController)[] = [],
    protected entities: (typeof DBBaseEntity)[] = [],
  ) {

  }
  //#endregion

  //#region api

  //#region api / clear db and reinit
  async clearDBandReinit(defaultValues?: { [entityName: string]: any[]; }) {
    //#region @backend

    const defaultValuesFromEntites = this.entities
      .map(entityClassFn => Models.db.getEntityNameByClassFN(entityClassFn))
      .reduce((a, b) => {
        return _.merge(a, {
          [b]: []
        });
      }, {});

    await this.db.defaults(_.merge(defaultValuesFromEntites, defaultValues)).write();
    //#endregion
  }
  //#endregion

  //#region api / get all
  async getAll<T extends DBBaseEntity>(classFN: Function): Promise<T[]> {
    //#region @backendFunc
    const entityName: string = Models.db.getEntityNameByClassFN(classFN);
    let res;
    // console.log(`${CLASS.getName(classFN)} entity name from object`, entityName);
    // process.exit(0)
    // Helpers.log(`db read start`)
    await this.db.read();
    // Helpers.log(`db read done`)

    let trys = 0;
    // const timeoutEnded: { [trys in number]: 'started' | 'expierd' | 'ok' } = {};
    while (true) {
      ++trys;
      // timeoutEnded[trys] = 'started';
      // Helpers.log(`this.db.get(entityName) start try: ${trys}`)
      // if (trys > 1) {
      //   Helpers.info(`


      //   [tnp-bn] RETRYING http request!
      //   (await this.db.get(entityName).value() as T[])

      //   `)
      // }
      // setTimeout(() => {
      //   if (timeoutEnded[trys] === 'ok') {
      //     // Helpers.log('timout OK')
      //   } else {
      //     timeoutEnded[trys] = 'expierd';
      //     Helpers.info(`HTTP REQUST TIMEOUT EXPIRED ${config.CONST.BACKEND_HTTP_REQUEST_TIMEOUT}`)
      //   }
      // }, config.CONST.BACKEND_HTTP_REQUEST_TIMEOUT);

      try {
        res = (await this.db.get(entityName).value() as T[]);
      } catch (error) {
        // console.error(error); // TODO QUICK_FIX for fails first and second ok
        continue;
      }
      if (trys > 2) {
        Helpers.warn(`[tnp-db]  ${trys}th TIME REQUEST IS OK`);
      }
      // if (timeoutEnded[trys] === 'expierd') {
      //   continue;
      // }
      // timeoutEnded[trys] = 'ok';
      // Helpers.log(`this.db.get(entityName) done`)
      break;
    }

    if (_.isArray(res)) {

      // (entityName === 'projects') && Helpers.log(`${CLASS.getName(classFN)}, entity ${entityName}, res

      // ${Helpers.stringify(res)}

      // `);

      for (let index = 0; index < res.length; index++) {
        const v = res[index];
        // Helpers.log(`Preparing ${index} ${entityName} start`)
        res[index] = (await this.afterRetrive(v, entityName)) as any;
        // Helpers.log(`Preparing ${index} ${entityName} done`)
      }
      return res.filter(f => !!f) as any;
    }
    return [];
    //#endregion
  }
  //#endregion

  //#region api / add if not exists
  async addIfNotExist(entity: DBBaseEntity): Promise<boolean> {
    //#region @backendFunc
    const classFN = CLASS.getFromObject(entity);
    // Helpers.log(`[tnp-db][crud][addIfNotExist] ${classFN}`)
    // console.log(`[addIfNotExist] add if not exist entity: ${CLASS.getNameFromObject(entity)}`)
    // Helpers.log(`[tnp-db][addIfNotExist] getall start`)
    const all = await this.getAll(CLASS.getFromObject(entity));
    // Helpers.log(`[tnp-db][addIfNotExist] getall end`)
    const indexFounded = all.findIndex(f => f.isEqual(entity));
    if (indexFounded === -1) {

      all.push(entity);
      // console.log(`NOT FOUND - ADD : all.length ${all.length}`,all);
      // Helpers.log(`[tnp-db][addIfNotExist] setting bulk start`)
      await this.setBulk(all, classFN);
      // Helpers.log(`[tnp-db][addIfNotExist] setting bulk done `)
      return true;
    }
    // console.log(`FOUNDED ????? - NOT ADD`);
    return false;
    //#endregion
  }
  //#endregion

  //#region api / remove
  async remove(entity: DBBaseEntity): Promise<boolean> {
    //#region @backendFunc
    const classFN = CLASS.getFromObject(entity);
    const all = await this.getAll(CLASS.getFromObject(entity));
    const filtered = all.filter(f => !f.isEqual(entity));
    if (filtered.length === all.length) {
      return false;
    }
    await this.setBulk(filtered, classFN);
    return true;
    //#endregion
  }
  //#endregion

  //#region api / set
  async set(entity: DBBaseEntity) {
    //#region @backend
    const classFN = CLASS.getFromObject(entity);
    const className = CLASS.getName(classFN);
    const entityName = Models.db.getEntityNameByClassName(className);

    if (entityName === 'commands') { // TODO QUICK_FIX
      return true;
    }

    Helpers.log('getting all start');
    const all = await this.getAll(CLASS.getFromObject(entity));
    Helpers.log('getting all done');
    const existed = all.find(f => f.isEqual(entity));
    if (existed) {
      _.merge(existed, entity);
    } else {
      all.push(entity);
    }
    // Helpers.log('setting all')
    await this.setBulk(all, classFN);
    //#endregion
  }
  //#endregion

  //#region api / set buld
  async setBulk(entites: DBBaseEntity[], classFN: Function): Promise<boolean> {
    //#region @backendFunc
    if (!_.isArray(entites)) {
      Helpers.error(`[db-crud] setBuild - this is not array of entities`);
    }
    if (entites.length === 0 && !_.isFunction(classFN)) {
      Helpers.error(`Please provide class function in setBuild(entites, <class function hrere>)`);
    }
    const className = _.isFunction(classFN) ? CLASS.getName(classFN) :
      CLASS.getNameFromObject(_.first(entites));



    const entityName = Models.db.getEntityNameByClassName(className);

    if (entityName === 'commands') { // TODO QUICK_FIX
      return true;
    }

    const json = [];
    for (let index = 0; index < entites.length; index++) {
      const c = entites[index];
      const prepared = await this.preprareEntityForSave(c);
      delete prepared['data'];
      json.push(prepared);
    }
    // console.log(`[setBulk] set json for entity ${entityName}`, json)
    await this.db.read();
    await this.db.set(entityName, json).write();
    return true;
    //#endregion
  }
  //#endregion

  //#region api / init controllers
  initControllers() {
    for (let index = 0; index < this.controllers.length; index++) {
      // const ctrl = this.controllers[index];
      this.controllersInstances[index] = new (this.controllers[index] as any)(this);
    }
  }
  //#endregion

  //#region api / add exited values
  async addExitedValues(recreateScope = {}) {
    for (let index = 0; index < this.controllersInstances.length; index++) {
      const ctrl = this.controllersInstances[index];
      await ctrl.addExisted(recreateScope);
    }
  }
  //#endregion

  //#region api / after retrive
  protected async afterRetrive<T = any>(value: any, entityName: string)
    : Promise<DBBaseEntity> {
    //#region @backendFunc
    delete value['data'];

    const entites = this.entities;
    for (let index = 0; index < entites.length; index++) {
      const entityClassFn = entites[index];
      if (entityName === Models.db.getEntityNameByClassFN(entityClassFn)) {
        // @ts-ignore
        const v = new (entityClassFn as any)(value) as DBBaseEntity<any>;
        const prepared = await v.prepareInstance();
        return prepared;
      }
    }



    return value;
    //#endregion
  }
  //#endregion

  //#region api / prepare entity for save
  protected async preprareEntityForSave(entity: DBBaseEntity) {
    //#region @backendFunc
    Helpers.log(`prerpare entity, typeof ${typeof entity} `, 1);

    const entities = this.entities;

    entities
      .find(f => {
        if (!f) {
          throw new Error(`Undefined instance of class. Probably circural dependency`);
        }
        return false;
      });

    for (let index = 0; index < entities.length; index++) {
      const entityClassFN = entities[index];
      if (entity.entityName === Models.db.getEntityNameByClassFN(entityClassFN)) {
        entity = await entity.prepareInstance();
        const prepared = await entity.getRawData();
        delete prepared['data']
        return prepared;
      }
    }
    Helpers.warn(`[tnp-db] local entity not found four ${entity?.entityName}`, true)

    return entity;
    //#endregion
  }
  //#endregion

  //#endregion
}

