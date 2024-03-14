# use-yab

## GitHub Actions

```yaml
- name: Use Yab
  uses: Frank-Mayer/use-yab@v1
- name: Build
  run: yab build
```

### Options

`version` - The version of Yab to install. Default is `latest`.

## NPM Library

```javascript
import { executeAsync } from "@frank-mayer/use-yab";
await executeAsync("build");
```

To install a specific version of Yab, use the `install` function.

```javascript
import { installAsync, executeAsync } from "@frank-mayer/use-yab";
await installAsync("0.3.0");
await executeAsync("build");
```
