//#region @notForNpm
import { FiredevCrud } from './lib/firedev-crud';

// console.log('hello');

export default async function () {
  //#region @backend
  const app = new FiredevCrud();
  await app.init();
  process.exit(0);
  //#endregion
}
//#endregion
