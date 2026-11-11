import test from 'node:test';
import assert from 'node:assert/strict';

import { getLastAttemptCorrect, getProblemAttemptCounts } from './types.ts';

const emptyRecord = {
  selectedAnswers: [],
  isSubmitted: false,
  isCorrect: false,
  isRevealed: false,
};

test('latest wrong excludes a corrected answer even when wrong history remains', () => {
  const wrong = {
    ...emptyRecord,
    isSubmitted: true,
    wrongCount: 1,
    correctCount: 0,
    lastAttemptCorrect: false,
  };
  assert.equal(getLastAttemptCorrect(wrong), false);

  const corrected = { ...wrong, isCorrect: true, correctCount: 1, lastAttemptCorrect: true };
  assert.equal(getLastAttemptCorrect(corrected), true);
  assert.equal(getProblemAttemptCounts(corrected).wrongCount, 1);

  const wrongAgain = { ...corrected, isCorrect: false, wrongCount: 2, lastAttemptCorrect: false };
  assert.equal(getLastAttemptCorrect(wrongAgain), false);
});

test('latest result survives retry and storage reload independently of the open answer', () => {
  for (const lastAttemptCorrect of [false, true]) {
    const record = {
      ...emptyRecord,
      wrongCount: 1,
      correctCount: 1,
      lastAttemptCorrect,
    };
    const reloaded = JSON.parse(JSON.stringify(record));
    assert.equal(getLastAttemptCorrect(reloaded), lastAttemptCorrect);
    assert.equal(getLastAttemptCorrect({ ...reloaded, selectedAnswers: [1] }), lastAttemptCorrect);
    assert.equal(getLastAttemptCorrect({ ...reloaded, isRevealed: true }), lastAttemptCorrect);
  }
});

test('legacy records use submitted results and never guess the order of mixed counts', () => {
  assert.equal(getLastAttemptCorrect(undefined), undefined);
  assert.equal(getLastAttemptCorrect(emptyRecord), undefined);
  assert.equal(getLastAttemptCorrect({ ...emptyRecord, isSubmitted: true }), false);
  assert.equal(
    getLastAttemptCorrect({ ...emptyRecord, isSubmitted: true, isCorrect: true, wrongCount: 3 }),
    true
  );
  assert.equal(getLastAttemptCorrect({ ...emptyRecord, wrongCount: 2 }), false);
  assert.equal(getLastAttemptCorrect({ ...emptyRecord, correctCount: 2 }), true);
  assert.equal(
    getLastAttemptCorrect({ ...emptyRecord, wrongCount: 2, correctCount: 2 }),
    undefined
  );
});
