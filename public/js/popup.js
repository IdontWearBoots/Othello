class PopupType {

    static NEGATIVE_COLORS = {
        popup_main_bg_color: "#ff4b1f",
        popup_accent_color: "#ff3605",
        popup_text_color: "#9f1f00"
    }
    static POSITIVE_COLORS = {
        popup_main_bg_color: "#60E640",
        popup_accent_color: "#307320",
        popup_text_color: "#091706"
    }

    constructor(text, col) {
        this.element = document.getElementById("game-popup");
        this.content = text;
    
        for(let e of ["main_bg_color", "accent_color", "text_color"]) {
            if(!col[e]) {
                col[e] = "white";
            }
        }
        
        document.getElementById("close-popup").onclick = () => {
            this.hide();
        }

        this.style = col;
    }
    
    show() {
        for(let c of this.element.childNodes) {
            this.element.removeChild(c);
        }

        for(let e in this.content) {
            let c = document.createElement(e);
            c.innerHTML = this.content[e];
    
            this.element.appendChild(c);
        }
        
        for(let e in this.style) {
            document.documentElement.style.setProperty(`--${e}`, this.style[e]);
        }

        this.element.parentElement.parentElement.style.display = "flex";
        this.element.parentElement.parentElement.style.zIndex = 1;
    }

    hide() {
        this.element.parentElement.parentElement.style.display = "none";
    }
} 

class Popup {
    static INVALID_PLACEMENT = new PopupType({
        h4: "You cannot place a tile there, it does not flip any corresponding tiles",
    }, PopupType.NEGATIVE_COLORS);

    static BLACK_WINS = new PopupType({
        h4: "Black wins ! you played really badly white..."
    }, PopupType.POSITIVE_COLORS);

    static WHITE_WINS = new PopupType({
        h4: "White wins ! You were abysmall black..."
    }, PopupType.POSITIVE_COLORS)

    constructor(type) {
        type.show();
    }

    static use(customType) {
        Object.assign(Popup, { customType });        
    }
}