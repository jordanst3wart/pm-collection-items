# postman-collection-items

Breaks postman collections down to the individual items, so that they can be reused across different collections.

Usage:
```
pm-collection-items --breakdownCollection   --inputDir collections  --outputDir postman
# breaks the collection down to:
pm-collection-items --reconstructCollection --inputDir postman      --outputDir collections
# reconstructs the collection to:
```



Install:
```
npm install -g pm-collection-items
```


Release as a NPM module

References:
https://github.com/Phara0h/Postgen
https://github.com/postmanlabs/newman


Removes the ids that get dynamically generated, to stop files changing unnecessary.
