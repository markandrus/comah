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

Camoh provides the same domain-specific language (DSL) for writing
behavior-driven development (BDD) tests that you are used to but with a few
semantic differences due to parallelization.

### `before` and `after`

`before` and `after` are treated the same as `beforeEach` and `afterEach`,
because camoh may fork up to `N` times and will no longer guarantee that
`before` or `after` is called exactly _once_.

Contributing
------------

Feel free to contribute to any of the open [issues]
(https://github.com/markandrus/camoh/issues), bugfixes, etc. When you
think you're ready to merge, ensure the tests are passing and open a pull
request. If you are adding new functionality, please include new tests as well.
Finally, add yourself to the contributors section of `package.json`.
