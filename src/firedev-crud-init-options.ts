export interface FiredevCrudInitOptions {
  recreate?: boolean;
  alreadyInitedDb?: boolean;
  defaultValuesOverride?: { [entityName: string]: any[]; }
  transformPathDb?: (p: string) => string;
  location?: string,
  callbackCreation?: Promise<any>,
}
