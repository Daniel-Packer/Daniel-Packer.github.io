/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
/* jshint es6 */
// Working on cleaning this up to meet basic coding standards. Also needs to be documented, once it is, it will replace the code in index.html, and I can start working on CSS there.


var playerNumber = 0;
var factions = [];
var playerMats = [];
var playerList = [];
var playerBids = [];
var bannedCombos = ['Rus-VietIndustrial', 'CrimeaPatriotic'];
var newFactions = [];

// This one feels pretty self-explanatory:
function resetFactions() {
    "use strict";
    factions = ['Rus-Viet', 'Nordic', 'Albion', 'Polania', 'Saxony', 'Crimea', 'Togawa'];
    playerMats = ['Mechanical', 'Militant', 'Innovative', 'Agricultural', 'Industrial', 'Engineering', 'Patriotic'];
}

// We call reset Factions to get everything ready. Currently, all these variables are global. I have yet to see why it's not a good idea, aside from the fact that it does make me feel a little gross.
resetFactions();


// As does this one.
function resetPlayers() {
    "use strict";
    playerList = [];
    playerBids = [];
}


function setPlayerNumber() {
    "use strict";
    var i, j, playerInputText; // Declaring variables
    playerNumber = document.getElementById('player_Number').value;
    
    if (isNaN(playerNumber)) { // We check if we are able to understand the input as an integer, and if not, we end cancel the player-number setting
        document.getElementById('otherOutput').innerHTML = 'The inputted player number was not interpretable as an integer. <br> Please try again.'
        return;
    } else {
        playerNumber = parseInt(playerNumber);
    }
    
    if (playerNumber > 7) { // Scythe only allows up to seven players, no reason to allow the player number to exceed this limit.
        playerNumber = 7;
    }else if(playerNumber < 1) {
        playerNumber = 1;
    }
    resetPlayers();
    for (i = 0; i < playerNumber; i += 1) {
        playerList.push('Player '.concat(i.toString()));
        playerBids.push([]);
    }
    document.getElementById('PlayerNamesTitle').innerHTML = 'Enter Player Names:';
    playerInputText = '';
    for (j = 0; j < playerNumber; j += 1) {
        playerInputText = playerInputText.concat('<input id="playerName', j.toString(), '"> <br>');
    }
    document.getElementById('player_info').innerHTML = playerInputText;
    document.getElementById('set_players').innerHTML = '<button onclick = setPlayerNames()> Set All Player Names </button> <br>';
    
}

function setPlayerName(n) {
    'use strict';
    playerList[n] = document.getElementById('playerName'.concat(n.toString())).value.trim();
    document.getElementById('output').innerHTML = playerList;
}

function setPlayerNames() {
    'use strict';
    var n;
    for (n = 0; n < playerNumber; n += 1) {
        setPlayerName(n);
    }
}

function randPick(list) {
    'use strict';
    var pick;
    pick = Math.floor(list.length * Math.random());
    return list.splice(pick, 1);
}

function generateBoard() {
    'use strict';
    var i, outputFactions, newPairing;
    newFactions = [];
    outputFactions = 'Your Name: <input id="playerName"> <br> Your Bids: <br>';
    for (i = 0; i < playerNumber; i += 1) {        
        newPairing = [randPick(factions), randPick(playerMats)];
        console.log(newPairing[0].toString().concat(newPairing[1].toString()));
        newFactions.push(newPairing);
        outputFactions = outputFactions.concat(newFactions[i][0], ' ', newFactions[i][1], '<input id=\"bid', i.toString(), '\">', '<br>');
    }
    for (i = 0; i < playerNumber; i += 1) {
        if (bannedCombos.includes(newFactions[i][0].toString().concat(newFactions[i][1].toString()))) {
            resetFactions();
            generateBoard();
            return;
        }
    }
    outputFactions = outputFactions.concat('<button onclick = submitBids()> Submit </button>');
    document.getElementById('output').innerHTML = outputFactions;

    resetFactions();
    yetToBidText();
    return newFactions;
}

function submitBids() {
    'use strict';
    var i, playerIndex, bid_set, yet_to_bid, unbidded;
    playerIndex = playerList.indexOf(document.getElementById('playerName').value.trim());
    if (playerIndex == -1) {
        document.getElementById('otherOutput2').innerHTML = 'The inputted Player name did not match any names in the list. <br> Please check the entered player name against the list of player names and try again.'
        return;
    }
    playerBids[playerIndex] = [];
    for (i = 0; i < playerNumber; i++) {
        if (isNaN(document.getElementById('bid'.concat(i.toString())).value)) {
            document.getElementById('otherOutput2').innerHTML = 'Goddammit Kyle! I told you not to put strings in here!!! GRRRR... You have to bid again';
            playerBids[playerIndex] = [];
            return;
        }
        playerBids[playerIndex].push(parseInt(Math.abs(document.getElementById('bid'.concat(i.toString())).value), 10));
        document.getElementById('bid'.concat(i.toString())).value = '';
        document.getElementById('playerName').value = '';
    }
    if (Array.from(playerBids, (bid_set => bid_set.length)).indexOf(0) == -1) {
        document.getElementById('status').innerHTML = "All bids submitted: <button id = \"resolve_bidding\"  onclick=\"resolveBidding(\'max_bid\')\"> Resolve Bidding</button>";
        document.getElementById('resolve_bidding').focus();
        document.getElementById('otherOutput').innerHTML = 'Everyone has bid!';
    } else {
        yetToBidText();
    }
    document.getElementById('otherOutput2').innerHTML = '';
}

function yetToBidText() {
    var yet_to_bid, unbidded;
    yet_to_bid = 'Yet to bid: ';
    unbidded = Array.from(findEmptyEntries(playerBids), (zero_index) => playerList[zero_index]);
    for (i = 0; i < unbidded.length; i += 1) {
        yet_to_bid = yet_to_bid.concat(unbidded[i], ', ');
    }
    yet_to_bid = yet_to_bid.slice(0, -2);
    document.getElementById('otherOutput').innerHTML = yet_to_bid;
    document.getElementById('playerName').focus();
}

function findEmptyEntries(array){
    'use strict';
    // This for loop shamelessly taken off of Stack Exchange here: https://stackoverflow.com/questions/20798477/how-to-find-index-of-all-occurrences-of-element-in-array because I'm lazy

    var indexes = [], i;
    for(i = 0; i < array.length; i++)
        if (array[i].length == 0)
            indexes.push(i);
    return indexes;
}


var output_permutations = [];

// Resolves the bidding to maximize coins spent, changing the true value to method == 'MaxBid' will add more dependence.    
function resolveBidding(method) {
    'use strict';
    var bidResultString, best_performer, i;
    bidResultString = '';
    generate([...Array(parseInt(playerNumber)).keys()], output);
    best_performer = [0,[]];
    if (true) {
        for (i = 0; i< output_permutations.length; i++) {
            if (maxBid(playerBids, [...output_permutations[i]]) > best_performer[0]) {
                best_performer[0] = maxBid(playerBids, [...output_permutations[i]]);
                best_performer[1] = [...output_permutations[i]];
            }
        }
    }

    for (i = 0; i < playerList.length; i++) {
        bidResultString = bidResultString.concat(playerList[i], ' receives ', newFactions[best_performer[1][i]], ' for ', playerBids[i][best_performer[1][i]].toString(), ' coins <br>');
    }
    document.getElementById('bidReturns').innerHTML = bidResultString;
    return best_performer;
}

function maxBid(playerBidsInput, testCombo) {
    'use strict';
    var sum, j;
    sum = 0;
    for (j = 0; j < playerNumber; j++) {
        sum += parseInt(playerBidsInput[j][testCombo[j]]);
    }
    return sum;
}

function generate(array, result, n) {
    // Heap's Algorithm, from somewhere on the internet. If I ever publish this, I will find the right person to credit.
    var i;
    n = n || array.length;
    if (n == 1) {
        result(array);
    } else {
        for (i = 1; i <= n ; i++) {
            generate(array, result, n-1);
            if (n % 2) {
                [array[0], array[n-1]] = [array[n-1], array[0]];
            } else {
                [array[i-1], array[n-1]] = [array[n-1], array[i-1]];
            }
        }
    }
}

function output(input) {
    output_permutations.push([...input]);
}
