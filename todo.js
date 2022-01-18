import { ArrangeableList } from "./ArrangeableList.js";
import { OrderedIndexedDb } from "./OrderedIndexedDb.js";
import { ItemDeleteDialog } from "./ItemDeleteDialog.js";
import { ToDoItemCard } from "./ToDoItemCard.js";

let toDoList = null;
let database = new OrderedIndexedDb("ToDoList", "items");
let textDrawHandler = (element, data) => {
    element.style.textDecoration = (data.complete) ? "line-through" : "";
    element.contentEditable = (data.complete) ? false : true;
}
let itemUpdatedHandler = (data) => { database.UpdateItem(data); }

let columnDefinitions = [
    {
        label: "",
        backingDataName: "complete",
        className: "completeCheckBox",
        updateHandler: itemUpdatedHandler,
    },
    {
        backingDataName: "name",
        className: "nameInputField",
        drawHandler: textDrawHandler,
        updateHandler: itemUpdatedHandler,
    },
    {
        backingDataName: "description",
        className: "descriptionInputField",
        multiLine: true,
        drawHandler: textDrawHandler,
        updateHandler: itemUpdatedHandler
    },
];

let itemButtonDefinitions = [
    {
        label: "📝",
        tooltip: "Edit this item",
        clickedHandler: (element, data) => {
             let itemCard = new ToDoItemCard(data, () => toDoList.Render());
             itemCard.Render();
        }
    },
    {
        label: "🗑️",
        tooltip: "Delete this item",
        clickedHandler: (element, data) => { new ItemDeleteDialog(() => { database.DeleteItem(data); }); }
    },
];

let labelButtonDefinitions = [
    {
        label: "<span>📄</span><span>+</span>",
        tooltip: "Create a new item",
        clickedHandler: (element, data) => {
            let data = {
                name: "New ToDo Item",
                description: "Insert description here",
                complete: false 
            };
    
            database.InsertItemBefore(data, database.GetItemAt(0));
        }
    },
];

Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    let itemIndexHandler = (data) => database.GetItemIndex(data);
    let insertHandler = (itemToInsert, priorItem) => database.InsertItemBefore(itemToInsert, priorItem);

    toDoList = new ArrangeableList(insertHandler, itemIndexHandler, columnDefinitions, labelButtonDefinitions, itemButtonDefinitions);
    document.body.appendChild(toDoList.RootNode);
    database.AddListChangedHandler((newListData) => { toDoList.ItemData = newListData; });

    let newItemButton = document.createElement("span");
    newItemButton.innerText = "+";
    newItemButton.title = "Create a new item";
    newItemButton.style.cursor = "pointer";
    newItemButton.addEventListener("click", newItemHandler);

    let labelHandle = toDoList.renderer.querySelector(".listLabelHandle");
    labelHandle.appendChild(newItemButton);
}

