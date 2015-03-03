var config = require('./config.json');
var extSequence = [];
var extSequenceNames = [];
var recursyLevel = 0;
var cursorNamesRegistry = {};
var algorythmComplexity = 0;
var complexityMode = 0;

function clear() {
    config = require('./config.json');
    extSequence = [];
    extSequenceNames = [];
    recursyLevel = 0;
    cursorNamesRegistry = {};
    algorythmComplexity = 0;
}

function getBeforePrefix() {
    var beforeNeedPrefix = '- ';
    for (var rl = 0; rl < recursyLevel; rl ++) {
        beforeNeedPrefix = '    ' + beforeNeedPrefix;
    }

    return beforeNeedPrefix;
}

function addSeq(i, extName) {
    var exists = false

    for (var extIndex=0; extIndex < extSequence.length; extIndex ++) {
        if (i === extSequence[extIndex]) {
            exists = true;
            break;
        }
    }

    if (!exists) {
        extSequence.push(i);
        extSequenceNames.push(extName);
    }
}

function rd(startFrom, muted) {
    muted = muted || false;
    for (var i = parseInt(startFrom) || 0; i < config.extensions.length; i++) {

        var ext = config.extensions[i];

        if (!ext.name || typeof ext.name !== 'string') {
            throw new Error('Extension should contain codename!')
        }

        var extName = ext.name;
        cursorNamesRegistry[extName] = true;

        !muted && console.log(getBeforePrefix() + 'CURRENT CURSOR: ', ext.name);

        if (ext.dependencies && ext.dependencies instanceof Array) {
            for (var k = 0; k < ext.dependencies.length; k++) {
                var afterName = ext.dependencies[k];
                !muted && console.log(getBeforePrefix() + 'DEPENDENCY NEED: ', afterName);
                if (cursorNamesRegistry[afterName]) {
                    !muted && console.log(getBeforePrefix() + 'ALREADY REGISTERED! CONTINUE...');
                    algorythmComplexity++;
                    continue;
                } else {
                    !muted && console.log(getBeforePrefix() + '>> ' + ext.name + ' REGISTERED <<');
                    cursorNamesRegistry[afterName] = true;
                    algorythmComplexity++;
                }
                var afterIndex = depIndexByName(afterName, config.extensions);
                recursyLevel++;
                if (recursyLevel > 10) {
                    throw new Error(getBeforePrefix() + 'Max Recursy Level Reached');
                }
                // afterIndex has less iterations than i+1
                if (complexityMode == 0) {
                    rd(afterIndex, muted);
                    algorythmComplexity++;
                } else {
                    rd(i + 1, muted);
                    algorythmComplexity++;
                }
                recursyLevel--;
            }

            // AFTER - means that first of all `after` and then Current
            addSeq(i, extName);
        } else {
            addSeq(i, extName);
        }
        algorythmComplexity++;
    }
}

function normalizeDeps(startFrom) {
    for (var extIndex = parseInt(startFrom) || 0; extIndex < config.extensions.length; extIndex++) {
        var isDependencyForArray = config.extensions[extIndex].isDependencyFor || [];

        for (var depIndex=0; depIndex < isDependencyForArray.length; depIndex++){
            var extName = isDependencyForArray[depIndex];
            var extGlobalIndex = depIndexByName(extName, config.extensions);
            var ext = config.extensions[extGlobalIndex];
            var depInstalledInExt = false;

            ext.dependencies = ext.dependencies || [];

            for (var extDepsIndex=0; extDepsIndex < ext.dependencies.length; extDepsIndex++){
                if (ext.dependencies[extDepsIndex] === extName) {
                    depInstalledInExt = true;
                    break;
                }
            }

            if (!depInstalledInExt) {
                ext.dependencies.push(config.extensions[extIndex].name);
                config.extensions[extGlobalIndex] = ext;
            }
        }

        delete config.extensions[extIndex].isDependencyFor;
    }
}

//-----------------------------------------------------------------------------
var depsIndexes = {};
/**
 * Returning index of dependency in configuration by it's name
 * @param name
 * @param deps
 * @returns {*}
 */
function depIndexByName(name, deps) {

    if (depsIndexes[name]) {
        return depsIndexes[name];
    }

    for (var i = 0; i < deps.length; i++) {
        if (deps[i].name && name === deps[i].name) {
            depsIndexes[name] = i;
            return i;
        }
    }

    return -1;
}

complexityMode = 1;
normalizeDeps(0);
console.log('DEPS RESOLVING LOG:');
rd(0, false);
console.log();
console.log('NORMALIZED EXT CONFIG: ', JSON.stringify(config.extensions, null, '\t'));
console.log('EXTENSIONS INDEXES SEQUENCE IN CONFIG.EXTENSIONS[i]: ', JSON.stringify(extSequence, null, '\t'));
console.log('EXTENSIONS NAMES SEQUENCE: ', JSON.stringify(extSequenceNames, null, '\t'));

clear();
complexityMode = 0;
console.log('\n\nCOMPLEXITY COMPARING')
console.log('complexityMode === 0')
normalizeDeps(0);
rd(0, true);
console.log('COMPLEXITY LEVEL: ', algorythmComplexity)

var compl1 = algorythmComplexity;

clear();
console.log('\n\nCOMPLEXITY COMPARING')
console.log('complexityMode === 1')
complexityMode = 1;
normalizeDeps(0);
rd(0, true);
console.log('COMPLEXITY LEVEL: ', algorythmComplexity)
console.log('COMPLEXITY DIFFERENCE: ', 100 - parseInt(algorythmComplexity / compl1 * 100), '%')