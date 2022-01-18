import { ArrangeableList } from "./ArrangeableList/ArrangeableList.js";
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

let listDefinition = {
    listId: "toDoList",
    listHtml: `<div id="arrangeableListRender${this.listId}">
        <div class="arrangeableListItemHandle arrangeableListLabelHandle"></div><div class="arrangeableListItem arrangeableListLabel"></div>
    </div>`,
    itemMovementTargetHtml: `<div class="itemMovementTarget"></div>`,

    columnDefinitions: [
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
    ],

    itemButtonDefinitions: [
        {
            label: `<div title="Edit this item">📝</div>`,
            clickedHandler: (element, data) => {
                 let itemCard = new ToDoItemCard(data, () => toDoList.Render());
            }
        },
        {
            label: `<div title="Delete this item">🗑️</div>`,
            clickedHandler: (element, data) => { new ItemDeleteDialog(() => { database.DeleteItem(data); }); }
        },
    ],

    labelButtonDefinitions: [
        {
            label: `<span title="Create a new item" style="cursor: pointer;display: flex;flex-direction: row;justify-content: flex-end;">
                <div style="
                position: relative;
                font-size: 10px;
                width: 0%;
                height: 0%;
                ">➕</div>
                <div>📄</div>
            </span>`,
            clickedHandler: (event) => {
                let data = {
                    name: "New ToDo Item",
                    description: "Insert description here",
                    complete: false 
                };
        
                database.InsertItemBefore(data, database.GetItemAt(0));
            }
        },
    ],

    itemIndexHandler: (data) => database.GetItemIndex(data),
    itemInsertHandler: (itemToInsert, priorItem) => database.InsertItemBefore(itemToInsert, priorItem),
}

Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    toDoList = new ArrangeableList(listDefinition);
    document.body.appendChild(toDoList.RootNode);
    database.AddListChangedHandler((newListData) => { toDoList.ItemData = newListData; });
}

