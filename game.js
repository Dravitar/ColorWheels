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
			buttonsPurchased: [new Decimal(1)],
			addButtonPrice: new Decimal(100),
			index: new Decimal(1),
			//All the above gets reset on a red reset
			limits: [new Decimal(10)],
			breakPrice: [new Decimal(3)],
			brokenAmount: [new Decimal(0)],
			clickedBoost: new Decimal(0),
			clickedIndex: -1,//0    1    2    3    4     5    6     7     8    9    10
			upgrades:       ["PB","CP","LB","BB","CPB","RB","CRB","ECU","MB","TPB","SC"],
			upgradeCount:   [new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   
					 ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   
					 ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)],
			upgradePrices:  [new Decimal(1)   ,new Decimal(1)   ,new Decimal(10)  ,new Decimal(50)  
					 ,new Decimal(100) ,new Decimal(10)  ,new Decimal(5e3) ,new Decimal(1e4) 
					 ,new Decimal(5e5) ,new Decimal(1e5) ,new Decimal(1e3)],
			upgradeIncrease:[new Decimal(1e5) ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(10)  
					 ,new Decimal(2)   ,new Decimal(1e3) ,new Decimal(10)  ,new Decimal(1e3) 
					 ,new Decimal(3)   ,new Decimal(0)   ,new Decimal(10)],
			upgradeMax:     [new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(9)   
					 ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)   
					 ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)],
			challenges:	[false, false, false, false],
			automators:	["autoB","autoBSpeed","autoBPower",//1 2 3
					"autoC","autoCSpeed","autoCPower",//4 5 6
					"autoN","autoNSpeed","autoNPower",//7 8 9
					"autoBr","autoBrSpeed","autoBrPower"],//10 11 12
			automatorCount:	[new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)
					 ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)
					 ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)
					 ,new Decimal(0)   ,new Decimal(0)   ,new Decimal(0)],
			automatorPrices:[new Decimal(100) ,new Decimal(125) ,new Decimal(500)
					 ,new Decimal(100) ,new Decimal(125) ,new Decimal(500)
					 ,new Decimal(500) ,new Decimal(750) ,new Decimal(5e3)
					 ,new Decimal(5e3) ,new Decimal(1e4) ,new Decimal(1e5)],
			automatorIncrease:[new Decimal(0)   ,new Decimal(1.5) ,new Decimal(2.5)
					 ,new Decimal(0)   ,new Decimal(1.5) ,new Decimal(2.5)
					 ,new Decimal(0)   ,new Decimal(1.5) ,new Decimal(2.5)
					 ,new Decimal(0)   ,new Decimal(1.5) ,new Decimal(2.5)],
			automatorMax:	[new Decimal(1)    ,new Decimal(25)  ,new Decimal(0)
					 ,new Decimal(1)   ,new Decimal(25)  ,new Decimal(0)
					 ,new Decimal(1)   ,new Decimal(25)  ,new Decimal(0)
					 ,new Decimal(1)   ,new Decimal(25)  ,new Decimal(0)],
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
			upgrades:	["ORB","BPB"],
			upgradeCount:	[new Decimal(0)   ,new Decimal(0)],
			upgradePrices:	[new Decimal(1)   ,new Decimal(10)],
			upgradeIncrease:[new Decimal(1e5) ,new Decimal(0)],
			upgradeMax:     [new Decimal(0)   ,new Decimal(0)],
                        energy: new Decimal(0),
			resets: new Decimal(0),
		},
		automateTypes: 		["redButton","redCycle","redButtonLimit","redLimitBreak"],
		automatorCurrentCycle: 	[0, 	      0, 	 0, 		  0],
		automatorActive:	[false,	      false,	 false,		  false],
		currentTab: "mainTab",
		currentSubTab: "redEnergyTab",
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
	if(user.red.tick >= user.red.tickMax){
		process(Decimal.round(new Decimal(user.red.tick).div(user.red.tickMax)));
		for(i=0;i<user.automateTypes.length;i++){
			if(user.automatorActive[i]){
				automate(i);
				user.automatorCurrentCycle[i] = user.automatorCurrentCycle[i]+1;
			}
		}
	}
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
		if(num==user.red.clickedIndex) {
			user.red.clickedIndex = -1;
			user.red.mults[num-1]=user.red.mults[num-1].div(mid);
		}
		else {
			if(user.red.clickedIndex>0){
				user.red.mults[user.red.clickedIndex-1] = user.red.mults[user.red.clickedIndex-1].div(mid);
			}
			user.red.clickedIndex = num;
			user.red.mults[num-1]=user.red.mults[num-1].times(mid);
		}
	}
}

function getRedButtonTotalMult() {
	var mult=new Decimal(1);
	for(i=0;i<user.red.mults.length;i++){
		if(user.red.upgradeCount[9].gt(0)){
			mult = mult.times(user.maxTotPower.log10().log10().times(2).plus(1));
		}
		if((user.red.buttonsPurchased[i]).equals(user.red.limits[i])&&user.red.upgradeCount[8].gt(0)){
			mult = mult.times(user.red.mults[i].pow(new Decimal(1).plus(user.red.upgradeCount[8].div(10))));
		}
		if(user.orange.upgradeCount[0].gt(0)){
			mult = mult.times(user.red.mults[i].pow(Decimal.plus(1,user.orange.resets.div(10))));
		}
		/*if(user.red.challenges[0]){
			mult = mult.times(user.red.mults[i].div(i+1));
		}*/
		else { mult = mult.times(user.red.mults[i]);}
	}
	if(user.red.upgradeCount[0].gt(0)){ 
		mult = mult.times(user.red.energy.pow(user.red.upgradeCount[0]).plus(1));
		update("currentPBBonus",display(user.red.energy.pow(user.red.upgradeCount[0]).plus(1)));
	}
	if(user.red.upgradeCount[5].gt(0)){
		mult = mult.times(user.red.resets.times(Decimal.pow(5,user.red.upgradeCount[5]).plus(1)));
		update("currentRBBonus",display(user.red.resets.times(Decimal.pow(5,user.red.upgradeCount[5]).plus(1))));
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
	//if(user.red.challenges[1]) break;
	var price=user.red.tickMultPrice;
	var free=new Decimal($("freeCycleUpgrades").innerHTML);
	if(user.totPower.gte(price)||free.gt(0)) {
		let count = new Decimal(user.red.upgradeCount[6]).plus(1);
		if(free.lte(0)){user.totPower = user.totPower.minus(price);}
		user.red.tickMax = user.red.tickMax.times(Decimal.pow(0.9,count));
		let boost = Decimal.pow(1.1,count).times(10);
		user.red.tps = user.red.tps.times(Decimal.pow(new Decimal(1).div(0.9),count));
		$("cycleReducAmount").innerHTML = display(boost);
		let increase = new Decimal(10);
		if(user.red.tickMultCount.gt(50)){
			let num = new Decimal(user.red.tickMultCount);
			while(num.gt(49)){
				increase = increase.times(10);
				num = num.minus(50);
			}
		}
		if(free.lte(0)){user.red.tickMultPrice = user.red.tickMultPrice.times(increase);}
		user.red.tickMultCount = user.red.tickMultCount.plus(1);
		if(free.lte(0)){
			update("redCycleUpgCost", display(user.red.tickMultPrice));
		}else{update("redCycleUpgCost", "Free!")}
		if(free.gt(0)){$("freeCycleUpgrades").innerHTML = free.minus(1);}
	}
}

function redCycleMax() {
	let free = new Decimal($("freeCycleUpgrades").innerHTML);
	if(user.totPower.gte(1e500)){
		let num = user.totPower.log10().minus(4).div(50).times(8).plus(1).sqrt().plus(1).div(2).minus(1);
		let canPurchaseTotal = num.times(50).floor();
		let powerRequired = new Decimal.pow(10,num.times(num+1).times(50).plus(4));
		user.red.tickMultPrice = powerRequired.times(Decimal.pow(10,num.ceil()));
		user.totPower = user.totPower.minus(powerRequired);
		let canPurchase = canPurchaseTotal.minus(user.red.tickMultCount);
		if(free.gt(0)){
			canPurchase = canPurchase.plus(free);
			$("freeCycleUpgrades").innerHTML = 0;
		}
		let count = new Decimal(user.red.upgradeCount[6]).plus(1);
		user.red.tps = user.red.tps.times((Decimal.pow(new Decimal(1).div(0.9),count).times(canPurchase)));
		user.red.tickMax = user.red.tickMax.times((Decimal.pow(0.9,count).times(canPurchase)));
		let boost = Decimal.pow((new Decimal(1).div(0.9)),count).times(canPurchase).times(10);
		$("cycleReducAmount").innerHTML = display(boost);
		user.red.tickMultCount = user.red.tickMultCount.plus(canPurchase);
	}
	else {
		while(free.gt(0)) {
			redCycleUpg();
			free = free.minus(1);
		}
		while(user.totPower.gte(user.red.tickMultPrice)) redCycleUpg();
	}
}
	
function checkButtonUpgrade(num) {
	var price=user.red.buttonPrice[num-1];
	if(user.totPower.gte(price)&&user.red.limits[num-1].gt(user.red.mults[num-1])) {
		user.totPower = user.totPower.minus(price);
		if(user.red.clickedIndex == num) {
			user.red.mults[num-1]=user.red.mults[num-1].div(Decimal.pow(10,user.red.upgradeCount[4]));
		}
		user.red.mults[num-1] = user.red.mults[num-1].plus(new Decimal(1));
		if(user.red.clickedIndex == num) {
			user.red.mults[num-1]=user.red.mults[num-1].times(Decimal.pow(10,user.red.upgradeCount[4]));
		}
		let priceIncrease;
		//if(user.red.challenges[2]) priceIncrease = new Decimal(num+1).log10().plus(1).times(1.2);
		//else 
		priceIncrease = new Decimal(num+1).log10().plus(1).times(1.5);
		user.red.buttonPrice[num-1] = price.times(priceIncrease);
		user.red.buttonsPurchased[num-1]=user.red.buttonsPurchased[num-1].plus(1);
	}
}

function maxRedMult(num) {
	while(user.totPower.gte(user.red.buttonPrice[num-1])&&user.red.limits[num-1].gt(user.red.mults[num-1])) {
		checkButtonUpgrade(num);
	}
}

function checkUpgrade(color, dex) {
	let index = user[color].upgrades.indexOf(dex);
        var maxUpgrades=0;
        if(user[color].upgradeMax[index].gt(0)) maxUpgrades=user[color].upgradeMax[index];
	if(user[color].upgradeIncrease[index]==0&&user[color].upgradeCount[index]==1) {
		$(dex).style.background="darkGreen";
		return;
	}
	if(canBuyUpgrade(color, index)&&(maxUpgrades==0||user[color].upgradeCount[index].lt(maxUpgrades))){
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
	//if(user.red.challenges[2]) break;
	if(user.red.index.lt(user.red.indexLimit)){
		if(user.totPower.gte(user.red.addButtonPrice)){
			user.totPower = user.totPower.minus(user.red.addButtonPrice)
			user.red.index = user.red.index.plus(1);
			addRedButton(user.red.index);
		}
	}
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
	user.red.buttonsPurchased.push(new Decimal(2));
	user.red.buttonPrice.push(Decimal.pow(new Decimal(10),user.red.index).times(new Decimal(2.5)));
	user.red.addButtonPrice = user.red.addButtonPrice.times(10);
}

function minimizeAll() {
	for(i=1;i<user.red.mults.length;i++){
		$("buttonSet"+i).style.display = "none";
	}
}

function breakUpgrade(num) {
	//if(user.red.challenge[3]) break;
	let j = num-1;
	if(user.red.energy.gte(user.red.breakPrice[j])) {
		user.red.energy = user.red.energy.minus(user.red.breakPrice[j]);
		user.red.limits[j] = user.red.limits[j].times(10);
		let name = "break"+num;
		$(name).style.display = "none";
		if(user.red.challenges[2]) user.red.breakPrice[j] = user.red.breakPrice[j].times(4);
		else user.red.breakPrice[j] = user.red.breakPrice[j].times(25);
		name = "redBreakCost"+num;
		$(name).innerHTML = user.red.breakPrice[j];
		user.red.brokenAmount[j] = user.red.brokenAmount[j].plus(1);
		name = "redLimit"+num;
		$(name).innerHTML = user.red.limits[j].times(10);
	}
}

function startChallenge(num) {
	user.red.challenges[num] = true;
}

function getRedPrestige() {
	if (user.totPower.gte(new Decimal(1e10))){
		if(user.orange.upgradeCount[1].gt(0)){
			return user.totPower.log10().minus(9).pow(user.red.upgradeCount[7].div(2.5).plus(2)).pow(1.1).floor();
		} else{
			return user.totPower.log10().minus(9).pow(user.red.upgradeCount[7].div(2.5).plus(2)).floor();
		}
	}
	else return new Decimal(0);
}

function getOrangePrestige() {
	if (user.totPower.gte(new Decimal(1e308))) return user.totPower.log10().div(154).minus(1);
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
		$("freeCycleUpgrades").innerHTML = new Decimal($("currentSCBonus").innerHTML);
		updateAll();
	}
}

function redBigReset() {
	if(getOrangePrestige().gt(0)){
		for(i=2;i<user.red.mults.length+1;i++){
			$("buttonSet"+i).remove();
		}
		user.orange.energy = user.orange.energy.plus(getOrangePrestige());
		user.orange.resets = user.orange.resets.plus(1);
		user.red = getDefaultUser().red;
		$("energyTabs").style.display="";
		$("orangeEnergyTab").style.display="";
		user.totPower = new Decimal(0);
		updateAll();
	}
}

function maxEverything() {
	let free = new Decimal($("freeCycleUpgrades").innerHTML);
	if(user.totPower.gte(1e4)||free.gt(0)) redCycleMax();
	buyMaxRed();
	for(i=user.red.mults.length;i>0;i--){
		if(user.red.buttonsPurchased[i-1].lt(user.red.limits[i-1])) {
			maxRedMult(i);
		}
	}
}

function checkKey(event) {
	if(event.key == "m"){
		buyMaxRed();
		for(i=user.red.mults.length;i>0;i--){
			if(user.red.buttonsPurchased[i-1].lt(user.red.limits[i-1])){
				maxRedMult(i);
			}
		}
		let free = new Decimal($("freeCycleUpgrades").innerHTML);
		if(user.totPower.gte(1e4)||free.gt(0)) redCycleMax();
	}
	if(event.key == "r"){
		redReset();
	}
}

function checkAutoUpgrade(color, dex) {
	let index = user[color].automators.indexOf(dex);
        var maxUpgrades=0;
        if(user[color].automatorMax[index].gt(0)) maxUpgrades=user[color].automatorMax[index];
	if(user[color].automatorIncrease[index]==0&&user[color].automatorCount[index]==1) {
		$(dex).style.background="darkGreen";
		return;
	}
	if(canBuyAutoUpgrade(color, index)&&(maxUpgrades==0||user[color].automatorCount[index].lt(maxUpgrades))){
		user[color].energy = user[color].energy.minus(user[color].automatorPrices[index]);
		user[color].automatorCount[index] = user[color].automatorCount[index].plus(1);
		user[color].automatorPrices[index] = user[color].automatorPrices[index].times(user[color].automatorIncrease[index]);
	}
	updateAll();
}

function canBuyAutoUpgrade(color, index) {
	return user[color].energy.gte(user[color].automatorPrices[index])
}

/*
function automate(type) {
	if(type=="redButton"){
		let speed = Decimal.minus(26,user.red.automatorCount[1]);
		if(speed.gt(1)&&user.red.automatorCurrentCycle[0].gte(speed)||speed.equals(1)){
			for(i=user.red.mults.length;i>0;i--){
				if(user.red.buttonsPurchased[i-1].lt(user.red.limits[i-1])){
					maxRedMult(i);
				}
			}
			user.red.automatorCurrentCycle[0] = 0;
		}
	} else if(type=="redCycle"){
		let speed = Decimal.minus(26,user.red.automatorCount[4]);
		if(speed.gt(1)&&user.red.automatorCurrentCycle[1].gte(speed)||speed.equals(1)){	
			if(user.totPower.gte(1e4)) redCycleMax();
			user.red.automatorCurrentCycle[1] = 0;
		}
	} else if(type=="redButtonLimit"){		
		let speed = Decimal.minus(26,user.red.automatorCount[7]);
		if(speed.gt(1)&&user.red.automatorCurrentCycle[2].gte(speed)||speed.equals(1)){	
			buyMaxRed();
			user.red.automatorCurrentCycle[2] = 0;
		}
	} else if(type=="redLimitBreak"){
		let speed = Decimal.minus(26,user.red.automatorCount[10]);
		if(speed.gt(1)&&user.red.automatorCurrentCycle[3].gte(speed)||speed.equals(1)){
			let input = $("autoBrMaxValue").innerHTML;
			let max = new Decimal(0);
			if(input.indexOf("%")>0){
				max = new Decimal(input.substring(0, input.length-1));
				max = max.div(100).times(user.red.energy);
			} else{
				try{max = new Decimal(input);}
				catch{alert(input+" is not a valid number.")}
			}
			for(i=user.red.mults.length-1;i>-1;i--){
				while(user.red.breakPrice[i].lte(max)){
					breakUpgrade(i);
				}
			}
			user.red.automatorCurrentCycle[3] = 0;
		}
	}	
}
*/
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

function showSubTab(tabName, type) {
	var subTabs = document.getElementsByClassName('subTab'+type);
	var subTab;
	for(var i=0;i<subTabs.length;i++){
		subTab = subTabs.item(i);
		if(subTab.id === tabName){
			subTab.style.display = "inline-block";
			user.currentSubTab = tabName;
		}
		else subTab.style.display = 'none';
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
	if(user.totPower.lt(0)) user.totPower = new Decimal(0);
	update("powerAmount", display(user.totPower));
	if(user.totPower.lt(1e4)){
		$("cycleUpgBit").style.display = "none";
	}
	if(user.totPower.gte(1e4)||user.red.tickMultCount.gt(0)){
		$("cycleUpgBit").style.display = "";
	}
	if(user.red.resets.gt(0)){
		$("redPrestigeButton").style.display = "";
		$("redEnergyAmount").innerHTML = display(user.red.energy);
		$("tabs").style.display = "";
	}
	else { $("redPrestigeButton").style.display = "none";}
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
					update("upgrade"+i, "Max boosted to: ^"+display(user.red.upgradeCount[8].div(10).plus(1)));
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
	if(user.totPower.gte(1e10)||user.red.resets.gt(0)){
		$("redPrestigeButton").style.display = "";
		$("redEnergyAmount").innerHTML = display(user.red.energy);
	} else {		
		$("redPrestigeButton").style.display = "none";
	} if(user.totPower.gte(1e308)){
		$("redButtonPrestigeButton").style.display = "";
	}
	if(user.red.energy.gt(0)){
		$("energyTabButton").style.display = "";
		$("redEnergyTabBtn").style.display = "inline-block";
	}
	if(user.totPower.gte(user.red.tickMultPrice)) $("redCycleReduc").style.opacity = 1.0;
	else $("redCycleReduc").style.opacity = 0.6;
	if(new Decimal($("freeCycleUpgrades").innerHTML).gt(0)){
		update("redCycleUpgCost", "Free!");
	}else{
		update("redCycleUpgCost", display(user.red.tickMultPrice));
	}
	$("redPrestigeAmount").innerHTML = display(getRedPrestige());
	$("currentCPBBonus").innerHTML = user.red.upgradeCount[4];
	update("currentMBBonus", display(user.red.upgradeCount[8].div(10).plus(1)));
	$("currentSCBonus").innerHTML = user.red.upgradeCount[10].times(10);
	user.red.upgrades.forEach(function(id){
		let i = user.red.upgrades.indexOf(id);
                if(user.red.upgradeMax[i].equals(0)||user.red.upgradeCount[i].lt(user.red.upgradeMax[i])){
                        $(id+"Cost").innerHTML = display(user.red.upgradePrices[i]);
                } else{
                        $(id+"Cost").innerHTML = "Maxed!"
                }
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
	if(user.orange.energy.gt($("maxOrangeEnergy").innerHTML)){
		$("maxOrangeEnergy").innerHTML = display(user.orange.energy);
	}
	$("currentTPBBonus").innerHTML = display(user.maxTotPower.log10().log10().times(2).plus(1));
	//ORANG STUF NAOW WOW
	/*
	**
	**
	**
	*/
	$("orangePrestigeAmount").innerHTML = display(getOrangePrestige());
	if(user.totPower.gte(new Decimal(1e308))){
		$("redButtonPrestigeButton").style.display = "";
	}
	else{
		$("redButtonPrestigeButton").style.display="none";
	}
	if(user.orange.resets.gt(0)){
		$("energyTabs").style.display = "";
		$("energyTabButton").style.display = "";
		$("orangeEnergyAmount").innerHTML = display(user.orange.energy);
                $("orangeEnergyTabBtn").style.display = "";
		$("redButtonPrestigeButton").style.display = "";
	}
	user.orange.upgrades.forEach(function(id){
		let i = user.orange.upgrades.indexOf(id);
		$(id+"Cost").innerHTML = display(user.orange.upgradePrices[i]);
		if(user.orange.upgradeCount[i].gt(0)&&user.orange.upgradeIncrease[i].lte(0)){
			$(id).style.background = "forestGreen";
		}
		else{$(id).style.background = "grey";}
		if(user.orange.energy.gte(user.orange.upgradePrices[i])){
			$(id).style.opacity = 1.0;
		}
		else if(user.orange.energy.lt(user.orange.upgradePrices[i])){
			$(id).style.opacity = 0.6;
		}
	});
	$("currentORBBonus").innerHTML = display(user.orange.resets.div(10).plus(1));
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

function why(){
	load();
	checkNewButtons();
	user.red.upgrades.forEach(function(id){
		let message = "";
		if($(id+"Cost")==null){
			message = id+"\n";
		}
		alert(message);
	});
}
