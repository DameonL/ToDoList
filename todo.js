import { ToDoList } from "./ToDoList.js";
import { ItemDeleteDialog } from "./ItemDeleteDialog.js";

let toDoList = null;
let columnDefinitions = [
    {
        label: "",
        width: "1.25em",
        backingDataName: "complete",
    },
    {
        label: "Name",
        width: "25%",
        backingDataName: "name",
        drawHandler: (element, data) => {
             element.style.textDecoration = (data.complete) ? "line-through" : "";
             element.contentEditable = (data.complete) ? false : true;
        },
    },
    {
        label: "Description",
        width: "50%",
        backingDataName: "description",
        multiLine: true,
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
        clickedHandler: (element, data) => { new ItemDeleteDialog(() => { toDoList.DeleteItem(data); }); }
    },
];

Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    let newItemHandler = () => { return { name: "New ToDo Item", description: "Insert description here", complete: false } };

    toDoList = new ToDoList(newItemHandler, columnDefinitions, itemButtonDefinitions);
    document.body.appendChild(toDoList.RootNode);
}

