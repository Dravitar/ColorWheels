function getDefaultUser() {
	return {
		totPower:0,
		blue: {
			tick:0,
			tickMax:1000,
			mults: [1],
			limits: [10],
			buttonPrice: [10],
			clicked: 0,
			upgrades:       ["CR","CU","LB","BB"],
			upgradeCount:   [0   ,0   ,0   ,0   ],
			upgradePrices:  [1   ,1   ,10  ,50  ],
			upgradeIncrease:[10  ,10  ,0   ,50  ],
			bonuses:        [10  ,1   ,0   ,0   ],
			addButtonPrice: 100,
			index: 1,
			indexLimit: 10,
			energy: 0,
		},
		green: {
			tick:0,
			tickMax:1000,
			mults: [1],
			buttonPrice: [10],
			addButtonPrice: 100,
			index: 1,
		},
		currentTab: "mainTab",
		lastTick: new Date().getTime(),
	};
}

let user = getDefaultUser();

function update(get, set) {
	document.getElementById(get).innerHTML=set;
}

function gameCycle(){
	let now = new Date().getTime();
	let diff = now - user.lastTick;
	let tickMax = user.blue.tickMax*Math.pow(user.blue.bonuses[0],user.blue.upgradeCount[0]);
	user.blue.tick+=diff;
	if(user.blue.tick<user.blue.tickMax){
		update("blueCycle", "Reset Cycle: "+user.blue.tick+"/"+user.blue.tickMax);
	}
	else {
		process(Math.round(user.blue.tick/user.blue.tickMax));
	}
	user.lastTick = now;
	updateAll();
}

function blueClick(num) {
	let mid=user.blue.bonuses[1]*user.blue.upgradeCount[1];
	if(mid>0){
		user.blue.mults[num-1]=""+mid+user.blue.mults[num-1];
		if(user.blue.clicked!=0) {
			user.blue.mults[user.blue.clicked-1]=user.blue.mults[user.blue.clicked-1].toString().substring(1);
		}
	}
	user.blue.clicked=num;
}

function process(num) {
	var mult=1;
	user.blue.mults.forEach(getMult);
	function getMult(value){
		mult=bigMult(mult,value,1);
	}
	let tot = 0;
	while(num>0) {
		tot=bigAdd(tot,mult,1);
		num-=1;
	}
	user.totPower=bigAdd(user.totPower,tot,1);
	user.blue.tick=0;
}

function checkButtonUpgrade(num) {
	var price=user.blue.buttonPrice[num-1];
	if(bigBigger(user.totPower,price)&&bigBigger(user.blue.limits[num-1]-1,user.blue.mults[num-1])){
		user.totPower=bigAdd(user.totPower,price,0);
		user.blue.mults[num-1]=user.blue.mults[num-1]+1;
		price=bigMult(price,2.5,1);
		user.blue.buttonPrice[num-1]=price;
	}
	updateAll();
}

function checkUpgrade(color, dex) {
	let index = user[color].upgrades.indexOf(dex);
	if(canBuyUpgrade(color, index)){
		user[color].energy = bigAdd(user[color].energy, user[color].upgradePrices[index], 0);
		user[color].upgradeCount[index]++;
		user[color].upgradePrices[index] = bigMult(user[color].upgradePrices[index], user[color].upgradeIncrease[index], 1);
	}
	updateAll();
}

function canBuyUpgrade(color, index) {
	if(bigBigger(user[color].energy, user[color].upgradePrice[index])) return true;
	else return false;
}

function checkAddBlue() {
	if(user.blue.index<10){
		if(bigBigger(user.totPower,user.blue.addButtonPrice)){
			user.totPower=bigAdd(user.totPower,user.blue.addButtonPrice,0);
			user.blue.index++;
			document.getElementById("buttonSet"+user.blue.index).style.display="block";
			user.blue.mults.push(1);
			user.blue.limits.push(10);
			user.blue.buttonPrice.push(display("1e"+user.blue.index));
			user.blue.addButtonPrice=bigMult(user.blue.addButtonPrice,10,1);
		}
	}
	updateAll();
}

function getBluePrestige() {
	if(bigBigger(user.totPower, 1e10)){
		let pow = ""+user.totPower;
		return bigAdd(pow.split("e")[1],9,0);
	}
	else return 0;
}

function blueReset() {
	if(bigBigger(getBluePrestige(),1)){
		let energy = user.blue.energy + getBluePrestige();
		let count = user.blue.upgradeCount;
		let prices = user.blue.upgradePrices;
		user.blue = getDefaultUser().blue;
		user.totPower = 0;
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
	localStorage.setItem("colorWheelsSave",JSON.stringify(user));
	document.getElementById("savedInfo").style.display="inline";
	function foo() {document.getElementById("savedInfo").style.display="none"}
	setTimeout(foo, 2000);
}

function load(){
	if(localStorage.getItem("colorWheelsSave") !== null) user = JSON.parse(localStorage.getItem("colorWheelsSave"));
	return user;
}

function updateAll(){
	update("powerAmount", "Total Power: "+display(user.totPower));
	if(bigBigger(user.blue.energy,1)){
		document.getElementById("blueEnergyArea").style.display = "";
		document.getElementById("blueEnergyAmount").innerHTML = display(user.blue.energy);
	}
	else { document.getElementById("blueEnergyArea").style.display = "none";}
	var mult = 1;
	user.blue.mults.forEach(getMult);
	function getMult(value){
		mult=bigMult(mult,value,1);
	}
	var dispMult = display(mult);
	update("powerMultArea", "Button Mult: x"+dispMult);
	update("blueCycle", "Reset Cycle: "+user.blue.tick+"/"+user.blue.tickMax);
	for(var i=1;i<user.blue.mults.length+1;i++){
		document.getElementById("buttonSet"+i).style.display="block";
		var name = "blueCircle" + i;
		update(name, "x"+user.blue.mults[i-1]);
		var price=user.blue.buttonPrice[i-1];
		update("upgrade"+i, "Upgrade your Blue Button<br/>Cost: "+user.blue.buttonPrice[i-1]+" Power");
		price=display(price);
		let bLButtons = document.getElementsByClassName("breakLimitButton");
		var bLButton;
		for (var j = 0; j < bLButtons.length; j++) {
			bLButton = bLButtons.item(j);
			if (user.blue.upgradeCount[2]>0) {
				bLButton.style.display = 'block';
			}
			else bLButton.style.display = 'none';
		}
		if (bigBigger(user.blue.limits[i-1]-1,user.blue.mults[i-1])) {
			update("upgrade"+i, "Upgrade your Blue Button<br/>Cost: "+price+" Power");
		} else {
			update("upgrade"+i, "Max Multiplier!");
		}	
	}
	for(var i=user.blue.mults.length+1;i<=user.blue.indexLimit;i++){
		document.getElementById("buttonSet"+i).style.display="none";
	}
	var dispAddBluePrice = display(user.blue.addButtonPrice);
	update("addBlueButton", "Add another Blue Button<br/>Cost: "+dispAddBluePrice+" Power");
	for(i=0;i<user.blue.buttonPrice.length;i++){
		if(bigBigger(user.totPower,user.blue.buttonPrice[i])||user.blue.mults[i]==user.blue.limits[1]){
			var j = i+1;
			document.getElementById("upgrade"+j).style.opacity = 1.0;
		}
		else{
			var j = i+1;
			document.getElementById("upgrade"+j).style.opacity = 0.6;
		}
	}
	if(bigBigger(user.totPower,user.blue.addButtonPrice)) document.getElementById("addBlueButton").style.opacity = 1.0;
	else document.getElementById("addBlueButton").style.opacity = 0.6;
	if(user.blue.index>=user.blue.indexLimit) {
		document.getElementById("addBlueButton").style.display = "none";
		document.getElementById("bluePrestigeButton").style.display = "";
	} else {
		document.getElementById("addBlueButton").style.display = "";
		document.getElementById("bluePrestigeButton").style.display = "none";
	}
	document.getElementById("bluePrestigeAmount").innerHTML = getBluePrestige() + " Energy";
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
