export class ToDoDatabase {
    #items = [];
    #itemChangedHandlers = [];
    #listChangedHandlers = [];

    get count() { return this.#items.length; }

    constructor() {
        let dbOpenRequest = window.indexedDB.open("ToDoList", 1);
        dbOpenRequest.onupgradeneeded = this.#InitializeDatabase;
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction("items", "readonly");
            let store = transaction.objectStore("items");
        
            store.getAll().onsuccess = (event) => {
                this.#items = event.target.result;
                db.close();
                this.#listChangedHandlers.forEach(x => {
                    x({item: [...this.#items]});
                });        
            };
        }
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
            x({item: [...this.#items]});
        });
    }

    DeleteItem(data) {
        let index = this.GetItemIndex(data);
        let deletedItem = this.#items[index];
        this.#items.splice(index, 1);

        let dbOpenRequest = window.indexedDB.open("ToDoList", 1);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction("items", "readwrite");
            let store = transaction.objectStore("items");
            let deleteRequest = store.delete(this.#items.length);

            transaction.oncomplete = () => {
                this.#listChangedHandlers.forEach(x => {
                    x({item: [...this.#items]});
                });
            }
        }
    }

    GetItemAt(index) {
        return items[index];
    }

    GetItemIndex(data) {
        return this.#items.indexOf(data);
    }

    GetItems() {
        return [...this.#items];
    }

    InsertItemBefore(priorItem, itemToInsert) {
        let insertIndex = this.GetItemIndex(priorItem);
        let oldIndex = this.GetItemIndex(itemToInsert);

        this.#items.splice(insertIndex, 0, this.#items.splice(oldIndex, 1)[0]);

        for (let i = 0; i < this.#items.length; i++) {
            this.UpdateItem(this.#items[i]);
        }

        this.#listChangedHandlers.forEach(x => {
            x({item: [...this.#items]});
        });
    }

    UpdateItem(data) {
        let dbOpenRequest = window.indexedDB.open("ToDoList", 1);
        dbOpenRequest.onsuccess = (event) => {
            let db = event.target.result;
            let transaction = db.transaction("items", "readwrite");
            let store = transaction.objectStore("items");
            let index = this.GetItemIndex(data);
            store.put(data, index);

            this.#itemChangedHandlers.forEach(x => {
                x({item: [...this.#items]});
            });
    }
    }

    #InitializeDatabase(event) {
        if (event.oldVersion == 0) {
            let db = event.target.result;
            let store = db.createObjectStore("items");
    
            store.put({name: "My New ToDo Item", description: "Insert description here"}, 0);
        }
    }
}
