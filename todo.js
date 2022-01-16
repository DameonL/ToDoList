import { ToDoList } from "./ToDoList.js";
import { ToDoDatabase } from "./ToDoDatabase.js";
import { ItemDeleteDialog } from "./ItemDeleteDialog.js";

let toDoList = null;
let database = new ToDoDatabase("ToDoList", "items");
let textDrawHandler = (element, data) => {
    element.style.textDecoration = (data.complete) ? "line-through" : "";
    element.contentEditable = (data.complete) ? false : true;
}
let itemUpdatedHandler = (data) => { database.UpdateItem(data); }

let columnDefinitions = [
    {
        label: "",
        width: "1.25em",
        backingDataName: "complete",
        updateHandler: itemUpdatedHandler,
    },
    {
        width: "25%",
        backingDataName: "name",
        drawHandler: textDrawHandler,
        updateHandler: itemUpdatedHandler
    },
    {
        width: "50%",
        backingDataName: "description",
        multiLine: true,
        drawHandler: textDrawHandler,
        updateHandler: itemUpdatedHandler
    },
];

let itemButtonDefinitions = [
    {
        label: "🖹",
        tooltip: "Edit this item",
        clickedHandler: (element, data) => {  }
    },
    {
        label: "🗑",
        tooltip: "Delete this item",
        clickedHandler: (element, data) => { new ItemDeleteDialog(() => { database.DeleteItem(data); }); }
    },
];

Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    let newItemHandler = () => 
    {
        let data = {
            name: "New ToDo Item",
            description: "Insert description here",
            complete: false 
        };

        database.AddItem(data);
        database.InsertItemBefore(data, database.GetItemAt(0));
    };

    let itemIndexHandler = (data) => database.GetItemIndex(data);
    let insertHandler = (itemToInsert, priorItem) => database.InsertItemBefore(itemToInsert, priorItem);

    toDoList = new ToDoList(newItemHandler, insertHandler, itemIndexHandler, columnDefinitions, itemButtonDefinitions);
    database.AddListChangedHandler((newListData) => { toDoList.ItemData = newListData; });

    document.body.appendChild(toDoList.RootNode);
}

