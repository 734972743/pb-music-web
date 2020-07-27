/*
 * @Author: your name
 * @Date: 2019-12-20 16:08:47
 * @LastEditTime: 2020-06-25 18:21:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\utils\auth.js
 */

const USER_KEY = "pb-music-user";
const COLLECTION_KEY = "pb-music-collection";

const PAGE_QUERY_KEY = "pb-music-page-query";

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

//下面是保存分页查询信息的

export function savePageQuery(pageQuery) {
  return localStorage.setItem(PAGE_QUERY_KEY, JSON.stringify(pageQuery));
}

export function getPageQuery() {
  return JSON.parse(localStorage.getItem(PAGE_QUERY_KEY));
}

export function removePageQuery() {
  return localStorage.removeItem(PAGE_QUERY_KEY);
}
