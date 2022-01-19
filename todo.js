import { ArrangeableList } from "./ArrangeableList/ArrangeableList.js";
import { listDefinition, database, getNewItem, editNewItem } from "./ToDoListDefinition.js";


let toDoList = null;
toDoList = new ArrangeableList(listDefinition);
document.body.appendChild(toDoList.RootNode);

database.AddListChangedHandler((newListData) => {
    toDoList.ItemData = newListData;
    let addButton = document.querySelector("#newItemButton");
    if (addButton) {
        addButton.addEventListener("click", () => {
            let newItem = getNewItem();
            editNewItem(newItem);
        });
    }
});

toDoList.ItemData = database.Items;

let renderButton = document.createElement("button");
renderButton.addEventListener("click", () => toDoList.Render());
document.body.appendChild(renderButton);

function Start() {
    if (!('indexedDB' in window)) {
        document.getRootNode().innerHTML = "Sorry, your browser does not support indexedDB";
        return;
    }
}