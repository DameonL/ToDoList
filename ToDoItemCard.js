export class ToDoItemCard {
    #backingData = null;
    #cardHtml = `
    <div class="itemDeleteDialogCenter">
        <div>
            <span boundField="name"></span>
        </div>
        <div boundfield="description"></div>
    </div>
    `;

    constructor(backingData) {
        this.#backingData = backingData;
    }

    Render() {
        let documentHider = document.createElement("div");
        documentHider.className = "itemDeleteDialog";
        
        let cardNode = document.createRange().createContextualFragment(this.#cardHtml.trim()).firstChild;
        cardNode.innerHTML = this.#cardHtml;
        
        document.body.appendChild(documentHider);
        document.body.appendChild(cardNode);

        let propertyNames = Object.keys(this.#backingData);
        propertyNames.forEach(property => {
            let boundField = document.querySelector(`[boundField="${property}"]`);
            if (boundField) {
                if ((boundField.nodeName == "DIV") || (boundField.nodeName == "SPAN")) {
                    boundField.innerHTML = this.#backingData[property];
                }
                else if ((boundField.nodeName == "INPUT") && (boundField.getAttribute("type") == "checkbox")) {
                    boundField.checked = this.#backingData[property];
                }
            }
        });
    }
}