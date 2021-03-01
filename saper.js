let remainingToDetonate ;
let nrOfBomb = 10;
let isAnyBombDetonated;
let flaggedTiles;
let finished = false;
let firstDetonated = false;
let tiles = [];
let size = 10;
let level = 1;
let boardsHTML = [];
let nrOfGameReports = 0;
let scrollingReportsInProgres = false;
let scrollingQueue = 0;
let scrollingDirection;
let arrowKeyReleased = true;
let gameTimeInterval;
let isLeftMouseBtnDown = false;
let pressedTile;
let confirmationRequestShowed = false;
const scrollPosition = {};

const gameTime = {
    deciseconds: 0, 

    start: function() {
        gameTimeInterval = setInterval(() => {
            this.deciseconds++;
            this.showTime();
        },100)  
    },
    stop: function() {
        clearInterval(gameTimeInterval)
        this.deciseconds = 0;
    },
    showTime: function() {

        timer.innerText = this.getTime();
    },
    getTime: function() {
        let min = Math.floor(gameTime.deciseconds/600);
        let s = Math.floor((gameTime.deciseconds-min*600)/10);
        let ds = gameTime.deciseconds - min*600 - s*10;
        
        min = String(min).padStart(2,"0");
        s = String(s).padStart(2,"0");

        return `${min}:${s}:${ds}`
    }
}
const gamePanel = document.querySelector('#gamePanel');
const tilesDivs = gamePanel.getElementsByClassName('tile');
const showShortcutsBtn = document.querySelector('.showShortcuts');
const shortcutsList = document.querySelector('.shortcutsList');
const timer = document.querySelector('#timer');
const darkBackground = document.querySelector('.darkBackground')
const darkBackgroundMsg = darkBackground.querySelector('.message')

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
            addGameReport(true,level,gameTime.getTime());
            gameTime.stop();
            document.querySelector('#face').style.backgroundImage = 'url("img/smilingFaceWithSunglasses.png")';
            document.querySelector('#bombCounter').innerHTML = '000';
            finished = true;
        }
    }  
}
function detonation (tileID) {
    if (isAnyBombDetonated === false && tiles[tileID].flagged === false && finished === false) {

        if (tiles[tileID].isBomb === true) {

            if (firstDetonated === true) {
                //lose
                finished = true;
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
                addGameReport(false,level,gameTime.getTime(),remainingToDetonate,flaggedTiles,incorrectlyFlagged)
                gameTime.stop();
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
        if(firstDetonated === false) {
            //game start
            firstDetonated = true; 
            gameTime.start();
        }
        
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
function restartRequest() {
    if(confirmationRequestShowed || (!finished && !firstDetonated)) {return;}
    if(!finished && firstDetonated) {
        restart(true);
    }
    if(finished && firstDetonated) {
        restart(false);
    }
}
function restart(confirmationNeeded) {
    if(confirmationNeeded){
        showConfirmation(restart,"Do you really want to finish game?");
        return;
    }
    gameTime.stop();
    gameTime.showTime();

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
function changeLvlRequest(lvlToChange) {
    if(confirmationRequestShowed ) {return;}
    if(!finished && firstDetonated) {
        changeLevel(true,lvlToChange);
    } else {
        changeLevel(false,lvlToChange);
    }
}
function changeLevel(confirmationNeeded,lvlToChange) {
    if(confirmationNeeded){
        showConfirmation(changeLevel,"Do you really want to change level?",lvlToChange);
        return;
    }
    gameTime.stop();
    gameTime.showTime();
    document.querySelector('#face').style.backgroundImage = 'url("img/slightlySmilingFace.png")';

    switch(lvlToChange){
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

    level = lvlToChange;
    document.querySelector('#levelButton').innerText = level;
}
function addGameReport (win,level,time,detonated,flagged,incorrectlyFlagged) {
    const reports = document.querySelector('#reports');
    const newReport = document.createElement("div");
    newReport.classList.add("gameReport");
    if(win === true){
        const reportTemplate = document.querySelector('#reportWinTemplate').content.cloneNode(true);
        const reportInfos = reportTemplate.querySelectorAll('span');
        reportInfos[0].innerText = `Level: ${level}`;
        reportInfos[1].innerText = `Time: ${time}`;
        newReport.append(reportTemplate);
        newReport.style.setProperty("--reportColor","#025020");
    } else {
        const reportTemplate = document.querySelector('#reportLoseTemplate').content.cloneNode(true);
        const reportInfos = reportTemplate.querySelectorAll('span');
        reportInfos[0].innerText = `Level: ${level}`;
        reportInfos[1].innerText = `Time: ${time}`;
        reportInfos[2].innerText = `Tiles left: ${detonated}`;
        reportInfos[3].innerText = `Correctly flagged: ${flagged - incorrectlyFlagged}`;
        reportInfos[4].innerText = `Incorrectly flagged: ${incorrectlyFlagged}`;
        
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

    if(arrowKeyReleased === false && reports.scrollLeft%300 !== 0){
        return;
    }

    if(scrollingReportsInProgres){
        if(scrollingDirection === "left"){
            scrollingQueue+=1;
            return;
        } else {
            scrollingQueue = 0;
            scrollingDirection = "left";
        }
    }
    
    let positionToScroll;
    if(reports.scrollLeft === 0){
        return;
    } else if(reports.scrollLeft%300 === 0){
        positionToScroll = reports.scrollLeft - 300;
    } else {
        positionToScroll = reports.scrollLeft - reports.scrollLeft%300;
    }

    function checkScrollingProgress () {
        if(reports.scrollLeft === positionToScroll) { 
            reports.removeEventListener('scroll', checkScrollingProgress);
            scrollingReportsInProgres = false;
            if(positionToScroll === 0){
                scrollingQueue = 0;
            } else if(scrollingQueue>0){
                scrollingQueue-=1;
                scrollReportsToLeft();
            } 
        }
    }

    reports.addEventListener("scroll", checkScrollingProgress)
    scrollingReportsInProgres = true;
    scrollingDirection = "left";
    reports.scrollTo({
        left : positionToScroll ,
        behavior: 'smooth',
    }); 
}
function scrollReportsToRight() {

    if(arrowKeyReleased === false && reports.scrollLeft%300 !== 0){
        return;
    }
    if(scrollingReportsInProgres){
        if(scrollingDirection === "right"){
            scrollingQueue+=1;
            return;
        } else {
            scrollingQueue = 0;
            scrollingDirection = "right";
        }
    }

    let positionToScroll;
    if(reports.scrollLeft === reports.scrollWidth-900) {
        return;
    } else if(reports.scrollLeft%300 === 0) {
        positionToScroll = reports.scrollLeft + 300;
    } else {
        positionToScroll = reports.scrollLeft + 300 - reports.scrollLeft%300;
    }

    function checkScrollingProgress () {
        if(reports.scrollLeft === positionToScroll) { 
            reports.removeEventListener('scroll', checkScrollingProgress);
            scrollingReportsInProgres = false;
            if(positionToScroll === reports.scrollWidth-900){
                scrollingQueue = 0;
            } else if(scrollingQueue>0){
                scrollingQueue-=1;
                scrollReportsToRight();
            }
        }
    }

    reports.addEventListener("scroll", checkScrollingProgress)
    // tutaj było wywołanie funkcji checkScrollingProgress nie wiem dlaczego
    scrollingReportsInProgres = true;
    scrollingDirection = "right";
    reports.scrollTo({
        left : positionToScroll ,
        behavior: 'smooth',
    }); 
}
function toggleShortcutsListVisibility(){
    if(getComputedStyle(shortcutsList).visibility === "hidden"){
        shortcutsList.style.visibility = "visible";
    } else {
        shortcutsList.style.visibility = "hidden";
    }
}


function showConfirmation(fn,message,...param) {
    darkBackground.style.setProperty("--confirmationTop", window.scrollY+300+"px");
    darkBackground.style.height = document.body.clientHeight+"px";
    
    darkBackgroundMsg.innerText = message;
    confirmationRequestShowed = true;
    
    const confirmBtn = darkBackground.querySelector("#yes");
    const cancelBtn = darkBackground.querySelector("#cancel");

    scrollPosition.x = window.scrollX;
    scrollPosition.y = window.scrollY;
    window.addEventListener('scroll', noScroll);
    darkBackground.style.visibility = "visible";

    confirmBtn.addEventListener("click", confirmed);
    cancelBtn.addEventListener("click", canceled);
    document.addEventListener("keydown", addConfirmationShortcuts);

    function addConfirmationShortcuts(event) {
        if(event.key === "Enter"){
            confirmed();
        }  
        if(event.key.toUpperCase() === "C"){
            canceled();
        }
            
    }

    function confirmed() {
        darkBackground.style.visibility = "hidden";
        darkBackground.style.height = "0px";
        window.removeEventListener('scroll', noScroll);
        
        confirmBtn.removeEventListener("click", confirmed);
        cancelBtn.removeEventListener("click", canceled);
        document.removeEventListener("keydown", addConfirmationShortcuts);

        fn(false,...param);
        confirmationRequestShowed = false;
        
    }
    function canceled() {
        darkBackground.style.visibility = "hidden";
        darkBackground.style.height = "0px";
        window.removeEventListener('scroll', noScroll);
        
        confirmBtn.removeEventListener("click", confirmed);
        cancelBtn.removeEventListener("click", canceled);
        document.removeEventListener("keydown", addConfirmationShortcuts);

        confirmationRequestShowed = false;
    }
    
    
}
function noScroll() {
    window.scrollTo(scrollPosition.x,scrollPosition.y);
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#face").addEventListener("click", function() {restartRequest();});
    document.querySelector("#levelButton").addEventListener("click", function() {
        if(level >= 3){
            changeLvlRequest(1);
        } else {
            changeLvlRequest(level+1);
        }
        
    ;});
    document.querySelector("#previousReport").addEventListener("click", function() {setTimeout(scrollReportsToLeft,0);});
    document.querySelector("#followingReport").addEventListener("click", function() {setTimeout(scrollReportsToRight,0);});
    
    document.addEventListener("mousedown", event => {
        if(event.button === 0) {
            isLeftMouseBtnDown = true;
        } 
    });
    document.addEventListener("mouseup", event => {
        if(event.button === 0) {
            isLeftMouseBtnDown = false;
        }
    });
    gamePanel.addEventListener("mouseup", event => {
        if(event.target.classList.contains("tile") && event.button === 0) {
            event.target.classList.remove("pressedTile");
            detonation(Number(event.target.dataset.tileid)); 
        }
    });
    gamePanel.addEventListener("mousedown", event => {
        if(event.button === 0 && !(event.target.classList.contains("flaggedTile") || event.target.classList.contains("detonatedTile")) && !finished) {
            event.target.classList.add("pressedTile");
            event.target.classList.remove("coveredTile"); 
        }
    })
    gamePanel.addEventListener("mouseover", event => {
        if(isLeftMouseBtnDown && event.button === 0 && !finished){
    
            if(!(event.target === gamePanel)){
                 pressedTile = event.target;
            }
           
            if(event.target.classList.contains("coveredTile")){
                event.target.classList.add("pressedTile");
                event.target.classList.remove("coveredTile");
            }
            if(!(event.relatedTarget.classList.contains("detonatedTile") || event.relatedTarget.classList.contains("flaggedTile"))){
                event.relatedTarget.classList.add("coveredTile"); 
            }
            event.relatedTarget.classList.remove("pressedTile");
        }
    })
    gamePanel.addEventListener("mouseleave", event => {
        if(isLeftMouseBtnDown){ 
            pressedTile.classList.remove("pressedTile");
            if(!(pressedTile.classList.contains("flaggedTile") || pressedTile.classList.contains("detonatedTile"))) {
                pressedTile.classList.add("coveredTile");
            }
        }
        
    })
    gamePanel.addEventListener("contextmenu", event => {
        event.preventDefault();
        toggleFlag(Number(event.target.dataset.tileid));
    });
    

    //shortcuts
    document.addEventListener("keyup", event => {
        if(event.key === "ArrowRight" || event.key === "ArrowLeft"){
            arrowKeyReleased = true;
        }
    })
    document.addEventListener("keydown", event => {
        if(event.key === "1" && level !== 1) {
            changeLvlRequest(1);
            return;
        }
        if(event.key === "2" && level !== 2) {
            changeLvlRequest(2);
            return;
        }
        if(event.key === "3" && level !== 3) {
            changeLvlRequest(3);
            return;
        }
        if(event.key.toUpperCase() === "R" ) {
            restartRequest();
            return;
        }
        if(event.key.toUpperCase() === "S") {
            toggleShortcutsListVisibility();
            return;
        }
        if(event.key === "ArrowRight") {
            event.preventDefault();
            scrollReportsToRight();
            arrowKeyReleased = false;
            return;
        }
        if(event.key === "ArrowLeft") {  
            event.preventDefault();
            scrollReportsToLeft();
            arrowKeyReleased = false;
            return;
        }
    });

    showShortcutsBtn.addEventListener("click", toggleShortcutsListVisibility)
    
    generateStandardBoards();
    showBoard(level);
    drawBoard(size);
    refreshBombCounter();
})
