function $(x) { return document.getElementById(x); }

function getDefaultUser() {
	return {
		totPower:new Decimal(0),
		maxTotPower:new Decimal(0),
		red: {
			tick:0,
			tickMax:new Decimal(1000),
			tps:new Decimal(1),
			tickMultPrice:new Decimal(1.00e4),
			tickMultCount:new Decimal(0),
			mults: [new Decimal(1)],
			buttonPrice: [new Decimal(10)],
			buttonsPurchased: [new Decimal(0)],
			addButtonPrice: new Decimal(100),
			index: new Decimal(1),
			//All the above gets reset on a red reset
			limits: [new Decimal(10)],
			breakPrice: [new Decimal(3)],
			brokenAmount: [new Decimal(0)],
			clickedBoost: new Decimal(0),
			clickedIndex: -1,//0    1    2    3    4     5    6     7     8    9
			upgrades:       ["PB","CP","LB","BB","CPB","RB","CRB","ECU","MB","TPB"],
			upgradeCount:   [new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)],
			upgradePrices:  [new Decimal(1)   ,new Decimal(1)   ,new Decimal(10)  ,new Decimal(50)  ,new Decimal(100) ,new Decimal(10)  ,new Decimal(5e3) ,new Decimal(1e4) ,new Decimal(5e5) ,new Decimal(1e5)],
			upgradeIncrease:[new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(10)  ,new Decimal(2)   ,new Decimal(0)   ,new Decimal(10)  ,new Decimal(1e3), new Decimal(3)   ,new Decimal(0)],
			indexLimit: new Decimal(10),
			energy: new Decimal(0),
			resets: new Decimal(0),
			buttonSetExpanded: 0,
		},
		orange: {
			tick:new Decimal(0),
			tickMax:new Decimal(1000),
			tickMultPrice:new Decimal(1e4),
			tickMultCount:new Decimal(0),
			mults: [new Decimal(1)],
			buttonPrice: [new Decimal(10)],
			addButtonPrice: new Decimal(100),
			index: new Decimal(1),
			resets: new Decimal(0),
		},
		currentTab: "mainTab",
		lastTick: new Date().getTime(),
	};
}

var user = getDefaultUser();

function update(get, set) {
	$(get).innerHTML=set;
}

function insertAfter(newNode, referenceNode){
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function gameCycle(){
	let now = new Date().getTime();
	let diff = now - user.lastTick;
	user.red.tick += diff;
	if(user.red.tick >= user.red.tickMax) process(Decimal.round(new Decimal(user.red.tick).div(user.red.tickMax)));
	user.lastTick = now;
	updateAll();
}

function redClick(num) {
	if(user.red.upgradeCount[1].gt(0)){
		var mid=new Decimal(10);
		var what=new Decimal(user.red.upgradeCount[4]);
		while(what.gt(0)){
			mid = mid.times(10);
			what = what.minus(1);
		}
		let old=user.red.clickedIndex+1;
		user.red.clickedIndex=num-1;
		if(old!==0){
			user.red.mults[old-1]=user.red.clickedBoost;
		}
		user.red.clickedBoost=user.red.mults[num-1];
		if(num!==old) {
			user.red.mults[num-1]=user.red.mults[num-1].times(mid);
			
		}
	}
}

function getRedButtonTotalMult() {
	var mult=new Decimal(1);
	for(i=0;i<user.red.mults.length;i++){
		if(user.red.upgradeCount[9].gt(0)){
			mult = mult.times(user.maxTotPower.log10().log10().plus(1));
		}
		if(user.red.buttonsPurchased[i].equals(user.red.limits[i])){
			mult = mult.times(user.red.mults[i].pow(new Decimal(1).plus(user.red.upgradeCount[8].div(10))));
		}
		else { mult = mult.times(user.red.mults[i]);}
	}
	if(user.red.upgradeCount[0].gt(0)){ 
		mult = mult.times(user.red.energy.plus(1));
		update("currentPBBonus",display(user.red.energy.plus(1)));
	}
	if(user.red.upgradeCount[5].gt(0)){
		mult = mult.times(user.red.resets.times(5).plus(1));
		update("currentRBBonus",display(user.red.resets.times(5).plus(1)));
	}
	return mult;
}

function process(num) {
	let tot = getRedButtonTotalMult().times(num)
	user.totPower = user.totPower.plus(tot)
	user.red.tick=0;
}

function testStuff() {
	process(1000);
}

function redCycleUpg() {
	var price=user.red.tickMultPrice;
	if(user.totPower.gte(price)) {
		let fibo = new Decimal(1);
		let fibo2 = new Decimal(1);
		let mid = new Decimal(0);
		let count = new Decimal(user.red.upgradeCount[6]);
		while(count.gt(0)){
			mid = fibo2;
			fibo2 = fibo.plus(mid.div(2));
			fibo = mid;
			count = count.minus(1);
		}
		user.totPower = user.totPower.minus(price);
		user.red.tickMax = user.red.tickMax.times(Decimal.pow(0.9,fibo2));
		let boost = Decimal.pow(1.1,fibo2).times(10);
		user.red.tps = user.red.tps.times(Decimal.pow(new Decimal(1).div(0.9),fibo2));
		$("cycleReducAmount").innerHTML = display(boost);
		let increase = new Decimal(10);
		if(user.red.tickMultCount.gt(50)){
			let num = new Decimal(user.red.tickMultCount);
			while(num.gt(49)){
				increase = increase.times(10);
				num = num.minus(50);
			}
		}
		user.red.tickMultPrice = user.red.tickMultPrice.times(increase);
		user.red.tickMultCount = user.red.tickMultCount.plus(1);
		update("redCycleUpgCost", display(user.red.tickMultPrice));
	}
}

function redCycleMax() {
	while(user.totPower.gte(user.red.tickMultPrice)){
		redCycleUpg();
	}
}
	
function checkButtonUpgrade(num) {
	var price=user.red.buttonPrice[num-1];
	if(user.totPower.gte(price)&&user.red.limits[num-1].gt(user.red.mults[num-1])) {
		user.totPower = user.totPower.minus(price);
		if(user.red.clickedIndex+1 == num) {user.red.mults[num-1]=user.red.mults[num-1].div(Decimal.pow(10,user.red.upgradeCount[4]));}
		user.red.mults[num-1] = user.red.mults[num-1].plus(new Decimal(1));
		if(user.red.clickedIndex+1 == num) {
			user.red.mults[num-1]=user.red.mults[num-1].times(Decimal.pow(10,user.red.upgradeCount[4]));
		}
		let priceIncrease = new Decimal(num+1).log10().plus(1).times(1.5);
		user.red.buttonPrice[num-1] = price.times(priceIncrease);
		user.red.buttonsPurchased[num-1]=user.red.buttonPurchased[num-1].plus(1);
	}
	updateAll();
}

function maxRedMult(num) {
	while(user.totPower.gte(user.red.buttonPrice[num-1])&&user.red.limits[num-1].gt(user.red.mults[num-1])) {
		checkButtonUpgrade(num);
	}
}

function checkUpgrade(color, dex) {
	let index = user[color].upgrades.indexOf(dex);
	if(user[color].upgradeIncrease[index]==0&&user[color].upgradeCount[index]==1) {
		$(dex).style.background="darkGreen";
		return;
	}
	if(canBuyUpgrade(color, index)){
		user[color].energy = user[color].energy.minus(user[color].upgradePrices[index]);
		user[color].upgradeCount[index] = user[color].upgradeCount[index].plus(1);
		user[color].upgradePrices[index] = user[color].upgradePrices[index].times(user[color].upgradeIncrease[index]);
	}
	updateAll();
}

function canBuyUpgrade(color, index) {
	return user[color].energy.gte(user[color].upgradePrices[index])
}

function checkAddRed() {
	if(user.red.index.lt(user.red.indexLimit)){
		if(user.totPower.gte(user.red.addButtonPrice)){
			user.totPower = user.totPower.minus(user.red.addButtonPrice)
			user.red.index = user.red.index.plus(1);
			addRedButton(user.red.index);
		}
	}
	updateAll();
}

function buyMaxRed() {
	while(user.red.index.lt(user.red.indexLimit)&&user.totPower.gte(user.red.addButtonPrice)){
		checkAddRed();
	}
}

function checkNewButtons() {
	let max = user.red.mults.length+1;
	for(var i=1;i<max;i++){
		var test = $("buttonSet"+i);
		if(test == null){
			makeRedButton(i);
		}
	}
}

function makeRedButton(n) {
	var newDiv = document.createElement("div");
	var newRedCir = document.createElement("button");
	var newDiv2 = document.createElement("div");
	var newUpgrade = document.createElement("button");
	var newMax = document.createElement("button");
	var newBreak = document.createElement("button");
	newDiv.id = "buttonSet"+n;
	newRedCir.id = "redCircle"+n;
	newUpgrade.id = "upgrade"+n;
	newMax.id = "max"+n;
	newBreak.id = "break"+n;
	newDiv.className = 'lowerLayer';
	newDiv.style = 'display:flex;justify-content:center';
	newRedCir.setAttribute("onclick", "redClick("+n+")");
	newRedCir.className = 'redButtonSmall';
	newRedCir.innerHTML = 'x1';
	newDiv2.style = 'display:flex;flex-direction:column;justify-content:space-evenly';
	newUpgrade.setAttribute("onclick", "checkButtonUpgrade("+n+")");
	newUpgrade.className = 'multUpgrade';
	newUpgrade.innerHTML = 'Upgrade your Red Button<br/>Cost: 100 Power';
	newMax.setAttribute("onclick", "maxRedMult("+n+")");
	newMax.className = "multUpgrade";
	newMax.innerHTML = "Max Mult";
	newBreak.setAttribute("onclick", "breakUpgrade("+n+")");
	newBreak.className = 'breakLimitButton';
	newBreak.innerHTML = "Raise Limit to<span id='redLimit"+n+"'> 100</span><br/>"+
		"Cost: <span id='redBreakCost"+n+"'>3</span> <span style='color:darkRed'>Energy</span>";
	newDiv.appendChild(newRedCir);
	newDiv2.appendChild(newUpgrade);
	newDiv2.appendChild(newMax);
	newDiv.appendChild(newDiv2);
	newDiv.appendChild(newBreak);
	/*if(n%10==0){
		var last = n.toString().slice(0,-1);
		insertAfter(newDiv, $("buttonGroup"+last));
	}
	else {
		insertAfter(newDiv, $("buttonSet"+n));
	}*/
	$("buttonArea").appendChild(newDiv);
}

function addRedButton(n) {
	makeRedButton(n);
	if(user.red.brokenAmount[n-1] == null){
		user.red.brokenAmount.push(new Decimal(0));
		let j = n-2;
		user.red.breakPrice.push(Decimal.floor(user.red.breakPrice[j].times(1.5)));
	}
	user.red.mults.push(new Decimal(2));
	user.red.limits.push(new Decimal(10));
	user.red.buttonsPurchased.push(new Decimal(0));
	user.red.buttonPrice.push(Decimal.pow(new Decimal(10),user.red.index).times(new Decimal(2.5)));
	user.red.addButtonPrice = user.red.addButtonPrice.times(10);
}

function minimizeAll() {
	for(i=1;i<user.red.mults.length;i++){
		$("buttonSet"+i).style.display = "none";
	}
}

function breakUpgrade(num) {
	let j = num-1;
	if(user.red.energy.gte(user.red.breakPrice[j])) {
		user.red.energy = user.red.energy.minus(user.red.breakPrice[j]);
		user.red.limits[j] = user.red.limits[j].times(10);
		let name = "break"+num;
		$(name).style.display = "none";
		user.red.breakPrice[j] = user.red.breakPrice[j].times(25);
		name = "redBreakCost"+num;
		$(name).innerHTML = user.red.breakPrice[j];
		user.red.brokenAmount[j] = user.red.brokenAmount[j].plus(1);
		name = "redLimit"+num;
		$(name).innerHTML = user.red.limits[j].times(10);
	}
}

function getRedPrestige() {
	if (user.totPower.gte(new Decimal(1e10))) return user.totPower.log10().minus(9).pow(user.red.upgradeCount[7].div(3).plus(2));
	else return new Decimal(0);
}

function redReset() {
	if(getRedPrestige().gte(1)){
		for(i=2;i<user.red.mults.length+1;i++){
			$("buttonSet"+i).remove();
		}
		user.red.energy = user.red.energy.plus(getRedPrestige());
		user.red.resets = user.red.resets.plus(1);
		user.red.tick = getDefaultUser().red.tick;
		user.red.tickMax = getDefaultUser().red.tickMax;
		user.red.tps = getDefaultUser().red.tps;
		user.red.tickMultPrice = getDefaultUser().red.tickMultPrice;
		user.red.tickMultCount = getDefaultUser().red.tickMultCount;
		user.red.mults = getDefaultUser().red.mults;
		user.red.buttonPrice = getDefaultUser().red.buttonPrice;
		user.red.addButtonPrice = getDefaultUser().red.addButtonPrice;
		user.red.index = getDefaultUser().red.index;
		user.red.clickedBoost = new Decimal(0);
		user.red.clickedIndex = -1;
		user.red.buttonsPurchased = getDefaultUser().red.buttonsPurchased;
		user.totPower = new Decimal(0);
		update("redCycleUpgCost", new Decimal(1e4));
		updateAll();
	}
}

function checkKey(event) {
	if(event.key == "m"){
		checkAddRed();
		for(i=user.red.mults.length;i>0;i--){
			if(user.red.mults[i-1].lt(user.red.limits[i-1])){
				maxRedMult(i);
			}
		}
		redCycleUpg();
	}
	if(event.key == "r"){
		redReset();
	}
}

function showTab(tabName) { //Tab switching function
	var tabs = document.getElementsByClassName('tab');
	var tab;
	for (var i = 0; i < tabs.length; i++) {
		tab = tabs.item(i);
		if (tab.id === tabName) {
			tab.style.display = 'block';
			user.currentTab = tabName;
		}
		else tab.style.display = 'none';
	}
}

function save(){
	saveGame()
	$("savedInfo").style.display="inline";
	$("savedInfo").style.position="absolute";
	function foo() {$("savedInfo").style.display="none"}
	setTimeout(foo, 2000);
}

function load(){
	if(localStorage.getItem("colorWheelsSave") !== null) loadGame(localStorage.getItem("colorWheelsSave"));
	return user;
}

function exportSave() {
	var tempInput = document.createElement("input"); //You have to create a new document element
	tempInput.style = "position: absolute; left: -1000px; top: -1000px"; //Say it's out of the window view
	tempInput.value = btoa(JSON.stringify(user)); //Fill it with the player save file
	document.body.appendChild(tempInput); //Stick the window on the main document
	tempInput.select(); //Select the window
	document.execCommand("copy"); //Stick the contents of said window into the clipboard
	document.body.removeChild(tempInput); //Delete the go-between window
	alert("Save copied to clipboard"); //Tell the player it all worked
}

function importSave() {
	let input = prompt("Paste your save below please")
	if (!(input === null || input === "")) {
		loadSave(input,true)
	}
}

function updateAll(){
	update("powerAmount", "Total Power: "+display(user.totPower));
	if(user.totPower.lt(1e4)){
		$("cycleUpgBit").style.display = "none";
	}
	if(user.totPower.gte(1e4)){
		$("cycleUpgBit").style.display = "";
	}
	if(user.red.energy.gt(0)){
		$("redEnergyArea").style.display = "";
		$("redEnergyAmount").innerHTML = display(user.red.energy);
		$("tabs").style.display = "";
	}
	else { $("redEnergyArea").style.display = "none";}
	var dispMult = display(getRedButtonTotalMult());
	update("powerMultArea", "Button Mult: x"+dispMult);
	if(user.red.tps.lt(10)){
		update("redCycle", "Reset Cycle: "+display(user.red.tick)+"/"+display(user.red.tickMax));
	}
	else {
		update("redCycle", display(user.red.tps)+" Cycles per second");
	}
	for(var i=1;i<user.red.mults.length+1;i++){
		$("buttonSet"+i).style.display="flex";
		var name = "redCircle" + i;
		update(name, "x"+display(user.red.mults[i-1]));
		if (user.red.limits[i-1].gt(user.red.mults[i-1])) {
			update("upgrade"+i, "Upgrade your Red button<br/>Cost: "+display(user.red.buttonPrice[i-1])+" Power");
		} else {
			if(user.red.upgradeCount[8].eq(0)){
				update("upgrade"+i, "Max Multiplier!");
			} else{
				if(user.red.limits[i-1].equals(user.red.buttonsPurchased[i-1])){
					update("upgrade"+i, "Max boosted to: ^"+user.red.upgradeCount[8].div(10).plus(1));
				} else{
					update("upgrade"+i, "Max not boosted");
				}
			}
		}	
	}
	let bLButtons = document.getElementsByClassName("breakLimitButton");
	var bLButton;
	for (var j = 0; j < bLButtons.length; j++) {
		bLButton = bLButtons.item(j);
		if (user.red.upgradeCount[2]>0&&user.red.brokenAmount[j]<user.red.upgradeCount[2]) {
			bLButton.style.display = 'block';
		}
		else bLButton.style.display = 'none';
	}
	let max = user.red.indexLimit;
	for(var i=user.red.mults.length+1;i<=max;i++){
		if(typeof(element) != 'undefined' && element != null){
			$("buttonSet"+i).style.display="none";
		} 
		else{ continue;	}
	}
	var dispAddRedPrice = display(user.red.addButtonPrice);
	update("addRedButton", `Add another Red Button<br/>Cost: ${dispAddRedPrice} Power`);
	for(i=0;i<user.red.buttonPrice.length;i++){
		var j = i+1;
		if(user.totPower.gte(user.red.buttonPrice[i])||user.red.mults[i].eq(user.red.limits[1])) {
			$("upgrade"+j).style.opacity = 1.0;
		}
		else{
			$("upgrade"+j).style.opacity = 0.6;
		}
		if(user.red.upgradeCount[2].gt(0)){
			$("break"+j).style.display = "";
			if(user.red.energy.gte(user.red.breakPrice[i])){
				$("break"+j).style.opacity = 1.0;
			}
			else {
				$("break"+j).style.opacity = 0.6;
			}
			$("redBreakCost"+j).innerHTML = display(user.red.breakPrice[i]);
			$("redLimit"+j).innerHTML = display(user.red.limits[i].times(10));
		}
	}
	if(user.totPower.gte(user.red.addButtonPrice)) $("addRedButton").style.opacity = 1.0;
	else $("addRedButton").style.opacity = 0.6;
	if(user.red.index.gte(user.red.indexLimit)) {
		$("addRedButton").style.display = "none";
	} else {
		$("addRedButton").style.display = "";
	}
	if(user.totPower.gte(1e10)){
		$("redPrestigeButton").style.display = "";
	} else {		
		$("redPrestigeButton").style.display = "none";
	}
	if(user.totPower.gte(user.red.tickMultPrice)) $("redCycleReduc").style.opacity = 1.0;
	else $("redCycleReduc").style.opacity = 0.6;
	update("redCycleUpgCost", display(user.red.tickMultPrice));
	$("redPrestigeButton").style.opacity = getRedPrestige().gt(0)?1:0.6
	$("redPrestigeAmount").innerHTML = display(getRedPrestige()) + " Energy";
	$("currentCPBBonus").innerHTML = user.red.upgradeCount[4];
	update("currentMBBonus", user.red.upgradeCount[8].div(10).plus(1));
	user.red.upgrades.forEach(function(id){
		let i = user.red.upgrades.indexOf(id);
		$(id+"Cost").innerHTML = user.red.upgradePrices[i];
		if(user.red.upgradeCount[i].gt(0)&&user.red.upgradeIncrease[i].lte(0)){
			$(id).style.background = "forestGreen";
		}
		else{$(id).style.background = "grey";}
		if(user.red.energy.gte(user.red.upgradePrices[i])){
			$(id).style.opacity = 1.0;
		}
		else if(user.red.energy.lt(user.red.upgradePrices[i])){
			$(id).style.opacity = 0.6;
		}
	});
	let ten = new Decimal(10);
	user.red.indexLimit = ten.plus(user.red.upgradeCount[3].times(10));
	showTab(user.currentTab);
	$("redButtonCount").innerHTML = user.red.mults.length;
	if(user.totPower.gt(user.maxTotPower)){
		$("maxTotPower").innerHTML = display(user.totPower);
		user.maxTotPower = new Decimal(user.totPower);
	}
	if(user.red.energy.gt($("maxRedEnergy").innerHTML)){
		$("maxRedEnergy").innerHTML = display(user.red.energy);
	}
	$("currentTPBBonus").innerHTML = display(user.maxTotPower.log10().log10().plus(1));
	//I don't know why the things below here are required, but something else is weird and
	//these functions fix the weirdness.
	user.red.limits.length = user.red.mults.length;
	for(i=0;i<user.red.limits.length;i++){
		user.red.limits[i]=Decimal.pow(10,user.red.brokenAmount[i].plus(1));
	}
}

function clearSave(){
	if(confirm("Do you really want to delete your save?\nThis cannot be undone.")){
		for(i=2;i<user.red.mults.length+1;i++){
			$("buttonSet"+i).style.display="none";
		}
		user = getDefaultUser();
		updateAll();
		localStorage.removeItem("colorWheelsSave");
	}
}

function startCycle(){
	load();
	checkNewButtons();
	updateAll();
	setInterval(gameCycle, 10);
	setInterval(save, 30000);
}
