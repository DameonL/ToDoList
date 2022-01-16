export class ToDoItemCard {
    #backingData = null;
    #cardHtml = `
    <div class="itemDeleteDialogCenter" boundField="name"></div>
    `;

    constructor(backingData) {
        this.#backingData = backingData;
    }

    Render() {
        let documentHider = document.createElement("div");
        documentHider.className = "itemDeleteDialog";
        
        let newNode = document.createRange().createContextualFragment(this.#cardHtml.trim()).firstChild;
        newNode.innerHTML = this.#cardHtml;
        
        newNode.appendChild(documentHider);
        document.body.appendChild(newNode);

        let propertyNames = Object.keys(this.#backingData);
        propertyNames.forEach(property => {
            let boundField = document.querySelector(`[boundField="${property}"]`);
            if (boundField) {
                boundField.innerHTML = this.#backingData[property];
            }
        });
    }
}