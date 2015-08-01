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

```
$ pocha --help

  Usage: _pocha [debug] [options] [files]

  Options:

    -h, --help                      output usage information
    -V, --version                   output the version number
    -R, --reporter <name>           specify the reporter to use
    -u, --ui <name>                 specify user-interface (bdd)
    -l, --list                      list the tests instead of running them
    -p, --pattern <pattern>         specify a prefix or regex for filtering tests (regexes should be enclosed in "/")
    -j, --jobs [number]             specify the number of jobs to run in parallel (no argument implies unbound; pass a ratio to also set concurrency)
    -k, --concurrency [number]      specify the number of tests to run concurrently (no argument implies unbounded)
    --runner <name>                 specify the runner to use
    --sequential                    run tests sequentially (sets the runner to "sequential")
    --compilers <ext>:<module>,...  use the given module(s) to compile files
    --harmony                       enable all harmony features (except typeof)
    --es_staging                    enable all staged features
    --harmony-collections           enable harmony collections (sets, maps, and weak maps)
    --harmony-generators            enable harmony generators
    --harmony-proxies               enable harmony proxies
    --harmony_shipping              enable all shipped harmony fetaures (iojs)
    --harmony_arrow_functions       enable "harmony arrow functions" (iojs)
    --harmony_rest_parameters       enable "harmony rest parameters" (iojs)
    --harmony_proxies               enable "harmony proxies" (iojs)
    --harmony_classes               enable "harmony classes" (iojs)
    --interfaces                    display available interfaces
    --reporters                     display available reporters
    --runners                       display available runners

```

### Specifying the number of jobs with `-j X`

Like [make](https://www.gnu.org/software/make/manual/html_node/Parallel.html),
pocha allows you to specify the number of jobs with `-j`. When no
argument is supplied, the number of jobs is unbounded: pocha will fork a
process for every test in your test suite. By default, the number of jobs is
equal to the number of CPUs in your computer.

See [lib/runners/parallel.js](lib/runners/parallel.js) for implementation.

### Specifying the number of tests to run concurrently with `-k Y`

You can specify the number of tests each job runs concurrently with `-k`. When
no argument is supplied, the number of concurrent tests is unbounded: pocha
(or a child process) will run every test assigned to it concurrently. This
is most useful for asynchronous tests. The default value is arbitrarily set to
5.

See [lib/runners/concurrent.js](lib/runners/concurrent.js) for implementation.

### Specifying a ratio of jobs to tests with `-j X:Y`

You can set the number of tests a job runs concurrently by passing a ratio to
`-j`. For example,

- `-j 1:1` specifies sequential execution
- `-j 1:3` will run three tests at a time
- `-j 3:2` will fork three processes, each running two tests at a time
- `-j  :1` will fork a process for each test
- `-j  :3` will fork a process for every three tests

Each of these configurations can be specified independently with `-j` and `-k`;
the ratio syntax is only used for syntactic sugar.

### Disabling all parallelism and concurrency

Pass `--sequential` (equivalent to `-j 1:1` or `--runner sequential`) to disable
all parallelism and concurrency.

See [lib/runners/sequential.js](lib/runners/sequential.js) for implementation.

Writing Parallel Tests
----------------------

Pocha provides the same domain-specific language (DSL) for writing
behavior-driven development (BDD) tests that you are used to with a couple of
semantic differences due to parallelization.

See [lib/dsl.js](lib/dsl.js) for implementation.

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
