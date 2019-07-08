let saveName = "colorWheelsSave"
let initPlayerFunctionName = "getDefaultUser"
let playerVarName = "user" // DO NOT USE THE WORD "SAVE"
let importDangerAlertText = "Your imported save seems to be missing some values, which means importing this save might be destructive, if you have made a backup of your current save and are sure about importing this save please press OK, if not, press cancel and the save will not be imported."

function onImportError() {
    alert("Error: Imported save is in invalid format, please make sure you've copied the save correctly and isn't just typing gibberish.")
}

function onLoadError() {
    return // I will leave this to you
}

function onImportSuccess() {
    console.log("Save imported successfully.")
}
// Only change things above to fit your game UNLESS you know what you're doing

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function saveGame() {
  localStorage.setItem(saveName,btoa(JSON.stringify(window[playerVarName])))
}

function loadGame(save,imported=false) {
  let reference = window[initPlayerFunctionName]()
  try {
    save = JSON.parse(atob(save))
  } catch(err) {
    if (imported) {
      onImportError()
      return
    } else {
      onLoadError()
      return
    }
  }
  let temp = listItems(reference)
  let decimalList = temp[0]
  let itemList = temp[1]
  let missingItem = itemList.diff(listItems(save)[1])
  if (missingItem.includes("save")) {
      console.log("Unrecoverable corrupted save detected, loading default save...")
      return
  }
  if (missingItem.length != 0 && imported) {
    if (!confirm(importDangerAlertText)) {
      return
    }
  }
  missingItem.forEach(function(value) {
    eval(`save.${value} = reference.${value}`) // No one will exploit their browser with localStorage right
  })
  
  decimalList.forEach(function(value) {
    eval(`save.${value} = new Decimal(save.${value})`)
  })
  
  window[playerVarName] = save
  if (imported) onImportSuccess()
}

function listItems(data,nestIndex="") {
  let decimalList = []
  let itemList = []
  Object.keys(data).forEach(function (index) {
    let value = data[index]
    itemList.push(nestIndex + (nestIndex===""?"":".") + index)
    if (typeof value == 'object') {
      if (value instanceof Decimal) {
        decimalList.push(nestIndex + (nestIndex===""?"":".") + index)
      } else {
        let temp = listItems(value, nestIndex + (nestIndex===""?"":".") + index)
        decimalList = decimalList.concat(temp[0])
        itemList = itemList.concat(temp[1])
      }
    }
  });
  return [decimalList,itemList]
};