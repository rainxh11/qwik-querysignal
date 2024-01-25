[![NPM](https://img.shields.io/npm/v/qwik-querysignal?color=blue)](https://www.npmjs.com/package/qwik-querysignal)
[![MIT License](https://img.shields.io/github/license/rainxh11/qwik-querysignal.svg?color=cyan)](https://github.com/rainxh11/qwik-querysignal/blob/next/LICENSE)

# qwik-querysignal for Qwik

Type-safe search params state manager for Qwik - Like `useSignal()`, but stored in the URL query string.
This project was inspired by [nuqs](https://github.com/47ng/nuqs) library for Next.js

## Features

- 🧘‍♀️ Simple: the URL is the source of truth
- 🕰 Reload, Replace, append [Route History ](#route-options) to use the Back button to navigate state updates
- ⚡️ Built-in [serializers](#working-with-other-types) for common state types (integer, float, boolean, Date, and more)
- 📦 Support for working with [arrays](#working-with-arrays)
- ⌛️ _**new:**_ Support for [debounced](#debouncing) query state changes.

## Under the hood:

`useQuerySignal()`, `useQueryStringSignal()` and `useQueryArraySignal()` track current route url search-params for any changes and vice versa tracks the returned signal state and updates the search-params.
it uses Qwik's builtin `useNavigation()` under the hood to navigate to the updated url

## Installation

```shell
pnpm add nuqs
```

```shell
yarn add nuqs
```

```shell
npm install nuqs
```

# Example Usage:

## Working with strings:

```ts
import { component$ } from "@builder.io/qwik";
import {
  useQueryStringSignal,
} from "qwik-querysignal";

export default component$(() => {
  const sortBy = useQueryStringSignal("sortBy", "desc", {
    replaceState: true,
  });
  return (
    <div class="m-12 flex flex-col gap-1">
      <h1 class="text-3xl">Hello👋</h1>
      <input
        class="rounded-md border-2 border-blue-400 px-2 py-1 hover:border-blue-700"
        value={sortBy.value}
        onInput$={(e) => (sortBy.value = e.target?.value)}
      />
    </div>
  );
});
```

## Working with other types:

If your state type is not a string, you must pass a serializer in the second argument object.

We provide builtin serializers for common and more advanced object types:

- String:

```ts
import { parseAsString } from "qwik-querysignal"
const search = useQueryStringSignal("search", "default", {
  replaceState: true,
})
// or with passing a serializer manually
const search = useQuerySignal("search", parseAsString("default"))
```

![Example](https://raw.githubusercontent.com/rainxh11/qwik-querysignal/main/assets/example_string.gif)

- Boolean:

```ts
import { parseAsBoolean } from "qwik-querysignal"
const checked = useQuerySignal("checked", parseAsBoolean())
```

- Numbers:

```ts
import { parseAsInteger, parseAsFloat, parseAsHex } from "qwik-querysignal"
const count = useQuerySignal("count", parseAsInteger())
const sum = useQuerySignal("sum", parseAsFloat())
const hex = useQuerySignal("hex", parseAsHex("FFA1"))
```

- Dates:

```ts
import {
  parseAsIsoDateTime,
  parseAsDateTimeFormatted,
  parseAsTimestamp,
} from "qwik-querysignal"
const date = useQuerySignal("date", parseAsIsoDateTime())
const today = useQuerySignal("today", parseAsDateTimeFormatted("yyyy-MM-dd"))
const timestamp = useQuerySignal("ts", parseAsTimestamp())
```

- Objects as JSON:

```ts
import { parseAsJson } from "qwik-querysignal"
const options = useQuerySignal(
  "options",
  parseAsJson({ sortBy: "id", desc: false }),
)
```

- Enums

```ts
import { parseAsStringEnum } from "qwik-querysignal"
const sortBy = useQuerySignal(
  "sortBy",
  parseAsStringEnum(["asc", "desc", "auto"]),
)
```

## Working with arrays:

to work with array use `useQueryArraySignal()`, and provide a `separator` and `itemSerializer`:

```ts
import { useQueryArraySignal, parseAsString } from "qwik-querysignal"
const names = useQueryArraySignal("names", ",", parseAsString())
```

# Route Options:

`useQuerySignal()` accepts an optional `options` third parameter to tweak route navigation behavior after query state change.

```ts
const search = useQuerySignal("search", parseAsString(), {
  replaceState: true, // Replace history
  forceReload: false, // Reload page on state change
  scroll: true, // Preserve scroll state
})
```

## Debouncing:

`options` parameter can include an optional `debounce` field to delay navigation until _x milliseconds_ has passed from the last state change.

```ts
const search = useQuerySignal("search", parseAsString(), {
  debounce: 500, // in millisecond
})
```

![Example](https://raw.githubusercontent.com/rainxh11/qwik-querysignal/main/assets/example_debounce.gif)
