import test from 'node:test';
import assert from 'node:assert/strict';

import { explainSql } from './sql-walkthrough.ts';

test('explains SELECT clauses in logical learning order', () => {
  const sql = `SELECT d.name, COUNT(*) AS employee_count
FROM employee e LEFT JOIN department d ON e.department_id = d.id
WHERE e.active = 1
GROUP BY d.name
HAVING COUNT(*) > 1
ORDER BY employee_count DESC
LIMIT 5`;
  const steps = explainSql(sql);

  assert.deepEqual(
    steps.map((step) => step.title.split(' · ')[0]),
    ['FROM', 'LEFT JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY', 'LIMIT']
  );
  assert.match(steps.find((step) => step.title.startsWith('SELECT')).details[1], /COUNT/);
  steps.forEach((step) => assert.ok(sql.slice(step.start, step.end).trim()));
});

test('ignores keywords in literals and comments, then explains nested SELECT', () => {
  const sql = `SELECT name FROM employee
WHERE note = 'ORDER BY hidden' -- GROUP BY hidden
AND department_id IN (SELECT id FROM department WHERE active = 1)`;
  const steps = explainSql(sql);

  assert.equal(
    steps.some((step) => step.title.startsWith('ORDER BY')),
    false
  );
  assert.equal(
    steps.some((step) => step.title === '내부 SELECT'),
    true
  );
  assert.equal(steps.filter((step) => step.title.startsWith('FROM')).length, 2);
  assert.equal(steps.filter((step) => step.title.startsWith('WHERE')).length, 2);
});

test('explains both sides of a set operation exactly once', () => {
  const steps = explainSql('SELECT id FROM a UNION ALL SELECT id FROM b');

  assert.equal(steps.filter((step) => step.title.startsWith('SELECT')).length, 2);
  assert.equal(steps.filter((step) => step.title.startsWith('FROM')).length, 2);
  assert.equal(steps.filter((step) => step.title.startsWith('UNION')).length, 1);
  assert.match(steps.at(-1).details[0], /중복 행을 그대로/);
});

test('opens a CTE and explains its inner query before the outer query', () => {
  const sql = `WITH totals AS (SELECT department_id, SUM(salary) AS total FROM employee GROUP BY department_id)
SELECT department_id, ROW_NUMBER() OVER (ORDER BY total DESC) AS rank_no FROM totals`;
  const steps = explainSql(sql);

  assert.equal(steps[0].title.startsWith('WITH'), true);
  assert.equal(steps.some((step) => step.title === '내부 SELECT'), true);
  assert.equal(steps.some((step) => step.title.startsWith('OVER')), true);
  assert.equal(steps.some((step) => step.level > 0 && step.title.startsWith('GROUP BY')), true);
});

test('explains UPDATE conditions before changed values', () => {
  const steps = explainSql('UPDATE employee SET salary = salary * 1.1 WHERE department_id = 10');

  assert.deepEqual(
    steps.map((step) => step.title.split(' · ')[0]),
    ['UPDATE', 'WHERE', 'SET']
  );
});

test('keeps highlights attached to the right statement', () => {
  const sql = "SELECT 'a;b' AS text_value; SELECT id FROM employee;";
  const steps = explainSql(sql);

  assert.equal(steps.filter((step) => step.title.startsWith('SELECT')).length, 2);
  assert.equal(steps.filter((step) => step.title.startsWith('FROM')).length, 1);
  assert.equal(sql.slice(steps.at(-1).start, steps.at(-1).end), 'SELECT id');
});
