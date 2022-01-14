export class ItemDeleteDialog {
    #deleteDialogText = `
    <div class="itemDeleteDialogCenter">
        <div>This will permanently delete this To Do List entry. Are you sure you want to DELETE this entry?</div>
        <span>
            <button id="deleteDialogDelete">Delete</button>
        </span>
        <span>
            <button id="deleteDialogCancel">Cancel</button>
        </span>
    </div>
    `;

    #elementsToClear = [];

    constructor(toDoListItem, deleteItemHandler) {
        let pageHider = document.createElement("div");
        pageHider.className = "itemDeleteDialog";
        document.body.appendChild(pageHider);
        pageHider.addEventListener("click", (event) => {
            this.#removeDialogBox();
        });
        this.#elementsToClear.push(pageHider);

        let dialogBox = document.createElement("div");
        dialogBox.innerHTML = this.#deleteDialogText;
        document.body.appendChild(dialogBox);
        this.#elementsToClear.push(dialogBox);

        let deleteButton = document.getElementById("deleteDialogDelete");
        deleteButton.addEventListener("click", (event) => {
            this.#removeDialogBox();
            deleteItemHandler();
        });

        let cancelButton = document.getElementById("deleteDialogCancel");
        cancelButton.addEventListener("click", (event) => {
            this.#removeDialogBox();
        });
    }

    #removeDialogBox() {
        this.#elementsToClear.forEach(x => {
            document.body.removeChild(x);
        })
    }
}