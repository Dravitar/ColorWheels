function $(x) { return document.getElementById(x); }

function getDefaultUser() {
	return {
		totPower:new Decimal(0),
		blue: {
			tick:0,
			tickMax:new Decimal(1000),
			tickMultPrice:new Decimal(1.00e4),
			tickMultCount:new Decimal(0),
			mults: [new Decimal(1)],
			limits: [new Decimal(10)],
			buttonPrice: [new Decimal(10)],
			clicked: 0,
			upgrades:       ["PB","CU","LB","BB","CPB","RB"],
			upgradeCount:   [new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)],
			upgradePrices:  [new Decimal(1)   ,new Decimal(1)   ,new Decimal(10)  ,new Decimal(50)  ,new Decimal(100) ,new Decimal(10)],
			upgradeIncrease:[new Decimal(0)   ,new Decimal(100) ,new Decimal(50)  ,new Decimal(50)  ,new Decimal(1e3) ,new Decimal(0)],
			addButtonPrice: new Decimal(100),
			index: 1,
			indexLimit: new Decimal(10),
			energy: new Decimal(0),
		},
		green: {
			tick:new Decimal(0),
			tickMax:new Decimal(1000),
			tickMultPrice:new Decimal(1e4),
			tickMultCount:new Decimal(0),
			mults: [new Decimal(1)],
			buttonPrice: [new Decimal(10)],
			addButtonPrice: new Decimal(100),
			index: new Decimal(1),
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
	let tickMax = user.blue.tickMax.times(Decimal.pow(0.9,user.blue.tickMultCount));
	user.blue.tick += diff;
	if(user.blue.tick >= user.blue.tickMax) process(Decimal.round(new Decimal(user.blue.tick).div(user.blue.tickMax)));
	update("blueCycle", `Reset Cycle: ${user.blue.tick}/${user.blue.tickMax}`);
	user.lastTick = now;
	updateAll();
}

function blueClick(num) {
	let mid=user.blue.upgradeCount[1];
	let old=user.blue.clicked;
	user.blue.clicked=num;
	console.log("test0");
	if(mid.gt(new Decimal(0))){
		console.log("test0.5");
		if(num!==old) {
			console.log("test1");
			user.blue.mults[num-1]=new Decimal(""+mid+user.blue.mults[num-1]);
			if(old!==0){
				console.log("test2");
				user.blue.mults[old-1]=new Decimal(user.blue.mults[old-1].toString().substring(1));
			}
		}
	}
}

function getBlueButtonTotalMult() {
	var mult=new Decimal(1);
	user.blue.mults.forEach(function(value) {
		mult = mult.times(value)
	});
	if(user.blue.upgradeCount[0].gt(0)){ mult = mult.times(user.blue.energy.plus(1));}
	update("blueEnergyMultBoost",display(user.blue.energy.plus(1)));
	return mult;
}

function process(num) {
	let tot = getBlueButtonTotalMult().times(num)
	user.totPower = user.totPower.plus(tot)
	user.blue.tick=0;
}

function blueCycleUpg() {
	var price=user.blue.tickMultPrice;
	if(user.totPower.gte(price)) {
		user.totPower = user.totPower.minus(price);
		user.blue.tickMax = user.blue.tickMax.times(0.9);
		user.blue.tickMultPrice = user.blue.tickMultPrice.times(100);
		user.blue.tickMultCount = user.blue.tickMultCount.plus(1);
		update("blueCycleUpgCost", display(user.blue.tickMultPrice));
	}
}
	
function checkButtonUpgrade(num) {
	var price=user.blue.buttonPrice[num-1];
	if(user.totPower.gte(price)&&user.blue.limits[num-1].gt(user.blue.mults[num-1])) {
		user.totPower = user.totPower.minus(price);
		user.blue.mults[num-1] = user.blue.mults[num-1].plus(new Decimal(1));
		user.blue.buttonPrice[num-1] = price.times(new Decimal(2.5));
	}
	updateAll();
}

function checkUpgrade(color, dex) {
	let index = user[color].upgrades.indexOf(dex);
	if(user[color].upgradeIncrease[index]==0&&user[color].upgradeCount[index]==1) return;
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

function checkAddBlue() {
	if(user.blue.index<user.blue.indexLimit){
		if(user.totPower.gte(user.blue.addButtonPrice)){
			user.totPower = user.totPower.minus(user.blue.addButtonPrice)
			user.blue.index++;
			addBlueButton(user.blue.index);
			$("buttonSet"+user.blue.index).style.display="block";
			user.blue.mults.push(new Decimal(2));
			user.blue.limits.push(new Decimal(10));
			user.blue.buttonPrice.push(Decimal.pow(new Decimal(10),new Decimal(user.blue.index)).times(new Decimal(2.5)));
			user.blue.addButtonPrice = user.blue.addButtonPrice.times(10);
		}
	}
	updateAll();
}

function addBlueButton(n) {
	window["buttonSet"+n] = document.createElement('div');
	window["blueCircle"+n] = document.createElement('button');
	window["upgrade"+n] = document.createElement('button');
	window["break"+n] = document.createElement('button');
	window["buttonSet"+n].class = 'lowerLayer';
	window["buttonSet"+n].style = 'display:block';
	window["blueCircle"+n].onclick = 'blueClick("+n+")';
	window["blueCircle"+n].class = 'blueButtonSmall';
	window["blueCircle"+n].innerHTML = 'x1';
	window["upgrade"+n].onclick = 'checkButtonUpgrade("+n+")';
	window["upgrade"+n].class = 'blueButtonSmall';
	window["upgrade"+n].innerHTML = 'Upgrade your Blue Button<br/>Cost: 100 Power';
	window["break"+n].onclick = 'breakUpgrade("+n+")';
	window["break"+n].class = 'breakLimitButton';
	window["break"+n].innerHTML = "LIMIT BREAK!<br/>Cost: 5 <span style='color:darkBlue'>Energy</span>"
	$("buttonSet"+n).appendChild("blueCircle"+n);
	$("buttonSet"+n).appendChild("upgrade"+n");
	$("buttonSet"+n).appendChild("break"+n);
	$("buttonArea").appendChild("buttonSet"+n);
}

function getBluePrestige() {
	if (user.totPower.gte(new Decimal(1e10))) return user.totPower.log10().minus(9).log2().plus(1);
	else return new Decimal(0);
}

function blueReset() {
	if(getBluePrestige().gte(1)){
		let energy = user.blue.energy.plus(getBluePrestige());
		let count = user.blue.upgradeCount;
		let prices = user.blue.upgradePrices;
		user.blue = getDefaultUser().blue;
		user.totPower = new Decimal(0);
		user.blue.energy = energy;
		user.blue.upgradeCount = count;
		user.blue.upgradePrices = prices;
		update("blueCycleUpgCost", new Decimal(1e4));
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
		$("blueCycleReduc").style.display = "none";
	}
	if(user.totPower.gte(1e4)){
		$("blueCycleReduc").style.display = "";
	}
	if(user.blue.energy.gte(0)){
		$("blueEnergyArea").style.display = "";
		$("blueEnergyAmount").innerHTML = display(user.blue.energy);
		$("tabs").style.display = "";
	}
	else { $("blueEnergyArea").style.display = "none";}
	var dispMult = display(getBlueButtonTotalMult());
	update("powerMultArea", "Button Mult: x"+dispMult);
	update("blueCycle", `Reset Cycle: ${user.blue.tick}/${user.blue.tickMax}`);
	for(var i=1;i<user.blue.mults.length+1;i++){
		$("buttonSet"+i).style.display="block";
		var name = "blueCircle" + i;
		update(name, "x"+display(user.blue.mults[i-1]));
		let bLButtons = document.getElementsByClassName("breakLimitButton");
		var bLButton;
		for (var j = 0; j < bLButtons.length; j++) {
			bLButton = bLButtons.item(j);
			if (user.blue.upgradeCount[2]>0) {
				bLButton.style.display = 'block';
			}
			else bLButton.style.display = 'none';
		}
		if (user.blue.limits[i-1].gt(user.blue.mults[i-1])) {
			update("upgrade"+i, `Upgrade your Blue button<br/>Cost: ${display(user.blue.buttonPrice[i-1])} Power`);
		} else {
			update("upgrade"+i, "Max Multiplier!");
		}	
	}
	for(var i=user.blue.mults.length+1;i<=user.blue.indexLimit;i++){
		$("buttonSet"+i).style.display="none";
	}
	var dispAddBluePrice = display(user.blue.addButtonPrice);
	update("addBlueButton", `Add another Blue Button<br/>Cost: ${dispAddBluePrice} Power`);
	for(i=0;i<user.blue.buttonPrice.length;i++){
		if(user.totPower.gte(user.blue.buttonPrice[i])||user.blue.mults[i].eq(user.blue.limits[1])) {
			var j = i+1;
			$("upgrade"+j).style.opacity = 1.0;
		}
		else{
			var j = i+1;
			$("upgrade"+j).style.opacity = 0.6;
		}
	}
	if(user.totPower.gte(user.blue.addButtonPrice)) $("addBlueButton").style.opacity = 1.0;
	else $("addBlueButton").style.opacity = 0.6;
	if(user.blue.index>=user.blue.indexLimit) {
		$("addBlueButton").style.display = "none";
		$("bluePrestigeButton").style.display = "";
	} else {
		$("addBlueButton").style.display = "";
		$("bluePrestigeButton").style.display = "none";
	}
	if(user.totPower.gte(user.blue.tickMultPrice)) $("blueCycleReduc").style.opacity = 1.0;
	else $("blueCycleReduc").style.opacity = 0.6;
	$("bluePrestigeButton").style.opacity = getBluePrestige().gt(0)?1:0.6
	$("bluePrestigeAmount").innerHTML = display(getBluePrestige()) + " Energy";
	$("currentCUBonus").innerHTML = user.blue.upgradeCount[0];
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
