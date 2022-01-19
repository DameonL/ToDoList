import { ArrangeableList } from "./ArrangeableList/ArrangeableList.js";
import { OrderedIndexedDb } from "./OrderedIndexedDb.js";
import { ItemDeleteDialog } from "./ItemDeleteDialog.js";
import { ToDoItemCard } from "./ToDoItemCard/ToDoItemCard.js";

let toDoList = null;
let getNewItem =  () =>{
    let data = {
        name: "New ToDo Item",
        description: "Insert description here",
        complete: false ,
        dueDate: Date.now().setHours(Date.now().getHours() + 1),
    }   
};

let database = new OrderedIndexedDb("ToDoList", "items", getNewItem);
let itemDrawHandler = (htmlElement, data) => {
    if (data.dueDate < Date.now()) {
        htmlElement.style.backgroundColor = "#ffe7e6";
    }
}

let textDrawHandler = (element, data) => {
    element.style.textDecoration = (data.complete) ? "line-through" : "";
    element.contentEditable = (data.complete) ? false : true;
}
let itemUpdatedHandler = (data) => { database.UpdateItem(data); }
let itemIndexHandler = (data) => database.GetItemIndex(data);
let itemInsertHandler = (itemToInsert, priorItem) => database.InsertItemBefore(itemToInsert, priorItem);

let listDefinition = {
    listHtml: `
        <div id="toDoListRender">
        </div>
    `,

    labelHtml: `
        <div class="arrangeableListItem arrangeableListLabel">
            <div class="arrangeableListItemHandle arrangeableListLabelHandle"></div>
            <div class="arrangeableListCheckbox completeCheckBox"></div>
            <div class="arrangeableListTextInput nameInputField">Name</div>
            <div class="arrangeableListTextInput descriptionInputField">Description</div>
            <div class="arrangeableListItemButtons arrangeableListLabelButtons">
                <span title="Create a new item" id="newItemButton" style="cursor: pointer;display: flex;flex-direction: row;justify-content: flex-end;">
                    <div style="position: relative;font-size: 10px;width: 0%;height: 0%;">➕</div>
                    <div>📄</div>
                </span>
            </div>
        </div>
    `,

    listItemHtml: `
        <div class="arrangeableListItem">
            <div class="arrangeableListItemHandle"></div>
            <div class="completeCheckBox" boundField="complete"></div>
            <div class="nameInputField" boundField="name"></div>
            <div class="descriptionInputField" boundField="description">Description</div>
            <div class="arrangeableListItemButtons"></div>
        </div>
    `,

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
            targetSelector: ".arrangeableListItemButtons",
            clickedHandler: (element, data) => {
                 let itemCard = new ToDoItemCard(data, () => {
                    database.UpdateItem(data);
                    toDoList.Render();
                 });
            }
        },
        {
            label: `<div title="Delete this item">🗑️</div>`,
            targetSelector: ".arrangeableListItemButtons",
            clickedHandler: (element, data) => { new ItemDeleteDialog(() => { database.DeleteItem(data); }); }
        },
    ],

    itemDrawHandler: itemDrawHandler,
    itemIndexHandler: itemIndexHandler,
    itemInsertHandler: itemInsertHandler,
}

Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    toDoList = new ArrangeableList(listDefinition);
    document.body.appendChild(toDoList.RootNode);
    let addButton = document.querySelector("#newItemButton");
    addButton.addEventListener("click", () => { database.InsertItemBefore(database.GetItemAt(0)); });
    database.AddListChangedHandler((newListData) => { toDoList.ItemData = newListData; });
}

