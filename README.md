# Extensions' Dependencies Resolving Algorythm

Investigations to find the fastest and optimised extensions dependencies resolving algorythm
For now the best variant is to convert `isDependencyFor` to `dependencies` and start resolving dependencies from current one, not from the top of extensions stack
