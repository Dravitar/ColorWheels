function $(x) { return document.getElementById(x); }

function getDefaultUser() {
	return {
		totPower:new Decimal(0),
		red: {
			tick:0,
			tickMax:new Decimal(1000),
			tickMultPrice:new Decimal(1.00e4),
			tickMultCount:new Decimal(0),
			mults: [new Decimal(1)],
			buttonPrice: [new Decimal(10)],
			addButtonPrice: new Decimal(100),
			index: new Decimal(1),
			//All the above gets reset on a red reset
			limits: [new Decimal(10)],
			breakPrice: [new Decimal(3)],
			brokenAmount: [new Decimal(0)],
			clicked: 0,
			upgrades:       ["PB","CP","LB","BB","CPB","RB"],
			upgradeCount:   [new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)],
			upgradePrices:  [new Decimal(1)   ,new Decimal(1)   ,new Decimal(10)  ,new Decimal(50)  ,new Decimal(100) ,new Decimal(10)],
			upgradeIncrease:[new Decimal(0)   ,new Decimal(0)   ,new Decimal(50)  ,new Decimal(50)  ,new Decimal(1e3) ,new Decimal(0)],
			indexLimit: new Decimal(10),
			energy: new Decimal(0),
			resets: new Decimal(0),
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

function gameCycle(){
	let now = new Date().getTime();
	let diff = now - user.lastTick;
	let tickMax = user.red.tickMax.times(Decimal.pow(0.9,user.red.tickMultCount));
	user.red.tick += diff;
	if(user.red.tick >= user.red.tickMax) process(Decimal.round(new Decimal(user.red.tick).div(user.red.tickMax)));
	update("redCycle", `Reset Cycle: ${user.red.tick}/${user.red.tickMax}`);
	user.lastTick = now;
	updateAll();
}

function redClick(num) {
	let mid=user.red.upgradeCount[1];
	let old=user.red.clicked;
	user.red.clicked=num;
	if(mid.gt(new Decimal(0))){
		if(num!==old) {
			user.red.mults[num-1]=new Decimal(""+mid+user.red.mults[num-1]);
			if(old!==0){
				user.red.mults[old-1]=new Decimal(user.red.mults[old-1].toString().substring(1));
			}
		}
	}
}

function getRedButtonTotalMult() {
	var mult=new Decimal(1);
	user.red.mults.forEach(function(value) {
		mult = mult.times(value)
	});
	if(user.red.upgradeCount[0].gt(0)){ 
		mult = mult.times(user.red.energy.plus(1));
		update("currentPBBonus",display(user.red.energy.plus(1)));
	}
	if(user.red.upgradeCount[5].gt(0)){
		mult = mult.times(user.red.resets.div(5).plus(1));
		update("currentRBBonus",display(user.red.resets.div(5).plus(1)));
	}
	return mult;
}

function process(num) {
	let tot = getRedButtonTotalMult().times(num)
	user.totPower = user.totPower.plus(tot)
	user.red.tick=0;
}

function redCycleUpg() {
	var price=user.red.tickMultPrice;
	if(user.totPower.gte(price)) {
		user.totPower = user.totPower.minus(price);
		user.red.tickMax = user.red.tickMax.times(0.9);
		user.red.tickMultPrice = user.red.tickMultPrice.times(100);
		user.red.tickMultCount = user.red.tickMultCount.plus(1);
		update("redCycleUpgCost", display(user.red.tickMultPrice));
	}
}
	
function checkButtonUpgrade(num) {
	var price=user.red.buttonPrice[num-1];
	if(user.totPower.gte(price)&&user.red.limits[num-1].gt(user.red.mults[num-1])) {
		user.totPower = user.totPower.minus(price);
		user.red.mults[num-1] = user.red.mults[num-1].plus(new Decimal(1));
		user.red.buttonPrice[num-1] = price.times(new Decimal(2.5));
	}
	updateAll();
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
			if(user.red.index.gt(10)){
				addRedButton(user.red.index);
			}
			else if(user.red.index.lte(10)){
				$("buttonSet"+user.red.index).style.display="block";
			}
			console.log(user.red.index);
			user.red.brokenAmount.push(new Decimal(0));
			user.red.mults.push(new Decimal(2));
			user.red.limits.push(new Decimal(10));
			let j = parseInt(user.red.index.toString())-2;
			user.red.breakPrice.push(Decimal.floor(user.red.breakPrice[j].times(1.5)));
			user.red.buttonPrice.push(Decimal.pow(new Decimal(10),user.red.index).times(new Decimal(2.5)));
			user.red.addButtonPrice = user.red.addButtonPrice.times(10);
		}
	}
	updateAll();
}

function addRedButton(n) {
	window["buttonSet"+n] = document.createElement('div');
	window["redCircle"+n] = document.createElement('button');
	window["upgrade"+n] = document.createElement('button');
	window["break"+n] = document.createElement('button');
	window["buttonSet"+n].class = 'lowerLayer';
	window["buttonSet"+n].style = 'display:block';
	window["redCircle"+n].onclick = 'redClick("+n+")';
	window["redCircle"+n].class = 'redButtonSmall';
	window["redCircle"+n].innerHTML = 'x1';
	window["upgrade"+n].onclick = 'checkButtonUpgrade("+n+")';
	window["upgrade"+n].class = 'redButtonSmall';
	window["upgrade"+n].innerHTML = 'Upgrade your Red Button<br/>Cost: 100 Power';
	window["break"+n].onclick = 'breakUpgrade("+n+")';
	window["break"+n].class = 'breakLimitButton';
	window["break"+n].innerHTML = "LIMIT BREAK!<br/>Cost: 5 <span style='color:darkRed'>Energy</span>"
	$("buttonSet"+n).appendChild($("redCircle"+n));
	$("buttonSet"+n).appendChild($("upgrade"+n));
	$("buttonSet"+n).appendChild($("break"+n));
	$("buttonArea").appendChild($("buttonSet"+n));
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
		$(name).innerHTML = user.red.limits[j];
	}
}

function getRedPrestige() {
	if (user.totPower.gte(new Decimal(1e10))) return user.totPower.log10().minus(9).log2().plus(1);
	else return new Decimal(0);
}

function redReset() {
	if(getRedPrestige().gte(1)){
		user.red.energy = user.red.energy.plus(getRedPrestige());
		user.red.resets = user.red.resets.plus(1);
		user.red.tick = getDefaultUser().red.tick;
		user.red.tickMax = getDefaultUser().red.tickMax;
		user.red.tickMultPrice = getDefaultUser().red.tickMultPrice;
		user.red.tickMultCount = getDefaultUser().red.tickMultCount;
		user.red.mults = getDefaultUser().red.mults;
		user.red.buttonPrice = getDefaultUser().red.buttonPrice;
		user.red.addButtonPrice = getDefaultUser().red.addButtonPrice;
		user.red.index = getDefaultUser().red.index;
		user.red.clicked = 0;
		user.totPower = new Decimal(0);
		update("redCycleUpgCost", new Decimal(1e4));
		updateAll();
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
		$("redCycleReduc").style.display = "none";
	}
	if(user.totPower.gte(1e4)){
		$("redCycleReduc").style.display = "";
	}
	if(user.red.energy.gt(0)){
		$("redEnergyArea").style.display = "";
		$("redEnergyAmount").innerHTML = display(user.red.energy);
		$("tabs").style.display = "";
	}
	else { $("redEnergyArea").style.display = "none";}
	var dispMult = display(getRedButtonTotalMult());
	update("powerMultArea", "Button Mult: x"+dispMult);
	update("redCycle", "Reset Cycle: "+display(user.red.tick)+"/"+display(user.red.tickMax));
	for(var i=1;i<user.red.mults.length+1;i++){
		$("buttonSet"+i).style.display="block";
		var name = "redCircle" + i;
		update(name, "x"+display(user.red.mults[i-1]));
		if (user.red.limits[i-1].gt(user.red.mults[i-1])) {
			update("upgrade"+i, "Upgrade your Red button<br/>Cost: "+display(user.red.buttonPrice[i-1])+" Power");
		} else {
			update("upgrade"+i, "Max Multiplier!");
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
		$("buttonSet"+i).style.display="none";
	}
	var dispAddRedPrice = display(user.red.addButtonPrice);
	update("addRedButton", `Add another Red Button<br/>Cost: ${dispAddRedPrice} Power`);
	for(i=0;i<user.red.buttonPrice.length;i++){
		if(user.totPower.gte(user.red.buttonPrice[i])||user.red.mults[i].eq(user.red.limits[1])) {
			var j = i+1;
			$("upgrade"+j).style.opacity = 1.0;
		}
		else{
			var j = i+1;
			$("upgrade"+j).style.opacity = 0.6;
		}
		if(user.red.upgradeCount[2].gt(0)){
			$("break"+j).style.display = "";
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
	$("currentCPBBonus").innerHTML = user.red.upgradeCount[5];
	user.red.upgrades.forEach(function(id){
		let i = user.red.upgrades.indexOf(id);
		if(user.red.upgradeCount[i].gt(0)&&user.red.upgradeIncrease[i].lte(0)){
			$(id).style.background = "forestGreen";
		}
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
}

function clearSave(){
	if(confirm("Do you really want to delete your save?\nThis cannot be undone.")){
		user = getDefaultUser();
		updateAll();
		localStorage.removeItem("colorWheelsSave");
	}
}

function startCycle(){
	load();
	updateAll();
	setInterval(gameCycle, 10);
	setInterval(save, 30000);
}
