import {Signal, useSignal, useTask$, useVisibleTask$} from "@builder.io/qwik"
import {useLocation, useNavigate} from "@builder.io/qwik-city"
import {parseAsString, type SearchParamSerializer} from "./parsers"

export * from "./parsers"

export type UseQuerySignalOptions = {
  debounce?: number
  forceReload?: boolean
  replaceState?: boolean
  scroll?: boolean
}

export interface ParserBuilderOptions<T> {
  serialize: (value: T | undefined | null) => string | undefined | null
  parse: (stringValue: string | null) => T | undefined
}

export function useSignalAndDebounced<T>(
    debounce: number,
    initialValue?: T,
): [
  nonDebounced: Signal<T | undefined>,
  debounced: Readonly<Signal<T | undefined>>,
] {
  const state = useSignal(initialValue)
  const debounced = useSignal(state.value)
  useTask$(({ cleanup, track }) => {
    track(state)
    if (debounce <= 0) debounced.value = state.value
    else {
      const timeout = setTimeout(
          () => (debounced.value = state.value),
          debounce,
      )
      cleanup(() => clearTimeout(timeout))
    }
  })

  return [state, debounced as Readonly<Signal<T | undefined>>]
}

export function useQuerySignal<T>(
    queryKey: string,
    serializer: SearchParamSerializer<T>,
    options?: UseQuerySignalOptions,
) {
  if (!serializer) throw new Error(`Serializer not found!`)

  const location = useLocation()
  const navigate = useNavigate()

  const [param, debouncedParam] = useSignalAndDebounced<T | undefined>(
      options?.debounce ?? 0,
  )

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const queryValue = new URL(document.location.toString()).searchParams.get(queryKey)
    if(queryValue) {
      param.value = await serializer.parse$(queryValue)
    }
    if (!param.value && !queryValue && serializer.defaultValue) {
      const searchParams = location.url.searchParams
      const serialized = await serializer.serialize$(param.value)
      if (serialized) {
        searchParams.set(queryKey, serialized)
        document.location = location.url.toString().split("?")[0] + "?" + searchParams.toString()
      }
    }
  })

  useTask$(async ({ track }) => {
    track(debouncedParam)
    const searchParams = location.url.searchParams
    const serialized = await serializer.serialize$(debouncedParam.value)
    if (serialized) searchParams.set(queryKey, serialized)
    else searchParams.delete(queryKey)
    const newUrl =
        location.url.toString().split("?")[0] + "?" + searchParams.toString()

    await navigate(newUrl.replaceAll(/\?$/g, ""), {
      scroll: options?.scroll,
      forceReload: options?.forceReload,
      replaceState: options?.replaceState,
    })
  })
  return param
}

export function useQueryStringSignal(
    queryKey: string,
    defaultValue?: string,
    options?: UseQuerySignalOptions,
) {
  return useQuerySignal<string>(queryKey, parseAsString(defaultValue), options)
}

export function useQueryArraySignal<T>(
    queryKey: string,
    separator: string,
    itemSerializer: SearchParamSerializer<T>,
    defaultValue?: T[],
    options?: UseQuerySignalOptions,
) {
  if (!useQueryArraySignal) throw new Error(`Serializer not found!`)

  const location = useLocation()
  const navigate = useNavigate()

  const [param, debouncedParam] = useSignalAndDebounced<T[] | undefined>(
      options?.debounce ?? 0,
      defaultValue,
  )
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const query = new URL(document.location.toString()).searchParams.get(queryKey)
    if (!query) param.value = defaultValue
    else {
      const parsedValues = await Promise.all(
          query.split(separator).map(async (v: string) => {
            return await itemSerializer.parse$(v)
          }),
      )
      param.value = parsedValues.filter(x => !!x) as T[]
    }

    if (param.value && !query && defaultValue) {
      const searchParams = location.url.searchParams
      const serializedValues = await Promise.all(
          param.value.map(async v => {
            return await itemSerializer.serialize$(v)
          }),
      )
      const serializedQuery = serializedValues.filter(x => !!x).join(separator)
      searchParams.set(queryKey, serializedQuery)
      document.location = location.url.toString().split("?")[0] + "?" + searchParams.toString()
    }
  })

  useTask$(async ({ track }) => {
    track(debouncedParam)
    const searchParams = location.url.searchParams

    let serializedQuery = ""

    if (debouncedParam.value) {
      const serializedValues = await Promise.all(
          debouncedParam.value.map(async v => {
            return await itemSerializer.serialize$(v)
          }),
      )
      serializedQuery = serializedValues.filter(x => !!x).join(separator)
    }

    if (serializedQuery.length > 0) searchParams.set(queryKey, serializedQuery)
    else searchParams.delete(queryKey)
    const newUrl =
        location.url.toString().split("?")[0] + "?" + searchParams.toString()
    await navigate(newUrl.replaceAll(/\?$/g, ""), {
      scroll: options?.scroll,
      forceReload: options?.forceReload,
      replaceState: options?.replaceState,
    })
  })
  return param
}
