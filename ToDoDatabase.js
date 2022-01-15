export class ToDoDatabase {
    #databaseName = "";
    #tableName = "";
    #items = [];
    #itemChangedHandlers = [];
    #listChangedHandlers = [];

    get count() { return this.#items.length; }

    constructor(databaseName, tableName) {
        this.#databaseName = databaseName;
        this.#tableName = tableName;

        let dbOpenRequest = window.indexedDB.open(this.#databaseName, 1);
        dbOpenRequest.onupgradeneeded = this.#InitializeDatabase;
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction(this.#tableName, "readonly");
            let store = transaction.objectStore(this.#tableName);

            store.getAll().onsuccess = (event) => {
                this.#items = event.target.result;
                db.close();
                this.#listChangedHandlers.forEach(x => {
                    x({ item: [...this.#items] });
                });
            };
        }
    }

    GetItemAt(index) {
        return items[index];
    }

    GetItemIndex(data) {
        return this.#items.indexOf(data);
    }

    AddItemChangedHandler(handler) {
        this.#itemChangedHandlers.push(handler);
    }

    RemoveItemChangedHandler(handler) {
        let index = this.#itemChangedHandlers.indexOf(handler);
        if (index == -1) return;

        this.#itemChangedHandlers.splice(index, 1);
    }

    AddListChangedHandler(handler) {
        this.#listChangedHandlers.push(handler);
    }

    RemoveListChangedHandler(handler) {
        let index = this.#listChangedHandlers.indexOf(handler);
        if (index == -1) return;

        this.#listChangedHandlers.splice(index, 1);
    }

    AddItem(data) {
        this.#items.push(data);
        this.UpdateItem(data);
        this.#listChangedHandlers.forEach(x => {
            x({ item: [...this.#items] });
        });
    }

    DeleteItem(data) {
        let index = this.GetItemIndex(data);
        let deletedItem = this.#items[index];
        this.#items.splice(index, 1);

        for (let i = 0; i < this.#items.length; i++) {
            this.UpdateItem(this.#items[i]);
        }

        let dbOpenRequest = window.indexedDB.open(this.#databaseName, 1);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction(this.#tableName, "readwrite");
            let store = transaction.objectStore(this.#tableName);
            let deleteRequest = store.delete(this.#items.length);

            transaction.oncomplete = () => {
                this.#listChangedHandlers.forEach(x => {
                    x({ item: [...this.#items] });
                });
            }
        }
    }

    GetItems() {
        return [...this.#items];
    }

    InsertItemBefore(priorItem, itemToInsert) {
        let insertIndex = this.GetItemIndex(priorItem);
        let oldIndex = this.GetItemIndex(itemToInsert);

        if (insertIndex == oldIndex + 1) { return; }
        else if (insertIndex == -1) {
            this.#items.push(this.#items.splice(oldIndex, 1)[0]);
        } else {
            this.#items.splice(insertIndex, 0, this.#items.splice(oldIndex, 1)[0]);
        }

        for (let i = 0; i < this.#items.length; i++) {
            this.UpdateItem(this.#items[i]);
        }

        this.#listChangedHandlers.forEach(x => {
            x({ item: [...this.#items] });
        });
    }

    UpdateItem(data) {
        let dbOpenRequest = window.indexedDB.open(this.#databaseName, 1);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction(this.#tableName, "readwrite");
            let store = transaction.objectStore(this.#tableName);
            let index = this.GetItemIndex(data);
            store.put(data, index);

            this.#itemChangedHandlers.forEach(x => {
                x({ item: [...this.#items] });
            });
        }
    }

    #InitializeDatabase(event) {
        if (event.oldVersion == 0) {
            let db = event.target.result;
            let store = db.createObjectStore(this.#tableName);

            store.put({ name: "My New ToDo Item", description: "Insert description here" }, 0);
        }
    }
}
