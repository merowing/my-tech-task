import { storage } from './localstorage.js';

const len = storage().length;
const start = (len > 0) ? storage()[len - 1].id : -1;

const createID = (id) => () => ++id;
const unique = createID(start);
export default unique;
