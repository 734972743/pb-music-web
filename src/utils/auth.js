const USER_KEY = "pb-music-user";
const COLLECTION_KEY = "pb-music-collection";

//这个是信息保存到本地localStorage中

export function saveUser(user) {
  
  return localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

export function removeUser() {
  return localStorage.removeItem(USER_KEY);
}

//下面是保存歌曲收藏夹信息的

export function saveCollection(collection) {
  return localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
}

export function getCollection() {
  return JSON.parse(localStorage.getItem(COLLECTION_KEY));
}

export function removeCollection() {
  return localStorage.removeItem(COLLECTION_KEY);
}
