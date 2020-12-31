let remainingToDetonate 
let nrOfBomb 
let isAnyBombDetonated 
let flaggedTiles 
let finished 
let firstDetonated
let tiles = []
let size = 9

class Tile {
    constructor(ID,neighbours) {
        this.ID = ID;
        this.content = 0;
        this.exposed = false;
        this.isBomb = false;
        this.flagged = false;
        this.neighbours = neighbours;
        
    }
}

function createTiles(boardSize) {

    for(let i=0;i<(boardSize*boardSize);i++) {
        switch (true) {
            case (i===0): //top-left corner
                tiles.push(new Tile(i,[i+1,i+boardSize,i+boardSize+1]));
            break;
            case (i===(boardSize-1)): //top-right corner
                tiles.push(new Tile(i,[i-1,i+boardSize-1,i+boardSize]));
            break;
            case (i===(boardSize*(boardSize-1))): //bottom-left corner
                tiles.push(new Tile(i,[i-boardSize,i-boardSize+1,i+1]));
            break;
            case (i===(boardSize*boardSize-1)): //bottom-right corner
                tiles.push(new Tile(i,[i-boardSize-1,i-boardSize,i-1]));
            break;
            case (i>0 && i<(boardSize-1)): // top side
                tiles.push(new Tile(i,[i-1,i+1,i+boardSize-1,i+boardSize,i+boardSize+1]));
            break;
            case (i>(boardSize*(boardSize-1)) && i<(boardSize*boardSize-1)): //bottom side
                tiles.push(new Tile(i,[i-boardSize-1,i-boardSize,i-boardSize+1,i-1,i+1]));
            break;
            case (i%boardSize === 0): //left side
                tiles.push(new Tile(i,[i-boardSize,i-boardSize+1,i+1,i+boardSize,i+boardSize+1]));
            break;
            case ((i+1)%boardSize === 0): //right side
                tiles.push(new Tile(i,[i-boardSize-1,i-boardSize,i-1,i+boardSize-1,i+boardSize]));
            break;
            default:
                tiles.push(new Tile(i,[i-boardSize-1,i-boardSize,i-boardSize+1,i-1,i+1,i+boardSize-1,i+boardSize,i+boardSize+1]));
            
        } 
    }
}
function drawBombs(boardSize) {

    let bombsLeft=10;

    while (bombsLeft>0) {
        let drawedID = Math.floor(Math.random() * (boardSize*boardSize));
    if(tiles[drawedID].isBomb !== true) {
        tiles[drawedID].isBomb = true;
        bombsLeft--;

        tiles[drawedID].neighbours.forEach( el => {
            tiles[el].content += 1;
        });
    }
}
}



function showBoard (boardSize) {
    for(let i = 0;i<(boardSize*boardSize);i++) {
        document.querySelector('#gamePanel').innerHTML += '<div class="tile" id="tile'+i+'"></div>' ;

        if((i+1)%boardSize===0) {
            document.querySelector('#gamePanel').innerHTML += '<br>' ;   
        }
        
    }
       
}
function addTilesOnClick (boardSize) { 
    for(let i = 0;i<(boardSize*boardSize);i++) { 
        document.getElementById('tile'+i).addEventListener("click", () => {detonation(i);});
        document.getElementById('tile'+i).addEventListener("contextmenu", () => {toggleFlag(i);});
        document.getElementById('tile'+i).addEventListener('contextmenu', event => event.preventDefault());
    }
}
function drawBoard (boardSize) {
    nrOfBomb = 10;
    remainingToDetonate =  boardSize * boardSize - nrOfBomb;
    isAnyBombDetonated = false;
    flaggedTiles = 0;
    finished = false;
    firstDetonated = false; 

    for (let i = 0; i<(boardSize*boardSize);i++) {
        tiles.pop();
    }

    createTiles(boardSize);
    drawBombs(boardSize);
}
function revealTile (tileID) {
    
    if(tiles[tileID].exposed===false) {
        if (tiles[tileID].isBomb === true && isAnyBombDetonated === false) {
                document.getElementById('tile'+tileID).style.backgroundImage = 'url("img/bombCrossedOut.png")';
                document.getElementById('tile'+tileID).classList.add('detonatedTile');
                document.getElementById('tile'+tileID).classList.remove('tile');
                tiles[tileID].exposed = true;
        } else  if (tiles[tileID].isBomb === true && isAnyBombDetonated === true){
                document.getElementById('tile'+tileID).style.backgroundImage = 'url("img/bomb.png")';
                document.getElementById('tile'+tileID).classList.add('detonatedTile');
                document.getElementById('tile'+tileID).classList.remove('tile');
                tiles[tileID].exposed = true;
        } else {
                document.getElementById('tile'+tileID).style.backgroundImage = 'url("img/tile'+tiles[tileID].content+'.png")';
                document.getElementById('tile'+tileID).classList.add("detonatedTile");
                document.getElementById('tile'+tileID).classList.remove("tile");
                tiles[tileID].exposed = true;
                remainingToDetonate -= 1;
        }

        
        

        if(remainingToDetonate === 0) {
            document.querySelector('#face').style.backgroundImage = 'url("img/smilingFaceWithSunglasses.png")';
            document.querySelector('#bombCounter').innerHTML = '000';
            finished = true;
        }
    }  
}
function detonation (tileID) {
    if (isAnyBombDetonated === false && tiles[tileID].flagged === false) {

        if (tiles[tileID].isBomb === true) {

            if (firstDetonated === true) {
                revealTile(tileID);

                document.querySelector('#face').style.backgroundImage = 'url("img/explodingHead.png")';

                tiles.forEach( (el,i) => {
                    if(el.isBomb === true) {
                        revealTile(i);
                        
                    } else if (el.flagged === true) {
                        document.getElementById('tile'+i).style.backgroundImage = 'url("img/crossedFlag.png")';
                        document.getElementById('tile'+i).classList.remove('tile');
                    }

                    isAnyBombDetonated = true;   
                });
            } else {
                drawBoard(size);
                detonation(tileID);
            }

        } else if (tiles[tileID].content === 0 && tiles[tileID].exposed === false) {
            revealTile(tileID);

            tiles[tileID].neighbours.forEach ( el => {
                detonation(el);
        });

            
        } else {
            revealTile(tileID);
        }

        firstDetonated = true;
    }
}
function toggleFlag(tileID) {
    if (isAnyBombDetonated === false && tiles[tileID].exposed === false && finished === false) {

        if (tiles[tileID].flagged === false) {
            document.getElementById('tile'+tileID).classList.add('flaggedTile');
            document.getElementById('tile'+tileID).classList.remove('tile');
            tiles[tileID].flagged = true;

            flaggedTiles += 1;
        } else {
            document.getElementById('tile'+tileID).classList.add('tile');
            document.getElementById('tile'+tileID).classList.remove('flaggedTile');
            
            tiles[tileID].flagged = false;

            flaggedTiles -= 1;
        } 
        refreshBombCounter();
        

    }
    
}
function refreshBombCounter () {
    switch (true) {
        case ((nrOfBomb-flaggedTiles)>=10 && (nrOfBomb-flaggedTiles) <100):
            document.querySelector('#bombCounter').innerHTML = '0'+(nrOfBomb-flaggedTiles);
        break;
        case ((nrOfBomb-flaggedTiles)>=0 && (nrOfBomb-flaggedTiles) <10):
            document.querySelector('#bombCounter').innerHTML = '00'+(nrOfBomb-flaggedTiles);
        break;
        default:
            document.querySelector('#bombCounter').innerHTML = nrOfBomb-flaggedTiles;
    }
}
function restart() {
    detonatedTiles = document.querySelectorAll(".detonatedTile");

    detonatedTiles.forEach(el => {
        el.classList.remove('detonatedTile');
        el.classList.add('tile');
        el.style.removeProperty('background-image');
    });

    flaggedTiles = document.querySelectorAll(".flaggedTile");

    flaggedTiles.forEach(el => {
        el.classList.remove('flaggedTile');
        el.classList.add('tile');
        el.style.removeProperty('background-image');
    });



    document.querySelector('#face').style.backgroundImage = 'url("img/slightlySmilingFace.png")';

    drawBoard(size);
    refreshBombCounter();
    
}
document.addEventListener("DOMContentLoaded", () => {
   document.querySelector("#face").addEventListener("click", function() {restart();});

    showBoard(size);
    drawBoard(size);
    refreshBombCounter();
    addTilesOnClick(size); 
})


console.log(tiles);

div = document.querySelector('.countersBox');
console.dir(div);

