export class OrderedIndexedDb {
    #databaseName = "";
    #tableName = "";
    #items = [];
    #itemChangedHandlers = [];
    #listChangedHandlers = [];

    get count() { return this.#items.length; }

    constructor(databaseName, tableName) {
        this.#databaseName = databaseName;
        this.#tableName = tableName;

        let dbOpenRequest = window.indexedDB.open(databaseName, 1);
        dbOpenRequest.onupgradeneeded = this.#InitializeDatabase.bind(this);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction(tableName, "readonly");
            let store = transaction.objectStore(tableName);

            store.getAll().onsuccess = (event) => {
                this.#items = event.target.result;
                db.close();
                this.#ExecuteListChangedHandlers();
            };
        }
    }

    GetItemAt(index) {
        return this.#items[index];
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
        this.#ExecuteListChangedHandlers();
    }

    DeleteItem(data) {
        let index = this.GetItemIndex(data);
        this.#items.splice(index, 1);

        for (let i = index; i < this.#items.length; i++) {
            this.UpdateItem(this.#items[i]);
        }

        let dbOpenRequest = window.indexedDB.open(this.#databaseName, 1);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction(this.#tableName, "readwrite");
            let store = transaction.objectStore(this.#tableName);
            store.delete(this.#items.length);

            transaction.oncomplete = () => { this.#ExecuteListChangedHandlers(); }
        }
    }

    #ExecuteListChangedHandlers() {
        this.#listChangedHandlers.forEach(x => {
            x([...this.#items]);
        });
    }

    GetItems() {
        return [...this.#items];
    }

    InsertItemBefore(itemToInsert, priorItem) {
        if (itemToInsert == priorItem) return;
        
        let insertIndex = this.GetItemIndex(priorItem);
        let oldIndex = this.GetItemIndex(itemToInsert);

        
        if ((oldIndex > -1) && (insertIndex == oldIndex + 1)) {
            return; 
        }

        if (oldIndex > -1) this.#items.splice(oldIndex, 1);

        if (!priorItem) {
            this.#items.push(itemToInsert);
        } else {
            this.#items.splice(this.GetItemIndex(priorItem), 0, itemToInsert);
        }

        for (let i = 0; i < this.#items.length; i++) {
            this.UpdateItem(this.#items[i]);
        }

        this.#ExecuteListChangedHandlers();
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
                x(data);
            });
        }
    }

    #InitializeDatabase(event) {
        if (event.oldVersion == 0) {
            let db = event.target.result;
            let store = db.createObjectStore(this.#tableName);

            for (let i = 0; i < 3; i++) {
                store.put({ name: `My New ToDo Item ${i}`, description: "Insert description here", complete: false }, i);
            }
        }
    }
}
