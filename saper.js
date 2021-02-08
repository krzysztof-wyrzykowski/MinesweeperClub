let remainingToDetonate 
let nrOfBomb = 10
let isAnyBombDetonated 
let flaggedTiles 
let finished 
let firstDetonated
let tiles = []
let size = 10
let level = 1
let boardsHTML = []
let nrOfGameReports = 0;
let scrollingReportsInProgres = false;

const gamePanel = document.querySelector('#gamePanel');
const tilesDivs = gamePanel.getElementsByClassName('tile');
const showShortcutsBtn = document.querySelector('.showShortcuts');
const shortcutsList = document.querySelector('.shortcutsList');

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

    let bombsLeft = nrOfBomb;

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
function showBoard (levelToShow) {
    gamePanel.innerHTML = boardsHTML[levelToShow-1]   
}
function generateBoard(boardSize) {
    let boardHTML = "";
    for(let i = 0;i<(boardSize*boardSize);i++) {
            boardHTML += `<div class="tile coveredTile" data-tileid ="${i}" ></div>`;
        if((i+1)%boardSize===0) {
            boardHTML += '<br>' ;   
        } 
    }
    return boardHTML;
}
function generateStandardBoards() {
    boardsHTML.push(generateBoard(10));
    boardsHTML.push(generateBoard(20));
    boardsHTML.push(generateBoard(30));
}

function drawBoard (boardSize) {
    remainingToDetonate =  boardSize * boardSize - nrOfBomb;
    isAnyBombDetonated = false;
    flaggedTiles = 0;
    finished = false;
    firstDetonated = false; 
    
    let nrOfTiles = tiles.length;
    for (let i = 0; i<nrOfTiles;i++) {
        tiles.pop();      
    }
    createTiles(boardSize);
    drawBombs(boardSize);
}
function revealTile (tileID) {
    
    if(tiles[tileID].exposed===false) {

        if (tiles[tileID].isBomb === true && isAnyBombDetonated === false) { // click on bomb
                tilesDivs[tileID].style.backgroundImage = 'url("img/bombCrossedOut.png")';
                tilesDivs[tileID].classList.add('detonatedTile');
                tilesDivs[tileID].classList.remove('coveredTile');
                tiles[tileID].exposed = true;
        } else  if (tiles[tileID].isBomb === true && isAnyBombDetonated === true){ // detonating rest bombs
                tilesDivs[tileID].style.backgroundImage = 'url("img/bomb.png")';
                tilesDivs[tileID].classList.add('detonatedTile');
                tilesDivs[tileID].classList.remove('coveredTile');
                tiles[tileID].exposed = true;
        } else { // no bomb
                tilesDivs[tileID].style.backgroundImage = 'url("img/tile'+tiles[tileID].content+'.png")';
                tilesDivs[tileID].classList.add("detonatedTile");
                tilesDivs[tileID].classList.remove("coveredTile");
                tiles[tileID].exposed = true;
                remainingToDetonate -= 1;
        }
        //win
        if(remainingToDetonate === 0) {
            document.querySelector('#face').style.backgroundImage = 'url("img/smilingFaceWithSunglasses.png")';
            document.querySelector('#bombCounter').innerHTML = '000';
            finished = true;
            addGameReport(true,level);
        }
    }  
}
function detonation (tileID) {
    if (isAnyBombDetonated === false && tiles[tileID].flagged === false && finished === false) {

        if (tiles[tileID].isBomb === true) {

            if (firstDetonated === true) {
                // lose
                revealTile(tileID);
                isAnyBombDetonated = true; 

                document.querySelector('#face').style.backgroundImage = 'url("img/explodingHead.png")';
                
                let incorrectlyFlagged = 0;

                tiles.forEach( (el,i) => {
                    if(el.isBomb === true) {
                        revealTile(i);    
                    } else if (el.flagged === true) {
                        tilesDivs[i].style.backgroundImage = 'url("img/crossedFlag.png")';
                        incorrectlyFlagged++;
                    }    
                });
                addGameReport(false,level,remainingToDetonate,flaggedTiles,incorrectlyFlagged)
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
            tilesDivs[tileID].classList.add('flaggedTile');
            tilesDivs[tileID].classList.remove('coveredTile');
            tiles[tileID].flagged = true;

            flaggedTiles += 1;
        } else {
            tilesDivs[tileID].classList.add('coveredTile');
            tilesDivs[tileID].classList.remove('flaggedTile');
            
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

    detonatedTiles.forEach( el => {
        el.classList.remove('detonatedTile');
        el.classList.add('coveredTile');
        el.style.removeProperty('background-image');
    });

    flaggedTiles = document.querySelectorAll(".flaggedTile");

    flaggedTiles.forEach( el => {
        el.classList.remove('flaggedTile');
        el.classList.add('coveredTile');
        el.style.removeProperty('background-image');
    });

    document.querySelector('#face').style.backgroundImage = 'url("img/slightlySmilingFace.png")';

    drawBoard(size);
    refreshBombCounter();
    
}
function changeLevel(currentLevel) {
    document.querySelector('#face').style.backgroundImage = 'url("img/slightlySmilingFace.png")';

    switch(currentLevel){
        case 1: 
            size = 10;
            nrOfBomb = 10;
            gamePanel.style.setProperty("--gamePanelWidth", "500px");
            gamePanel.style.setProperty("--gamePanelHeight", "500px");
            gamePanel.style.setProperty("--tileSize", "50px");
            gamePanel.style.setProperty("--tileBorder", "5px");
            showBoard(1);
            drawBoard(10,10);
            
        break;   
        case 2:
            size = 20;
            nrOfBomb = 40;
            gamePanel.style.setProperty("--gamePanelWidth", "900px");
            gamePanel.style.setProperty("--gamePanelHeight", "900px");
            gamePanel.style.setProperty("--tileSize", "45px");
            gamePanel.style.setProperty("--tileBorder", "4px");
            showBoard(2);
            drawBoard(20);
            
        break;
        case 3:
            size = 30;
            nrOfBomb = 90;
            gamePanel.style.setProperty("--gamePanelWidth", "960px");
            gamePanel.style.setProperty("--gamePanelHeight", "960px");
            gamePanel.style.setProperty("--tileSize", "32px");
            gamePanel.style.setProperty("--tileBorder", "3px");
            showBoard(3);
            drawBoard(30);        
        break;
    }

    refreshBombCounter();

    level = currentLevel;
    document.querySelector('#levelButton').innerText = level;
}
function addGameReport (win,level,detonated,flagged,incorrectlyFlagged) {
    const reports = document.querySelector('#reports');
    const newReport = document.createElement("div");
    newReport.classList.add("gameReport");
    if(win === true){
        const reportTemplate = document.querySelector('#reportWinTemplate').content.cloneNode(true);
        const reportInfos = reportTemplate.querySelectorAll('span');
        reportInfos[0].innerText = `Level: ${level}`;
        reportInfos[1].innerText = `Time: 0:00`;
        newReport.append(reportTemplate);
        newReport.style.setProperty("--reportColor","#025020");
    } else {
        const reportTemplate = document.querySelector('#reportLoseTemplate').content.cloneNode(true);
        const reportInfos = reportTemplate.querySelectorAll('span');
        reportInfos[0].innerText = `Level: ${level}`;
        reportInfos[1].innerText = `Tiles left: ${detonated}`;
        reportInfos[2].innerText = `Correctly flagged: ${flagged - incorrectlyFlagged}`;
        reportInfos[3].innerText = `Incorrectly flagged: ${incorrectlyFlagged}`;
        reportInfos[4].innerText = `Time: 0:00`;
        newReport.append(reportTemplate);
        newReport.style.setProperty("--reportColor","#700505");
    }
    if(reports.firstChild.nodeType === 3) {
        reports.firstChild.remove();
        reports.style.textAlign = "left";
    }

    reports.appendChild(newReport);

    nrOfGameReports ++;

    if (nrOfGameReports === 4) {
        document.querySelector("#followingReport").style.visibility = "visible";
        document.querySelector("#previousReport").style.visibility = "visible";
        reports.style.overflowX = "scroll";
        reports.style.overflowY = "hidden";
    }
    
    reports.scrollTo({
        left : reports.scrollWidth ,
        behavior: 'smooth'
    });
}
function scrollReportsToLeft() {

    if(scrollingReportsInProgres){
        setTimeout(scrollReportsToLeft,10);
        return 0
    }
    
    let positionToScroll;
    if(reports.scrollLeft === 0){
        return 0;
    } else if(reports.scrollLeft%300 === 0){
        positionToScroll = reports.scrollLeft - 300;
    } else {
        positionToScroll = reports.scrollLeft - reports.scrollLeft%300;
    }

    function checkScrollingProgress () {
        if(reports.scrollLeft === positionToScroll) { 
            reports.removeEventListener('scroll', checkScrollingProgress)
            console.log("scrolling finished")
            scrollingReportsInProgres = false;
        }
    }

    reports.addEventListener("scroll", checkScrollingProgress)
    // tutaj było wywołanie funkcji checkScrollingProgress nie wiem dlaczego
    scrollingReportsInProgres = true;
    reports.scrollTo({
        left : positionToScroll ,
        behavior: 'smooth',
    }); 
}
function scrollReportsToRight() {

    if(scrollingReportsInProgres){
        setTimeout(scrollReportsToRight,10);
        return 0
    }

    let positionToScroll;
    if(reports.scrollLeft === reports.scrollWidth-900) {
        return 0;
    } else if(reports.scrollLeft%300 === 0) {
        positionToScroll = reports.scrollLeft + 300;
    } else {
        positionToScroll = reports.scrollLeft + 300 - reports.scrollLeft%300;
    }

    function checkScrollingProgress () {
        if(reports.scrollLeft === positionToScroll) { 
            reports.removeEventListener('scroll', checkScrollingProgress)
            console.log("scrolling finished")
            scrollingReportsInProgres = false;
        }
    }

    reports.addEventListener("scroll", checkScrollingProgress)
    // tutaj było wywołanie funkcji checkScrollingProgress nie wiem dlaczego
    scrollingReportsInProgres = true;
    reports.scrollTo({
        left : positionToScroll ,
        behavior: 'smooth',
    }); 
}
//     if(reports.scrollLeft%300 === 0) {
//         reports.scrollTo({
//             left : reports.scrollLeft + 300 ,
//             behavior: 'smooth'
//         }); 
//    } else {
//         reports.scrollTo({
//             left : reports.scrollLeft + 300 - reports.scrollLeft%300 ,
//             behavior: 'smooth'
//         });
//         console.log(reports.scrollLeft + 300 -reports.scrollLeft%300)
//    }

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#face").addEventListener("click", function() {restart();});
    document.querySelector("#levelButton").addEventListener("click", function() {
        if(level >= 3){
            changeLevel(1) 
        } else {
            changeLevel(level+1)
        }
        
    ;});
    document.querySelector("#previousReport").addEventListener("click", function() {setTimeout(scrollReportsToLeft,0);});
    document.querySelector("#followingReport").addEventListener("click", function() {setTimeout(scrollReportsToRight,0);});

    gamePanel.addEventListener("click", event => {
        if(event.target.classList.contains("tile")) {
           detonation(Number(event.target.dataset.tileid)); 
        }
        
    });
    gamePanel.addEventListener("contextmenu", event => {
        event.preventDefault()
        toggleFlag(Number(event.target.dataset.tileid))
    });

    //shortcuts
    document.addEventListener("keydown", event => {
        if(event.key === "1" && level !== 1) {
            changeLevel(1);
        }
        if(event.key === "2" && level !== 2) {
            changeLevel(2);
        }
        if(event.key === "3" && level !== 3) {
            changeLevel(3);
        }
        if(event.key.toUpperCase() === "R" ) {
            restart();
        }
        if(event.key === "ArrowRight") {
            event.preventDefault();
            scrollReportsToRight();
        }
        if(event.key === "ArrowLeft") {  
            event.preventDefault();
            scrollReportsToLeft();
        }
    });

    showShortcutsBtn.addEventListener("click", event => {
           if(getComputedStyle(shortcutsList).visibility === "hidden"){
            shortcutsList.style.visibility = "visible";
            } else {
                shortcutsList.style.visibility = "hidden";
            } 
    })
    
    addGameReport(true,1)
    addGameReport(false,1,1,1,1)
    addGameReport(true,1)
    addGameReport(false,1,1,1,1)
    addGameReport(true,1)
    addGameReport(false,1,1,1,1)
    addGameReport(true,1)
    addGameReport(false,1,1,1,1)
    addGameReport(true,1)
    addGameReport(false,1,1,1,1)
    generateStandardBoards();
    showBoard(level);
    drawBoard(size);
    refreshBombCounter();
})
