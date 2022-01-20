import { OrderedIndexedDb } from "./OrderedIndexedDb.js";
import { ToDoItemCard } from "./ToDoItemCard/ToDoItemCard.js";
import { ItemDeleteDialog } from "./ItemDeleteDialog.js";


export function getNewItem() {
    let dueDate = new Date(Date.now());
    let currentTime = new Date(Date.now());
    let hours = currentTime.getHours();
    dueDate.setHours(hours + 1);

    let data = {
        name: "New ToDo Item",
        description: "Insert description here",
        complete: false ,
        dueDate: dueDate.valueOf(),
    }

    return data;
};

export let database = new OrderedIndexedDb("ToDoList", "items", getNewItem);
export let editItem = (data) => {
    let itemCard = new ToDoItemCard(data, () => {
       database.UpdateItem(data);
    });
}

export let editNewItem = (data) => {
    let itemCard = new ToDoItemCard(data, () => {
        database.InsertItemBefore(data, database.GetItemAt(0));
     });
}


let itemDrawHandler = (htmlElement, data) => {
    if (!data.complete && data.dueDate < Date.now()) {
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

export let listDefinition = {
    listHtml: `
        <div id="toDoListRender">
        </div>
    `,

    labelHtml: `
        <div class="arrangeableListItem arrangeableListLabel">
            <div class="arrangeableListItemHandle arrangeableListLabelHandle"></div>
            <div class="arrangeableListCheckbox completeCheckBox" boundField="complete">◻</div>
            <div class="arrangeableListTextInput nameInputField" boundField="name">Name</div>
            <div class="arrangeableListTextInput descriptionInputField" boundField="description">Description</div>
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
            backingDataName: "complete",
            updateHandler: itemUpdatedHandler,
        },
        {
            backingDataName: "name",
            drawHandler: textDrawHandler,
            updateHandler: itemUpdatedHandler,
        },
        {
            backingDataName: "description",
            multiLine: true,
            drawHandler: textDrawHandler,
            updateHandler: itemUpdatedHandler
        },
    ],

    itemButtonDefinitions: [
        {
            label: `<div title="Edit this item">📝</div>`,
            targetSelector: ".arrangeableListItemButtons",
            clickedHandler: editItem,
        },
        {
            label: `<div title="Delete this item">🗑️</div>`,
            targetSelector: ".arrangeableListItemButtons",
            clickedHandler: (data) => { new ItemDeleteDialog(() => { database.DeleteItem(data); }); }
        },
    ],

    itemDrawHandler: itemDrawHandler,
    itemIndexHandler: itemIndexHandler,
    itemInsertHandler: itemInsertHandler,
}