export class TextEditor {
    #rootNode = null;
    #editorNode = null;
    #toolBarNode = null;
    #editingText = "";
    #parentElement = null;
    #saveHandlers = [];
    #lastFocusedField = null;
    #lastFocusedFieldPosition = -1;
    #fontColor = null;

    #editorHTML = `
<div class="textEditor">
    <div class="textEditorToolBar">
        <div class="toolBarButton">
            <button id="insertList"><ul><li><span>a</span></li><li><span>b</span></li><li><span>c</span></li></ul></button>
        </div>
        <div class="toolBarButton">
            <button id="insertCheckList"><ul><li><span>☑</span></li><li><span>☑</span></li><li><span>☑</span></li></ul></button>
        </div>
        <div class="toolBarButton">
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
        <div class="toolBarButton">
            <input id="fontColorSelector" type="color">
            <div style="
                position: relative;
                top: -75%;
                font-size: 10px;
                text-align: center;
                width: 30px;
                height: 30px;
                pointer-events: none;
                ">ABC
            </div>
        </div>
    </div>
    <div class="editorTarget"></div>
</div>
    `;

    get EditorText() { return this.#editorNode.innerHTML; }
    set EditorText(newText) {
        this.#editingText = newText;
        this.#editorNode.innerHTML = newText;
        let checkboxes = this.#editorNode.querySelectorAll(`input[type="checkbox"]`);
        checkboxes.forEach(checkbox => this.#AddCheckBoxListener(checkbox));
    }
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
        this.#fontColor = "#000000";
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
                    let listNode = selection.anchorNode;
                    while (listNode && listNode.nodeName != "LI") listNode = listNode.parentElement;

                    if (!listNode) return true;

                    if ((listNode.firstChild) && (listNode.firstChild.nodeName == "INPUT") && (listNode.firstChild.type == "checkbox")) {
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
    }

    #AddCheckBoxListener(checkbox) {
        checkbox.addEventListener("change", (event) => {
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

        let fontColorButton = this.#rootNode.querySelector("#fontColorSelector");
        //        fontColorButton.addEventListener("change", (event) => this.#ChangeFontColor(event));
        fontColorButton.addEventListener("input", (event) => this.#ChangeFontColor(event));


        this.#toolBarNode = this.#rootNode.querySelector(".textEditorToolBar");
    }

    #ToolBarListStyleChanged(event) {
        let targetList = this.#GetParentList(this.#lastFocusedField);
        let listStyleDropdown = this.#rootNode.querySelector("#listTypeSelector");
        let insertListButtonList = this.#rootNode.querySelector("#insertList > ul");
        let insertCheckListButtonList = this.#rootNode.querySelector("#insertCheckList > ul");
        let selectedStyle = listStyleDropdown.options[listStyleDropdown.selectedIndex].value;

        insertListButtonList.style.listStyle = selectedStyle;
        insertCheckListButtonList.style.listStyle = selectedStyle;

        if (targetList) {
            targetList.style.listStyle = selectedStyle;
        }
    }

    #GetParentList(targetList) {
        while (targetList && targetList.nodeName != "UL" && targetList.nodeName != "OL") {
            targetList = targetList.parentNode;
        }
        return targetList;
    }

    #InsertCheckList() {
        let listElement = document.createElement("ul");
        let defaultItem = this.#CreateCheckmarkListItem();
        listElement.appendChild(defaultItem);
        let textNode = document.createTextNode("My new check item");
        defaultItem.appendChild(textNode);
        this.#InsertNode(listElement);
        document.getSelection().collapse(textNode, textNode.length);
    }

    #CreateCheckmarkListItem() {
        let defaultItem = document.createElement("li");
        defaultItem.className = "checkList";
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        this.#AddCheckBoxListener(checkbox);
        defaultItem.appendChild(checkbox);
        return defaultItem;
    }

    #InsertList() {
        let listElement = document.createElement("ul");
        let defaultItem = document.createElement("li");
        defaultItem.innerHTML = "My new list item";
        listElement.appendChild(defaultItem);
        this.#InsertNode(listElement);
    }

    #InsertNode(nodeToInsert) {
        let listStyleDropdown = this.#rootNode.querySelector("#listTypeSelector");
        nodeToInsert.style.listStyle = listStyleDropdown.options[listStyleDropdown.selectedIndex].value;
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
            if (this.#lastFocusedField == this.#editorNode) {
                this.#editorNode.appendChild(nodeToInsert);
            } else {
                this.#lastFocusedField.after(nodeToInsert);
            }
        }

        document.getSelection().collapse(nodeToInsert, 1);
    }

    #ChangeSelectionStyle(styleChangeCallback) {
        let selection = document.getSelection();
        let range = selection.getRangeAt(0);
        let startContainer = range.startContainer
        if (range.startContainer instanceof Text) {
            if ((range.startContainer === range.endContainer) && (range.startOffset == 0 && range.endOffset == range.startContainer.nodeValue.length)
             && range.startContainer.parentNode.classList.contains("textEditorFormatSpan")) {
                range.selectNode(range.startContainer.parentNode);
            }
        }

        let contents = range.extractContents();
        contents.childNodes.forEach(child => {
            let elementToChange = null;
            if (!(child instanceof Text) && child.classList.contains("textEditorFormatSpan")) {
                elementToChange = child;
            } else {
                if (!(range.startContainer instanceof Text) && (range.startContainer.classList.contains("textEditorFormatSpan"))) {
                    range.startContainer.appendChild(child);
                    elementToChange = range;
                } else {
                    let styleSpan = document.createElement("span");
                    styleSpan.classList.add("textEditorFormatSpan");
                    child.after(styleSpan);
                    child.parentNode.removeChild(child);
                    styleSpan.appendChild(child);
                    elementToChange = styleSpan;
                }
            }

            styleChangeCallback(elementToChange);
            if (elementToChange.getAttribute("style") == "") {
                let parentNode = elementToChange.parentNode;
                elementToChange.childNodes.forEach(child => {
                    elementToChange.before(child);
                });
                parentNode.removeChild(elementToChange);
                parentNode.normalize();
            }
        });
        range.insertNode(contents);
    }

    #ChangeFontColor(event) {
        let fontColorButton = this.#rootNode.querySelector("#fontColorSelector");
        let fontDisplay = fontColorButton.nextSibling.parentElement;
        let fontColor = fontColorButton.value;
        fontDisplay.style.color = fontColor;
        let callBack = (fontColor == "#000000") ? 
            (element) => element.style.setProperty("color", null)
            : (element) => element.style.setProperty("color", fontColor, "important");
        this.#ChangeSelectionStyle(callBack);
    }

    #RememberSelection(event) {
        let selection = document.getSelection();
        this.#lastFocusedField = selection.focusNode;
        this.#lastFocusedFieldPosition = selection.focusOffset;
    }
}