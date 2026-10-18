/**
 * Unit Tests for Nova Dock 2.0 Core Logic
 * Tests: Fuzzy search scoring, smart natural language parser, and unit converters.
 */

import { fuzzyScore, fuzzySearch } from '../src/core/fuzzy-search';
import { SmartInterpreter } from '../src/core/smart-interpreter';

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    process.exit(1);
  }
}

console.log('--- RUNNING NOVA DOCK 2.0 TEST SUITE ---\n');

// 1. Fuzzy Search Tests
const scoreExact = fuzzyScore('Chrome', 'Chrome');
assert(scoreExact >= 1000, 'FuzzySearch: Exact match scores >= 1000');

const scorePrefix = fuzzyScore('Visual Studio Code', 'vis');
assert(scorePrefix >= 500, 'FuzzySearch: Prefix match scores >= 500');

const scoreWordBoundary = fuzzyScore('Command Center', 'cc');
assert(scoreWordBoundary >= 10, 'FuzzySearch: Subsequence acronym match works');

const searchResults = fuzzySearch(
  ['Google Chrome', 'File Explorer', 'Windows Terminal', 'Visual Studio Code'],
  'term',
  item => [item]
);
assert(searchResults[0].item === 'Windows Terminal', 'FuzzySearch: Ranked Terminal as top match for "term"');

// 2. Smart Math Interpreter Tests
const mathResult = SmartInterpreter.interpret('2 * (3 + 4)', {});
assert(mathResult?.resultValue === '14', 'SmartInterpreter: Math evaluated "2 * (3 + 4)" = 14');

const pctResult = SmartInterpreter.interpret('15% of 850', {});
assert(pctResult?.resultValue === '127.5', 'SmartInterpreter: Percentage evaluated "15% of 850" = 127.5');

// 3. Unit Converter Tests
const unitResult = SmartInterpreter.interpret('100 km to miles', {});
assert(unitResult?.resultValue?.includes('62.1371'), 'SmartInterpreter: Converted 100 km to miles');

const tempResult = SmartInterpreter.interpret('32 c to f', {});
assert(tempResult?.resultValue === '89.6 °F', 'SmartInterpreter: Converted 32 C to F');

// 4. Currency Converter Tests
const currResult = SmartInterpreter.interpret('100 usd to eur', {});
assert(currResult?.resultValue === '92 EUR', 'SmartInterpreter: Converted 100 USD to EUR');

// 5. System Command Intents
let timerMinutes = 0;
SmartInterpreter.interpret('timer 25m', {
  onStartTimer: mins => { timerMinutes = mins; }
})?.execute();
assert(timerMinutes === 25, 'SmartInterpreter: Parsed and executed "timer 25m"');

let killedProcess = '';
SmartInterpreter.interpret('kill chrome', {
  onKillProcess: proc => { killedProcess = proc; }
})?.execute();
assert(killedProcess === 'chrome', 'SmartInterpreter: Parsed and executed "kill chrome"');

let snappedDir = '';
SmartInterpreter.interpret('snap left', {
  onSnap: dir => { snappedDir = dir; }
})?.execute();
assert(snappedDir === 'left', 'SmartInterpreter: Parsed and executed "snap left"');

console.log('\n--- ALL CORE UNIT TESTS PASSED SUCCESSFULLY! ---');
