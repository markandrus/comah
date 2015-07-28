camoh
=====

Camoh is a parallel JavaScript test framework modeled after
[Mocha](https://mochajs.org).

Philosophy
----------

_Life is too short to run tests sequentially!_

Seriously. Good tests should be independent, and independent tests are
parallelizable. Camoh runs your tests in parallel.

Writing Parallel Tests
----------------------

Camoh provides the same domain-specific language (DSL) for behavior-driven
development (BDD) tests you are used to with a few semantic differences.

### Within `describe`

| Method       | Meaning                               |
|:------------ |:------------------------------------- |
| `before`     | Same as `beforeEach`                  |
| `beforeEach` | Specify code to run before each `it`  |
| `after`      | Same as `afterEach`                   |
| `afterEach`  | Specify code to run after each `it`   |

Contributing
------------

Feel free to contribute to any of the open [issues]
(https://github.com/markandrus/camoh/issues), bugfixes, etc. When you
think you're ready to merge, ensure the tests are passing and open a pull
request. If you are adding new functionality, please include new tests as well.
Finally, add yourself to the contributors section of `package.json`.
