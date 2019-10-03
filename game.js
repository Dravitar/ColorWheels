function getDefaultUser() {
	return {
		totPower:new Decimal(0),
		blue: {
			tick:0,
			tickMax:new Decimal(1000),
			mults: [new Decimal(1)],
			limits: [new Decimal(10)],
			buttonPrice: [new Decimal(10)],
			clicked: 0,
			upgrades:       ["CR","CU","LB","BB"],
			upgradeCount:   [new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ],
			upgradePrices:  [new Decimal(1)   ,new Decimal(1)   ,new Decimal(10)  ,new Decimal(50)  ],
			upgradeIncrease:[new Decimal(10)  ,new Decimal(10)  ,new Decimal(0)   ,new Decimal(50)  ],
			bonuses:        [new Decimal(10)  ,new Decimal(1)   ,new Decimal(0)   ,new Decimal(0)   ],
			addButtonPrice: new Decimal(100),
			index: 1,
			indexLimit: new Decimal(10),
			energy: new Decimal(0),
		},
		green: {
			tick:new Decimal(0),
			tickMax:new Decimal(1000),
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
	document.getElementById(get).innerHTML=set;
}

function gameCycle(){
	let now = new Date().getTime();
	let diff = now - user.lastTick;
	let tickMax = user.blue.tickMax.times(Decimal.pow(user.blue.bonuses[0],user.blue.upgradeCount[0]));
	user.blue.tick += diff;
	if(user.blue.tick >= user.blue.tickMax) process(Decimal.round(new Decimal(user.blue.tick).div(user.blue.tickMax)));
	update("blueCycle", `Reset Cycle: ${user.blue.tick}/${user.blue.tickMax}`);
	user.lastTick = now;
	updateAll();
}

function blueClick(num) {
	let mid=user.blue.bonuses[1].times(user.blue.upgradeCount[1]);
	if(mid.gt(new Decimal(0))){
		user.blue.mults[num-1]=new Decimal(""+mid+user.blue.mults[num-1]);
		if(user.blue.clicked.neq(new Decimal(0))) {
			user.blue.mults[user.blue.clicked-1]=new Decimal(user.blue.mults[user.blue.clicked-1].toString().substring(1));
		}
	}
	user.blue.clicked=num;
}

function getBlueButtonTotalMult() {
	var mult=new Decimal(1);
	user.blue.mults.forEach(function(value) {
		mult = mult.times(value)
	});
	mult = mult.times(user.blue.energy.plus(1));
	return mult
}

function process(num) {
	let tot = getBlueButtonTotalMult().times(num)
	user.totPower = user.totPower.plus(tot)
	user.blue.tick=0;
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
	if(canBuyUpgrade(color, index)){
		user[color].energy = user[color].energy.minus(user[color].upgradePrices[index]);
		user[color].upgradeCount[index] = user[color].upgradeCount[index].plus(1);
		user[color].upgradePrices[index] = user[color].upgradePrices[index].times(user[color].upgradeIncrease[index]);
	}
	updateAll();
}

function canBuyUpgrade(color, index) {
	return user[color].energy.gte(user[color].upgradePrice[index])
}

function checkAddBlue() {
	if(user.blue.index<10){
		if(user.totPower.gte(user.blue.addButtonPrice)){
			user.totPower = user.totPower.minus(user.blue.addButtonPrice)
			user.blue.index++;
			document.getElementById("buttonSet"+user.blue.index).style.display="block";
			user.blue.mults.push(new Decimal(2));
			user.blue.limits.push(new Decimal(10));
			user.blue.buttonPrice.push(Decimal.pow(new Decimal(10),new Decimal(user.blue.index)).times(new Decimal(2.5)));
			user.blue.addButtonPrice = user.blue.addButtonPrice.times(10);
		}
	}
	updateAll();
}

function getBluePrestige() {
	if (user.totPower.gte(new Decimal(1e10))) return user.totPower.log10().div(10);
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
	document.getElementById("savedInfo").style.display="inline";
	function foo() {document.getElementById("savedInfo").style.display="none"}
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
	if(user.blue.energy.gte(1)){
		document.getElementById("blueEnergyArea").style.display = "";
		document.getElementById("blueEnergyAmount").innerHTML = display(user.blue.energy);
	}
	else { document.getElementById("blueEnergyArea").style.display = "none";}
	var dispMult = display(getBlueButtonTotalMult());
	update("powerMultArea", "Button Mult: x"+dispMult);
	update("blueCycle", `Reset Cycle: ${user.blue.tick}/${user.blue.tickMax}`);
	for(var i=1;i<user.blue.mults.length+1;i++){
		document.getElementById("buttonSet"+i).style.display="block";
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
		document.getElementById("buttonSet"+i).style.display="none";
	}
	var dispAddBluePrice = display(user.blue.addButtonPrice);
	update("addBlueButton", `Add another Blue Button<br/>Cost: ${dispAddBluePrice} Power`);
	for(i=0;i<user.blue.buttonPrice.length;i++){
		if(user.totPower.gte(user.blue.buttonPrice[i])||user.blue.mults[i].eq(user.blue.limits[1])) {
			var j = i+1;
			document.getElementById("upgrade"+j).style.opacity = 1.0;
		}
		else{
			var j = i+1;
			document.getElementById("upgrade"+j).style.opacity = 0.6;
		}
	}
	if(user.totPower.gte(user.blue.addButtonPrice)) document.getElementById("addBlueButton").style.opacity = 1.0;
	else document.getElementById("addBlueButton").style.opacity = 0.6;
	if(user.blue.index>=user.blue.indexLimit) {
		document.getElementById("addBlueButton").style.display = "none";
		document.getElementById("bluePrestigeButton").style.display = "";
	} else {
		document.getElementById("addBlueButton").style.display = "";
		document.getElementById("bluePrestigeButton").style.display = "none";
	}
	document.getElementById("bluePrestigeButton").style.opacity = getBluePrestige().gt(0)?1:0.6
	document.getElementById("bluePrestigeAmount").innerHTML = display(getBluePrestige()) + " Energy";
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
	setInterval(save, 5000);
}
