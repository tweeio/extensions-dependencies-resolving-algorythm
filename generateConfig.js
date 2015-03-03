var extNumber = 100;
var depsNumber = 10;

var configContents = {
    "extensions": []
}

function getRandExtNumber() {
    var n = 0;
    for (var i = 0; i<5; i++) {
        n = parseInt(Math.random(extNumber) * extNumber);
    }
    return n;
}

var globalExtRegistry = {};

// Fill 100 extensions
for (var i = 0; i<extNumber; i++) {
    // generate five dependencies
    var dependenciesRegistry = {};
    var isDependencyForRegistry = {};
    var dependencies = [];
    var isDependencyFor = [];
    for (var dI = 0; dI < depsNumber; dI++) {
        var depIndex = getRandExtNumber();
        if (!dependenciesRegistry[depIndex]) {
            dependenciesRegistry[depIndex] = true;
            dependencies.push('extension' + depIndex);
        }
    }
    for (var dI2 = 0; dI2 < depsNumber; dI2++) {
        var dep2Index = getRandExtNumber();
        if (!isDependencyForRegistry[dep2Index] && dependenciesRegistry[depIndex]) {
            isDependencyForRegistry[dep2Index] = true;
            isDependencyFor.push('extension' + dep2Index)
        }
    }

    var currentIndex = getRandExtNumber();
    while (globalExtRegistry[currentIndex]) {
        currentIndex = getRandExtNumber();
    }
    globalExtRegistry[currentIndex] = true;
    configContents.extensions.push({
        "name": "extension" + currentIndex,
        "module": "twee-extension" + currentIndex,
        "dependencies": dependencies,
        "isDependencyFor": isDependencyFor
    })
}

var fs = require('fs');

fs.writeFileSync('./config.json', JSON.stringify(configContents, null, '\t'));
