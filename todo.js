import { ArrangeableList } from "./ArrangeableList/ArrangeableList.js";
import { ItemDeleteDialog } from "./ItemDeleteDialog.js";
import { ToDoItemCard } from "./ToDoItemCard/ToDoItemCard.js";
import { listDefinition, database } from "./ToDoListDefinition.js";

let toDoList = null;

Start();

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }

    toDoList = new ArrangeableList(listDefinition);
    document.body.appendChild(toDoList.RootNode);
    database.AddListChangedHandler((newListData) => {
        toDoList.ItemData = newListData; 
        let addButton = document.querySelector("#newItemButton");
        addButton.addEventListener("click", () => {
            let newItem = getNewItem();
            editNewItem(newItem);
        });    
    });

    let renderButton = document.createElement("button");
    renderButton.addEventListener("click", () => toDoList.Render());
    document.body.appendChild(renderButton);
}

