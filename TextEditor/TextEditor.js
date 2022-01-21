export class TextEditor {
    #rootNode = null;
    #editorNode = null;
    #editingText = "";
    #parentElement = null;
    #saveHandlers = [];
    #lastFocusedField = null;
    #lastFocusedFieldPosition = -1;
    #editorHTML = `
<div class="textEditor">
    <div class="textEditorToolBar">
        <div>
            <button id="insertList"><div>•1</div><div>•2</div><div>•3</div></button>
        </div>
        <div>
            <button id="insertCheckList"><div>□1</div><div>□2</div><div>□3</div></button>
        </div>
        <div>
            <select id="listTypeSelector" name="listTypes">
                <option value="disc">⚫</option>
                <option value="none">None</option>
                <option value="circle">⚪</option>
                <option value="square">◼</option>
                <option value="decimal">1,2,3</option>
                <option value="upper-roman">I,II,III</option>
                <option value="lower-roman">i,ii,iii</option>
                <option value="upper-alpha">A,B,C</option>
                <option value="lower-alpha">a,b,c</option>
            </select>
        </div>
    </div>
    <div class="editorTarget"></div>
</div>
    `;

    get EditorText() { return this.#editorNode.innerHTML; }
    set EditorText(newText) { this.#editingText = newText; this.#editorNode.innerHTML = newText; }
    get Enabled() { return this.#editorNode.getAttribute("contenteditable") == true; }
    set Enabled(newValue) { this.#editorNode.setAttribute("contenteditable", newValue == true); }
    
    constructor() {
        this.#rootNode = document.createRange().createContextualFragment(this.#editorHTML.trim()).firstChild;
        this.#editorNode = this.#rootNode.querySelector(`.editorTarget`);
        this.#editorNode.addEventListener("focusout", (event) => this.#RememberSelection(event));
        this.#lastFocusedField = this.#editorNode;
        this.#lastFocusedFieldPosition = 0;
        this.#InitializeToolBar();
        this.#InitializeEditorField();
    }

    AttachTo(targetNode) {
        targetNode.appendChild(this.#rootNode);
    }

    #InitializeEditorField() {
        let boundElement = this.#editorNode;
        boundElement.addEventListener("keypress", (event) => {
            if (event.key == "Enter") {
                let selection = document.getSelection();
                if (selection.anchorNode != undefined) {
                    let listNode = selection.anchorNode.parentElement;
                    if (listNode.firstChild.nodeName == "INPUT" && listNode.firstChild.type == "checkbox") {
                        if (listNode.innerText.trim() == "") {
                            let afterDiv = document.createElement("div");
                            afterDiv.innerHTML = "&nbsp;";
                            listNode.parentElement.after(afterDiv);
                            listNode.parentElement.removeChild(listNode);
                            selection.collapse(afterDiv, 1);
                            event.preventDefault();
                            return false;
                        }

                        let newCheckbox = this.#CreateCheckmarkListItem();
                        listNode.after(newCheckbox);
                        selection.collapse(newCheckbox, 1);
                        event.preventDefault();
                        return false;
                    }
                }
            }
        });

        boundElement.addEventListener("keydown", (event) => {
            if (event.key == "Backspace") {
                let selection = document.getSelection();
                let selectionRange = selection.getRangeAt(0);
                if ((selectionRange.startOffset == 1) && (selectionRange.startContainer.nodeName == "LI") && (selectionRange.startContainer.firstChild.type == "checkbox")) {
                    selection.modify("move", "left", "word");
                    selectionRange.startContainer.parentElement.removeChild(selectionRange.startContainer);
                    event.preventDefault();
                    return false;
                }

                let anchorNode = document.getSelection().anchorNode;
                if (anchorNode != undefined && anchorNode.previousSibling == null && anchorNode.parentElement.nodeName == "UL") {
                    event.preventDefault();
                    anchorNode.parentElement.parentElement.removeChild(anchorNode.parentElement);
                    return false;
                }
            }
        });

        let checkboxes = boundElement.querySelectorAll(`input[type="checkbox"]`);
        checkboxes.forEach(checkbox => this.#AddCheckBoxListener(checkbox));
    }

    #AddCheckBoxListener(checkbox) {
        checkbox.addEventListener("click", (event) => {
            if (checkbox.checked) { checkbox.setAttribute("checked", ""); }
            else { checkbox.removeAttribute("checked"); }
        });
    }

    #InitializeToolBar() {
        let listStyleDropdown = this.#rootNode.querySelector("#listTypeSelector");
        listStyleDropdown.addEventListener("change", (event) => this.#ToolBarListStyleChanged(event));

        let insertListButton = this.#rootNode.querySelector("#insertList");
        insertListButton.addEventListener("click", (event) => this.#InsertList(event));

        let insertCheckListButton = this.#rootNode.querySelector("#insertCheckList");
        insertCheckListButton.addEventListener("click", (event) => this.#InsertCheckList(event));
    }

    #ToolBarListStyleChanged(event) {
        let targetList = this.#GetParentList(this.#lastFocusedField);
        let listStyleDropdown = this.#rootNode.querySelector("#listTypeSelector");

        if (targetList) {
            targetList.style.listStyle = listStyleDropdown.options[listStyleDropdown.selectedIndex].value;
        }
    }

    #GetParentList(targetList) {
        while (targetList && targetList.nodeName != "UL" && targetList.nodeName != "OL") {
            targetList = targetList.parentNode;
        }
        return targetList;
    }

    #InsertCheckList(event) {
        let descriptionInput = this.#rootNode.querySelector(`[boundField="description"]`);
        let listElement = document.createElement("ul");
        let defaultItem = this.#CreateCheckmarkListItem();
        listElement.appendChild(defaultItem);
        this.#InsertNode(listElement);
    }

    #CreateCheckmarkListItem() {
        let defaultItem = document.createElement("li");
        defaultItem.className = "checkList";
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        defaultItem.appendChild(checkbox);
        defaultItem.innerHTML += "&nbsp";
        return defaultItem;
    }
    
    #InsertList(event) {
        let descriptionInput = this.#rootNode.querySelector(`[boundField="description"]`);
        let listElement = document.createElement("ul");
        let defaultItem = document.createElement("li");
        defaultItem.innerHTML = "My new list item";
        listElement.appendChild(defaultItem);
        this.#InsertNode(listElement);
    }

    #InsertNode(nodeToInsert) {
        if (this.#lastFocusedField.nodeName == "#text") {
            let content = this.#lastFocusedField.textContent;
            let text1 = content.substring(0, this.#lastFocusedFieldPosition);
            let text2 = content.substring(this.#lastFocusedFieldPosition, content.length);
            this.#lastFocusedField.textContent = text1;
            let newTextNode = document.createTextNode(text2);
            this.#lastFocusedField.after(nodeToInsert);
            nodeToInsert.after(newTextNode);
        }
        else {
            this.#lastFocusedField.after(nodeToInsert);
        }

        document.getSelection().collapse(nodeToInsert, 1);
    }

    #RememberSelection(event) {
        let selection = document.getSelection();
        this.#lastFocusedField = selection.focusNode;
        this.#lastFocusedFieldPosition = selection.focusOffset;
    }
}