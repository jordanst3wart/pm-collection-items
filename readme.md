# postman-collection-items

Breaks postman collections down to the items in the collection. So that they can be reused across different collections.

```
postman-collection-items --breakdownCollection   --inputDir collections  --outputDir postman
postman-collection-items --reconstructCollection --inputDir postman      --outputDir collections
```

Install:
```
npm install -g postman-collection-items
```


Release as a NPM module

References:
https://github.com/Phara0h/Postgen
https://github.com/postmanlabs/newman