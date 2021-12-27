//#region @notForNpm
import { FiredevCrud } from './firedev-crud'

console.log('hello')

export default async function () {
  //#region @backend
  const app = FiredevCrud.from();
  await app.init();
  process.exit(0)
  //#endregion
}
//#endregion
