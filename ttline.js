var config = require('./config.json');
var extSequence = [];
var extSequenceNames = [];
var recursionLevel = 0;
var cursorNamesRegistry = {};
var algorithmComplexity = 0;
var complexityMode = 0;
var maxExperimentRepeats = 1000;

MODE_START_FROM_DEPENDENCY_INDEX = 0;
MODE_START_FROM_EXTENSIONS_GLOBAL_OFFSET = 1;

function clear() {
    config = require('./config.json');
    extSequence = [];
    extSequenceNames = [];
    recursionLevel = 0;
    cursorNamesRegistry = {};
    algorithmComplexity = 0;
}

function getBeforePrefix() {
    var beforeNeedPrefix = '- ';
    for (var rl = 0; rl < recursionLevel; rl ++) {
        beforeNeedPrefix = '    ' + beforeNeedPrefix;
    }

    return beforeNeedPrefix;
}

var currentProgressChar = '[-]';
function getProgressChar() {
    switch (currentProgressChar) {
        case '[-]':
            currentProgressChar = '[\\]';
            break;
        case '[\\]':
            currentProgressChar = '[|]';
            break;
        case '[|]':
            currentProgressChar = '[/]';
            break;
        case '[/]':
            currentProgressChar = '[-]';
            break;
    }
    return currentProgressChar;
}

function addSeq(i, extName) {
    var exists = false;

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
                    algorithmComplexity++;
                    continue;
                } else {
                    !muted && console.log(getBeforePrefix() + '>> ' + ext.name + ' REGISTERED <<');
                    cursorNamesRegistry[afterName] = true;
                    algorithmComplexity++;
                }
                recursionLevel++;
                if (recursionLevel > 10) {
                    recursionLevel--;
                    continue;
                    throw new Error(getBeforePrefix() + 'Max Recursy Level Reached');
                }
                // afterIndex has less iterations than i+1
                if (complexityMode == MODE_START_FROM_DEPENDENCY_INDEX) {
                    var afterIndex = depIndexByName(afterName, config.extensions);
                    rd(afterIndex, muted);
                    algorithmComplexity++;
                } else if (complexityMode == MODE_START_FROM_EXTENSIONS_GLOBAL_OFFSET) {
                    rd(i + 1, muted);
                    algorithmComplexity++;
                }
                recursionLevel--;
            }

            addSeq(i, extName);
        } else {
            addSeq(i, extName);
        }
        algorithmComplexity++;
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
        algorithmComplexity++
    }

    return -1;
}

complexityMode = 0;
normalizeDeps(0);
console.log('DEPS RESOLVING LOG:');
rd(0, false);
console.log();
var normalisedConfig = JSON.stringify(config, null, '\t');
console.log('NORMALIZED EXT CONFIG: ', normalisedConfig);
var fs = require('fs');
fs.writeFileSync('config-normalised.json', normalisedConfig);
console.log('EXTENSIONS INDEXES SEQUENCE IN CONFIG.EXTENSIONS[i]: ', JSON.stringify(extSequence, null, '\t'));
console.log('EXTENSIONS INDEXES SEQUENCE LEN: ', extSequence.length);
console.log('EXTENSIONS NAMES SEQUENCE: ', JSON.stringify(extSequenceNames, null, '\t'));

var avgCompl1 = 0, avgCompl2 = 0;
for (var repeats = 0; repeats < maxExperimentRepeats; repeats++){
    process.stderr.write('\rWorking ' + getProgressChar());
    clear();
    complexityMode = 0;
    normalizeDeps(0);
    rd(0, true);

    avgCompl1 += algorithmComplexity;

    clear();
    complexityMode = 1;
    normalizeDeps(0);
    rd(0, true);

    avgCompl2 += algorithmComplexity;
}

console.error('\n');

var resultString = 'MODE_START_FROM_EXTENSIONS_GLOBAL_OFFSET ' +
    '\nis SLOWER than ' +
    '\nMODE_START_FROM_DEPENDENCY_INDEX ' +
    '\nAverage up to: ' + (parseInt(avgCompl2 / avgCompl1 * 100) - 100) + '%';

console.log(resultString);
console.error(resultString);