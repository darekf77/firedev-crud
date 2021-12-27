
export interface IDBCrud {
  read: () => Promise<any>;
  defaults: (any) => { write: () => Promise<any>; }
  set: (objPath: string, json: object) => { write: () => Promise<any>; }
  get: (objPath: string) => { value: () => Promise<any>; }
}
