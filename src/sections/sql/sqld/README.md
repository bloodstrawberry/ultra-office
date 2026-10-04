# SQLD 문제별 SQL 실습

`public/sqld/problem.json`의 각 문제에 `practiceLab`을 추가하면 SQL 실습 예제를 등록할 수 있습니다. 62회 13번 문제가 실제 예시입니다.

```json
"practiceLab": {
  "tables": [
    {
      "name": "sample",
      "columns": ["id", "value"],
      "rows": [{ "id": 1, "value": 10 }, { "id": 2, "value": null }]
    }
  ],
  "examples": [
    {
      "id": "count-values",
      "choiceNum": 1,
      "title": "NULL을 제외한 값 세기",
      "sql": "SELECT COUNT(value) AS count_value FROM sample;"
    },
    {
      "id": "count-rows",
      "choiceNum": 1,
      "title": "전체 행 세기",
      "sql": "SELECT COUNT(*) AS count_all FROM sample;"
    }
  ]
}
```

- `tables`는 한 문제의 예제가 공유하는 테이블입니다. 여러 테이블을 넣을 수 있습니다.
- `examples`의 `id`는 문제 안에서 고유해야 합니다. 같은 `choiceNum`에 여러 예제를 연결할 수 있고, 보기와 무관한 예제는 `choiceNum`을 생략할 수 있습니다.
- 예제에 `tableNames`를 지정하면 그 이름의 테이블만 해당 예제에 불러옵니다. 생략하면 모든 테이블을 사용합니다. `description`은 화면의 설명 배지에 표시됩니다.
- 보기 클릭 시 해당 보기의 첫 예제가 선택됩니다. 나머지 예제는 실습 화면의 **실행 예제 선택**에서 고를 수 있습니다.
- 기존 `choiceLabs` 데이터는 읽을 수 있지만 새 문제에는 `practiceLab`을 사용합니다. 데이터가 없는 문제는 기존 SQL 추출 및 표 파싱 동작을 사용합니다.

실습 엔진은 브라우저의 AlaSQL을 사용합니다. 예제 SQL은 AlaSQL에서 실행 가능한 문법으로 작성해야 합니다.
