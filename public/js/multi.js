if(!Array.prototype.secondIndexOf) {
    Array.prototype.secondIndexOf = function (elem) {
        let i = this.indexOf(elem);
        if(i === this.lastIndexOf(elem)) {
            return i;
        }
        
        return this.slice(i + 1, this.length).indexOf(elem) + i + 1;
    }
}


let a = new Board(document.getElementById("board"));
a.init();