//Updated: 10-07-2020, 13:37

var n = 14; // We use this and count from zero, so the value here, is one less than the dimension.
var orientation = true; // true means horizontal, false means vertical
var xword_string = "";
var recent_move = 1;
var old_word= " ";
 var suggested_word;
var coord_pos = [0,0];
for (var i = 0; i <= n; i += 1) {
    for (var j = 0; j <= n; j += 1){
        xword_string = xword_string.concat('<input id=\"'.concat(i.toString()).concat(" ").concat(j.toString()).concat('\" class=\"one_box\">'));
    }
    xword_string = xword_string.concat('<br>');
}
document.getElementById("x-word").innerHTML = xword_string;

var one_boxes = document.getElementsByClassName("one_box");
for (const one_box of one_boxes) {
    one_box.addEventListener("keydown", one_box_keydown);
    one_box.addEventListener("input", one_box_input);
    one_box.addEventListener("mousedown", one_box_click);
    one_box.addEventListener("focus", one_box_focus);
    one_box.style.border = "1px solid black";
}

function one_box_keydown(e){
    if (e.key.length == 1) { // Detects if the key pressed is a letter key
        this.value = '';
    }else if((e.which >= 37) && (e.which <= 40)){ // Detects if the key pressed is an arrow key
        if (e.which == 37) { // Left arrow key behavior
            if (orientation) {
                left_move();
            } else {
                orientation = true;
            }
        }
        else if (e.which == 38) { // Up arrow key behavior
            if (!(orientation)) {
                up_move();
            } else {
                orientation = false;
            }
        }
        else if (e.which == 39) { // Right arrow key behavior
            if (orientation) {
                right_move();
            } else {
                orientation = true;
            }
        }
        else if (e.which == 40) { // Down arrow key behavior
            if (!(orientation)) {
                down_move();
            } else {
                orientation = false;
            }
        }
    }
    else if (e.which == 8) { // Detects if Backspace was pressed:
        this.value = '';
        if (orientation) {
            left_move();
        }
        if (!(orientation)) {
            up_move();
        }
        
    }
    else if (e.which == 46) { //Detects if Delete was pressed:
        this.value = '';
        if (orientation) {
            right_move();
        }
        if (!(orientation)) {
            down_move();
        }
    }
    else if (e.which == 13) { //Detects if Enter was pressed:
         get_suggestion();
    }
    getSquare(coord_pos).focus();
    reshade();
}

function one_box_input(e){
    this.value = this.value.toUpperCase().slice(-1);
    if (this.value.length == 1) {
        if (orientation) {
            right_move();
        } else if (!(orientation)){
            down_move();
        }
    }
    getSquare(coord_pos).focus();
    reshade();
}

function one_box_click(e) {
    recent_move = 1;
    if (this.style.backgroundColor == "black") {
        recent_move = 0;
    }
    if (this == document.activeElement) {
        coord_pos[0] = n - coord_pos[0];
        coord_pos[1] = n - coord_pos[1];
        if (this.readOnly) {
            this.readOnly = false;
            this.style.backgroundColor = "white";
            
            getSquare(coord_pos).readOnly = false;
            getSquare(coord_pos).style.backgroundColor = "white";
        } else {
            this.readOnly = true;
            this.style.backgroundColor = "black";

            getSquare(coord_pos).readOnly = true;
            getSquare(coord_pos).style.backgroundColor = "black";
        }
        coord_pos[0] = n - coord_pos[0];
        coord_pos[1] = n - coord_pos[1];
    } else {
        this.focus();
        const y = parseInt(this.id.split(" ")[0]);
        const x = parseInt(this.id.split(" ")[1]);
        coord_pos = [x,y];
    }
    reshade();
}

function one_box_focus (e) {
    if(this.style.backgroundColor == "black") {
        if (orientation) { //horizontal case
            if (recent_move == 1) { // If we can shrug it off, do so:
                right_move();
            }
            else if (recent_move == -1) {
                left_move();
            }
        }
        else { //vertical case:
            if (recent_move == 1) { // If we can shrug it off, do so:
                down_move();
            }
            else if (recent_move == -1) {
                up_move();
            }
        }
        getSquare(coord_pos).focus();
    }
    // Suggest words here:
    
    // First, we find the focused area:
       // Need to reset the position we are located at:
    const y = parseInt(this.id.split(" ")[0]);
    const x = parseInt(this.id.split(" ")[1]);
    coord_pos = [x,y];
    

}


// Helper Functions
// The function to call the DataMuse API to get a suggestion for the selected row/column:

function get_suggestion() {
    var hit_wall = false;
    var check_pos = coord_pos;
    // Go backwards to the beginning of the word:
    while (!(hit_wall)) { 
        if (orientation) {
            const x = check_pos[0] - 1;
            const y = check_pos[1];
            if (check_pos[0] == 0 || getSquare([x,y]).style.backgroundColor == "black") {
                hit_wall = true;
            }
            else {
                check_pos = [x,y];
            }
        }
        else {
            const x = check_pos[0];
            const y = check_pos[1] - 1;
            if (check_pos[1] == 0 || getSquare([x,y]).style.backgroundColor == "black") {
                hit_wall = true;
            }
            else{
                check_pos = [x,y];
            }
        }
    }
    hit_wall = false;
    var word_boxes = [];
    // We go forward, compiling a list of the boxes to be considered:
    while (!(hit_wall)) {
        if (orientation) {
            const x = check_pos[0] + 1;
            const y = check_pos[1];
            word_boxes.push(getSquare(check_pos));
            if (check_pos[0] == n || getSquare([x,y]).style.backgroundColor == "black") {
                hit_wall = true;
            }
            else {
                check_pos = [x,y];
            }
        }
        else {
            const x = check_pos[0];
            const y = check_pos[1] + 1;
            word_boxes.push(getSquare(check_pos));
            if (check_pos[1] == n || getSquare([x,y]).style.backgroundColor == "black") {
                hit_wall = true;
            }
            else{
                check_pos = [x,y];
            }
        }
    }
    var word = "";
    for (var box of word_boxes) {
        if (box.value == " " || box.value =="") {
            word = word.concat("?");
        }
        else {
            word = word.concat(box.value);
        }
    }
    // The following is a first attempt at using the data_muse api. It doesn't work. I'm going to have to learn how to use js apis

    

    for (var box of one_boxes) {
        box.placeholder = "";
    }
    var request = new XMLHttpRequest();
    request.open('GET', "http://api.datamuse.com/words?sp=".concat(word));
    suggested_word = "";
    request.onload = function() {
        var data = JSON.parse(this.response);
        suggested_word = data[0].word;
        console.log("suggested word stored as: ".concat(suggested_word));
        var k = 0;
        for (var box of word_boxes) {
            box.placeholder = suggested_word.substr(k, 1).toUpperCase();
            k += 1;
            console.log("box: ");
            console.log(box);
            console.log("box placeholder: ");
            console.log(box.placeholder);
        }
        return suggested_word;
    }

    request.send();
    
    console.log(suggested_word);
    
    old_word = word;
}


// Movement in the four cardinal directions, skipping over the appropriate squares:
function left_move() {
    if (coord_pos[0] > 0) {
        coord_pos[0] -= 1;
    }
    else if(coord_pos[1] > 0) { // If we need to wrap around (and have room to)
        coord_pos[0] = n;
        coord_pos[1] -= 1;
    } else { // If we hit the upper left, we go the bottom right corner
        coord_pos = [n,n];
    }
    recent_move = -1;
}

function up_move() {
    if (coord_pos[1] > 0) {
        coord_pos[1] -= 1;
    }
    else if(coord_pos[0] > 0) { // If we need to wrap around (and have room to)
        coord_pos[1] = n;
        coord_pos[0] -= 1;
    } else { // If we hit the upper left, we go the bottom right corner
        coord_pos = [n,n];
    }
    recent_move = -1;
}

function right_move() {
    if (coord_pos[0] < n) {
        coord_pos[0] += 1;
    }
    else if(coord_pos[1] < n) { // If we need to wrap around (and have room to)
        coord_pos[0] = 0;
        coord_pos[1] += 1;
    } else { // If we hit the bottom corner, we go back to the upper left
        coord_pos = [0,0];
    }
    recent_move = 1;
}

function down_move() {
    if (coord_pos[1] < n) {
        coord_pos[1] += 1;
    }
    else if(coord_pos[0] < n) { // If we need to wrap around (and have room to)
        coord_pos[1] = 0;
        coord_pos[0] += 1;
    } else { // If we hit the bottom corner, we go back to the upper left
        coord_pos = [0,0];
    }
    recent_move = 1;
}
// Shade boxes based on orienation:
function reshade() {
    y = parseInt(document.activeElement.id.split(" ")[0]);
    x = parseInt(document.activeElement.id.split(" ")[1]);
    for (const one_box of one_boxes) {
        if (one_box.style.backgroundColor != "black") {
            if (orientation) {
                if (parseInt(one_box.id.split(" ")[0]) == y) {
                    one_box.style.backgroundColor = "#d0d0e1";
                } else {
                    one_box.style.backgroundColor = "white";
                }
            } else {
                if (parseInt(one_box.id.split(" ")[1]) == x) {
                    one_box.style.backgroundColor = "#d0d0e1";
                } else {
                    one_box.style.backgroundColor = "white";
                }
            }
        }
    }
    if (document.activeElement.style.backgroundColor != "black") {
        document.activeElement.style.backgroundColor = "#ffe066";
    }
}


//   Gets the right square with integer coordinates:
function getSquare(coord) {
    const x = coord[0];
    const y = coord[1];
    return document.getElementById((y).toString().concat(" ").concat((x).toString()));
}
//   Sets cursor position in an element, courtesy of Mark Pieszak on Stack Exchange:
function setCaretPosition(elemId, caretPos) {
    var el = document.getElementById(elemId);

    el.value = el.value;
    // ^ this is used to not only get "focus", but
    // to make sure we don't have it everything -selected-
    // (it causes an issue in chrome, and having it doesn't hurt any other browser)

    if (el !== null) {

        if (el.createTextRange) {
            var range = el.createTextRange();
            range.move('character', caretPos);
            range.select();
            return true;
        }

        else {
            // (el.selectionStart === 0 added for Firefox bug)
            if (el.selectionStart || el.selectionStart === 0) {
                el.focus();
                el.setSelectionRange(caretPos, caretPos);
                return true;
            }

            else  { // fail city, fortunately this never happens (as far as I've tested) :)
                el.focus();
                return false;
            }
        }
    }
}