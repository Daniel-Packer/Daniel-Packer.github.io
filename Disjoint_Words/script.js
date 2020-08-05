//Updated: 19-07-2020, 12:10

var n = localStorage.getItem("n") || 14; // We use this and count from zero, so the value here, is one less than the dimension.
var orientation = true; // true means horizontal, false means vertical
var xword_string = "";
var recent_move = 1;
var old_word= [" ", 0];
var suggested_word;
var coord_pos = [0,0];

const x_word = document.getElementById("x-word");

for (var i = 0; i <= n; i += 1) {
    for (var j = 0; j <= n; j += 1){
        const proto_box = document.createElement("INPUT");
        proto_box.setAttribute("id", i.toString().concat(" ").concat(j.toString()));
        proto_box.setAttribute("class", "one_box");
        x_word.appendChild(proto_box);
    }
    x_word.appendChild(document.createElement("BR"));
}

const drop_down_buttons = document.getElementsByClassName("dropbtn");
for (const btn of drop_down_buttons) {
    btn.addEventListener("click", open_dropdown);
}

var all_boxes = document.getElementsByClassName("one_box");
for (var one_box of all_boxes) {
    one_box.addEventListener("keydown", one_box_keydown);
    one_box.addEventListener("keyup", one_box_keyup);
    one_box.addEventListener("input", one_box_input);
    one_box.addEventListener("mousedown", one_box_click);
    one_box.addEventListener("focus", one_box_focus);
    one_box.style.border = "1px solid black";
}

restore_save_file("entries");    
blank_data();
const n_input = document.getElementById("n_input");
n_input.addEventListener("keydown", function(e) {
    if (e.keyCode == 13) {
        const n_new = parseInt(n_input.value)-1;
        localStorage.setItem("n", n_new);
        location.reload();
    }
})

window.onmouseup = function(e) {
    console.log(e.target.type);
    // I am using a mouse_up here in a kinda hacky way, so that the click triggers of the dropdown menu will have a chance to trigger before this event.
    const shown_drop_down = document.getElementsByClassName("show");
    if (!(e.target.type == "text")) {
        for (var i = 0; i < shown_drop_down.length; i += 1) {
            shown_drop_down[i].classList.toggle("show");
        }
    }
}

function one_box_keydown(e){
    const old_orientation = orientation;
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
    else if (e.which == 13) { //Detects if Enter was pressed:
         get_suggestion();
    }
    getSquare(coord_pos).focus();
    reshade();
    if (old_orientation != orientation) {
        clear_placeholders();
    }
}

function one_box_keyup(e) {
    if (e.which == 8) { // Detects if Backspace was pressed:
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
        var sym_pos = [n - coord_pos[0], n - coord_pos[1]];
        if (this.readOnly) {
            this.readOnly = false;
            this.style.backgroundColor = "white";
            
            getSquare(sym_pos).readOnly = false;
            getSquare(sym_pos).style.backgroundColor = "white";
        } else {
            this.readOnly = true;
            this.style.backgroundColor = "black";

            getSquare(sym_pos).readOnly = true;
            getSquare(sym_pos).style.backgroundColor = "black";
        }
    } else {
        this.focus();
        const y = parseInt(this.id.split(" ")[0]);
        const x = parseInt(this.id.split(" ")[1]);
        coord_pos = [x,y];
    }
//    reshade();
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
    reshade();
}
function restore_save_file (file_name) {
    var old_entries = [];
    try {
        const restore = JSON.parse(localStorage.getItem(file_name));
        if (restore[0] == n) {
            old_entries = restore[1];
            for (const box of all_boxes) {
                if (old_entries[0] == "b") {
                    box.style.backgroundColor = "black";
                    box.readOnly = true;
                    old_entries.shift();    
                }
                else {
                    box.value = old_entries.shift();
                    box.style.backgroundColor = "white";
                    box.readOnly = false;
                }
            }
        }
    }
    catch {
        old_entries = [];
        for (var i = 0; i < (n + 1)*(n+1) ; i++) {
            old_entries.push("");
        }
    }
}

function save() {
    const save_name = document.getElementById("save_name_input").value;
    save_data(save_name);
}

// Helper Functions
// The function to call the DataMuse API to get a suggestion for the selected row/column:

function get_suggestion() {
    var word_boxes = find_word_boxes();
    var word = "";
    for (var box of word_boxes) {
        if (box.value == " " || box.value =="") {
            word = word.concat("?");
            box.value = ""; // This is so that the placeholder will actually appear! (Otherwise, the space will fill the square instead.)
        }
        else {
            word = word.concat(box.value);
        }
    }
    if (word == old_word[0]) {
        old_word[1] = old_word[1] + 1;
    }
    else {
        old_word = [word, 0];
    }
    // The following is a first attempt at using the data_muse api. It sorta works. I think I am doing the accessing without any encryption which feels sorta dangerous. I think I need to alter it to some extent... Maybe I should just get a key, and then I can use the https (if that's what will make it work)

    
    clear_placeholders();
    var request = new XMLHttpRequest();
    request.open('GET', "http://api.datamuse.com/words?sp=".concat(word));
    suggested_word = "";
    request.onload = function() {
        var data = JSON.parse(this.response);
        try {
            suggested_word = data[old_word[1]].word.replace(/ /g, ""); // Remove white space after picking word
        }
        catch {
            suggested_word = word;    
        }
        var k = 0;
        for (var box of word_boxes) {
            box.placeholder = suggested_word.substr(k, 1).toUpperCase();
            k += 1;
        }
        return suggested_word;
    }

    request.send();
    
}

function save_data(save_name) {
    var all_data = [];
    for (var box of all_boxes){
        if (box.style.backgroundColor != "black") {
            if (box.value == "" || box.value == " ") {
                all_data.push(" ");
            }
            else {
                all_data.push(box.value);
            }
        }
        else {
            all_data.push("b");
        }
    }
    // We locally maintain a list of the names of the saved xwords, so that we can give the user options of which to pick
    var save_names = JSON.parse(localStorage.getItem("save_names")) || [];
    const x_word_data_to_save = [n, all_data];
    localStorage.setItem(save_name, JSON.stringify(x_word_data_to_save)); // Save the particular xword
    
    // Add the new crossword name (if it is new) and save the new list (at some point I will have to come up with a way to clear entries...)
    if (!save_names.includes(save_name)) {
        save_names.push(save_name);
    }
    localStorage.setItem("save_names", JSON.stringify(save_names));
}

function blank_data() {
    var all_data = [];
    for (var i = 0; i < (n+1)*(n+1); i += 1) {
        all_data.push(" ");
    }
    localStorage.setItem("blank_data", JSON.stringify([n,all_data]));
}

function find_word_boxes() {
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
    return word_boxes;
}
function clear_placeholders(){
    for (box of all_boxes) {
        box.placeholder = "";
    }
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
    var word_boxes = find_word_boxes();
    for (const one_box of all_boxes) { // Remove previous shading of selected boxes
        if (one_box.style.backgroundColor != "black") {
            one_box.style.backgroundColor = "white";
        }
    }
    if (document.activeElement.style.backgroundColor != "black") {
        for (const one_box of word_boxes) { // Set selected boxes to be shaded
            one_box.style.backgroundColor = "#d0d0e1";
        }
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
// Formatting stuff:
function open_dropdown() {
    refresh_save_dropdown();
    this.parentElement.getElementsByClassName("drop_content")[0].classList.toggle("show");
    // drop_content
}
function close_dropdown() {
    this.parentElement.getElementsByClassName("drop_content")[0].classList.toggle("show");
}
function refresh_save_dropdown() {
    const save_names = JSON.parse(localStorage.getItem("save_names")) || [];
    
    // drop_opts is the drop down menu that stores the various saved files.
    const drop_opts = document.getElementById("drop_opts");
    drop_opts.textContent ='';
    
    const blank_opt = document.createElement("SPAN");
    blank_opt.setAttribute("class", "button_like");
    blank_opt.addEventListener("click", function(){restore_save_file("blank_data")});
    blank_opt.appendChild(document.createTextNode("Blank Crossword"));
    drop_opts.appendChild(blank_opt);
    
    for (const save_name of save_names) {
        const opt = document.createElement("SPAN");
        opt.setAttribute("class", "button_like");
        opt.addEventListener("click", function(){restore_save_file(save_name)});
        opt.appendChild(document.createTextNode(save_name));
        const n_save = (parseInt(JSON.parse(localStorage.getItem(save_name))[0]) + 1).toString();
        const n_span = document.createElement("SPAN");
        n_span.style.float = "right";
        n_span.style.color = "#666666"
        n_span.appendChild(document.createTextNode(n_save));
        opt.appendChild(n_span);
        drop_opts.appendChild(opt);
    }
    drop_opts.addEventListener("mouseup", close_dropdown);
}