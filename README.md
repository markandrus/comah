![pocha](https://rawgit.com/markandrus/pocha/master/img/logo.svg)

Pocha is a parallel JavaScript test framework modeled after
[Mocha](https://mochajs.org).

Philosophy
----------

_Life is too short to run tests sequentially!_

Seriously. Good tests should be independent, and independent tests are
parallelizable. Pocha runs your tests in parallel.

Usage
-----

You can use pocha like you would mocha. Run `pocha --help` for additional
information.

### Specifying the number of jobs with `-j X`

Like [make](https://www.gnu.org/software/make/manual/html_node/Parallel.html),
pocha allows you to specify the number of jobs with `-j`. When no
argument is supplied, the number of jobs is unbounded: pocha will fork a
process for every test in your test suite. By default, the number of jobs is
equal to the number of CPUs in your computer.

### Specifying the number of tests to run concurrently with `-k Y`

You can specify the number of tests each job runs concurrently with `-k`. When
no argument is supplied, the number of concurrent tests is unbounded: pocha
(or a child process) will run every test assigned to it concurrently. This
is most useful for asynchronous tests. The default value is arbitrarily set to
5.

### Specifying a ratio of jobs to tests with `-j X:Y`

You can set the number of tests a job runs concurrently by passing a ratio to
`-j`. For example,

- `-j 1:1` specifies sequential execution
- `-j 3:2` will fork three processes, each running two tests at a time
- `-j  :1` will fork a process for each test
- `-j  :3` will fork a process for every three tests

Each of these configurations can be specified independently with `-j` and `-k`;
the ratio syntax is only used for syntactic sugar.

### Disabling all parallelism and concurrency

Pass `--sequential` (equivalent to `-j 1:1` or `--runner sequential`) to disable
all parallelism and concurrency.

Writing Parallel Tests
----------------------

Pocha provides the same domain-specific language (DSL) for writing
behavior-driven development (BDD) tests that you are used to with a couple of
semantic differences due to parallelization.

### `before` and `after`

`before` and `after` are treated the same as `beforeEach` and `afterEach`,
because pocha may fork up to `N` times and will no longer guarantee that
`before` and `after` are called exactly _once_.

Contributing
------------

Feel free to contribute to any of the open [issues]
(https://github.com/markandrus/pocha/issues), bugfixes, etc. When you
think you're ready to merge, ensure the tests are passing and open a pull
request. If you are adding new functionality, please include new tests as well.
Finally, add yourself to the contributors section of `package.json`.
