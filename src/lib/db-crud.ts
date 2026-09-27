// src/lib/db-crud.ts

import { openDB } from "./db";

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function performTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = callback(store);

        if (request) {
          request.onsuccess = () => resolve(request.result as T);
          request.onerror = () => reject(request.error);
        } else {
          resolve(undefined as T);
        }

        transaction.oncomplete = () => {
          db.close();
        };
        transaction.onerror = () => reject(transaction.error);
      })
      .catch(reject);
  });
}

function getAllFromStore<T>(storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
        transaction.onerror = () => reject(transaction.error);
      })
      .catch(reject);
  });
}

// ========== CRUD-ОПЕРАЦИИ ==========

export function createRecord<T extends { id: string }>(
  storeName: string,
  data: Omit<T, "id">
): Promise<T> {
  const newRecord = { ...data, id: generateId() } as T;
  return performTransaction<T>(storeName, "readwrite", (store) =>
    store.add(newRecord)
  ).then(() => newRecord);
}

export function readRecord<T>(storeName: string, id: string): Promise<T | null> {
  return performTransaction<T | null>(storeName, "readonly", (store) => {
    const request = store.get(id);
    return request;
  });
}

// ✅ ИСПРАВЛЕННАЯ ВЕРСИЯ updateRecord
export function updateRecord<T extends { id: string }>(
  storeName: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        // 1. Получаем существующую запись
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          const existing = getRequest.result as T;
          if (!existing) {
            resolve(null);
            return;
          }

          // 2. Объединяем с обновлениями
          const updated = { ...existing, ...updates } as T;

          // 3. Сохраняем обратно
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => {
            resolve(updated); // ✅ Возвращаем обновлённую запись
          };
          putRequest.onerror = () => {
            reject(putRequest.error);
          };
        };

        getRequest.onerror = () => {
          reject(getRequest.error);
        };

        transaction.onerror = () => {
          reject(transaction.error);
        };
      })
      .catch(reject);
  });
}

export function deleteRecord(storeName: string, id: string): Promise<boolean> {
  return performTransaction<boolean>(storeName, "readwrite", (store) => {
    const request = store.delete(id);
    request.onsuccess = () => true;
    request.onerror = () => false;
    return request;
  });
}

export function getAllRecords<T>(storeName: string): Promise<T[]> {
  return getAllFromStore<T>(storeName);
}

export function clearStore(storeName: string): Promise<void> {
  return performTransaction<void>(storeName, "readwrite", (store) => {
    store.clear();
  });
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}