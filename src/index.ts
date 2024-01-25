import { useSignal, useTask$ } from "@builder.io/qwik"
import { useLocation, useNavigate } from "@builder.io/qwik-city"
import { type SearchParamSerializer, parseAsString } from "./parsers"
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

export function useQuerySignal<T>(
  queryKey: string,
  serializer: SearchParamSerializer<T>,
  options?: UseQuerySignalOptions,
) {
  if (!serializer) throw new Error(`Serializer not found!`)

  const location = useLocation()
  const navigate = useNavigate()

  const param = useSignal<T | undefined>()
  useTask$(async () => {
    param.value = await serializer.parse$(
      location.url.searchParams.get(queryKey),
    )
    if (param.value && !location.url.searchParams.get(queryKey)) {
      const searchParams = location.url.searchParams
      const serialized = await serializer.serialize$(param.value)
      if (serialized) searchParams.set(queryKey, serialized)
      await navigate(
        location.url.toString().split("?")[0] + "?" + searchParams.toString(),
      )
    }
  })

  useTask$(async ({ track }) => {
    track(param)
    const searchParams = location.url.searchParams
    const serialized = await serializer.serialize$(param.value)
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

  const param = useSignal<T[] | undefined>(defaultValue)
  useTask$(async () => {
    const query = location.url.searchParams.get(queryKey)
    if (!query) param.value = defaultValue
    else {
      const parsedValues = await Promise.all(
        query.split(separator).map(async (v: string) => {
          return await itemSerializer.parse$(v)
        }),
      )
      param.value = parsedValues.filter(x => !!x) as T[]
    }
    if (
      param.value &&
      param.value.length > 0 &&
      !location.url.searchParams.get(queryKey)
    ) {
      const searchParams = location.url.searchParams
      const serializedValues = await Promise.all(
        param.value.map(async v => {
          return await itemSerializer.serialize$(v)
        }),
      )
      const serializedQuery = serializedValues.filter(x => !!x).join(separator)
      searchParams.set(queryKey, serializedQuery)
      await navigate(
        location.url.toString().split("?")[0] + "?" + searchParams.toString(),
      )
    }
  })

  useTask$(async ({ track }) => {
    track(param)
    const searchParams = location.url.searchParams

    let serializedQuery = ""

    if (param.value) {
      const serializedValues = await Promise.all(
        param.value.map(async v => {
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
