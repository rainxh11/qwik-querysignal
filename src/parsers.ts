import {$, type QRL} from "@builder.io/qwik";
import {format, parse as parseDate} from "date-fns";

export interface SearchParamSerializer<T> {
    serialize$: QRL<(value: T | undefined | null) => string | undefined | null>
    parse$: QRL<(stringValue: string | null) => T | undefined>
    defaultValue?: T
}


export const parseAsString = (defaultValue?: string): SearchParamSerializer<string> => {
    return {
        serialize$: $((v) => v ? v.toString() : defaultValue ? defaultValue.toString(): undefined),
        parse$: $(v => v ?? defaultValue),
        defaultValue: defaultValue
    }
}

export const parseAsInteger = (defaultValue?: number): SearchParamSerializer<number> => {
    return {
        serialize$: $(v => {
            if (!v || !defaultValue) return undefined
            Math.round(v || defaultValue).toFixed()
        }),
        parse$: $(v => {
            if (!v) return defaultValue
            const parsed = parseInt(v)
            if (Number.isNaN(parsed)) return defaultValue
            return parsed
        }),
        defaultValue: defaultValue
    }
}

export const parseAsHex = (defaultValue?: number): SearchParamSerializer<number> => {
    return {
        serialize$: $(v => {
            if (!v || !defaultValue) return undefined
            const hex = Math.round(v || defaultValue).toString(16)
            return hex.padStart(hex.length + (hex.length % 2), '0')
        }),
        parse$: $(v => {
            if (!v) return defaultValue
            const parsed = parseInt(v, 16)
            if (Number.isNaN(parsed)) return defaultValue
            return parsed
        }),
        defaultValue: defaultValue
    }
}


export const parseAsFloat = (defaultValue?: number): SearchParamSerializer<number> => {
    return {
        serialize$: $(v => {
            return v
                ? Math.round(v).toString()
                : defaultValue
                    ? Math.round(defaultValue).toString()
                    : undefined

        }),
        parse$: $(v => {
            if (!v) return defaultValue
            const parsed = parseFloat(v)
            if (Number.isNaN(parsed)) return defaultValue
            return parsed
        }),
        defaultValue: defaultValue
    }
}
export const parseAsBoolean = (defaultValue?: boolean): SearchParamSerializer<boolean> => {
    return {
        serialize$: $((v) => `${v ?? defaultValue}`),
        parse$: $(v => v ? v === 'true' : (defaultValue ? defaultValue : undefined)),
        defaultValue: defaultValue
    }
}

export const parseAsTimestamp = (defaultValue?: Date): SearchParamSerializer<Date> => {
    return {
        serialize$: $((v) => {
            return v
                ? v.valueOf().toString()
                : defaultValue
                    ? defaultValue.valueOf().toString()
                    : undefined
        }),
        parse$: $(v => {
            {
                if (!v) return defaultValue
                const ms = parseInt(v)
                if (Number.isNaN(ms)) return undefined
                return new Date(ms)
            }
        }),
        defaultValue: defaultValue
    }
}

export const parseAsIsoDateTime = (defaultValue?: Date): SearchParamSerializer<Date> => {
    return {
        serialize$: $((v) => {
            return v
                ? v.toISOString()
                : defaultValue
                    ? defaultValue.toISOString()
                    : undefined
        }),
        parse$: $(v => {
            {
                if (!v) return defaultValue
                const date = new Date(v)
                if (Number.isNaN(date.valueOf())) return undefined
                return date
            }
        }),
        defaultValue: defaultValue
    }
}

export const parseAsDateTimeFormatted = (dateFormat: string, defaultValue?: Date): SearchParamSerializer<Date> => {
    return {
        serialize$: $((v) => {
            return v
                ? format(v, dateFormat)
                : defaultValue
                    ? format(defaultValue, dateFormat)
                    : undefined
        }),
        parse$: $(v => {
            {
                if (!v) return defaultValue
                const date = parseDate(v, dateFormat, new Date())
                if (Number.isNaN(date.valueOf())) return undefined
                return date
            }
        }),
        defaultValue: defaultValue
    }
}


export const parseAsStringEnum = <Enum extends string>(validEnums: Enum[], defaultValue?: Enum): SearchParamSerializer<Enum> => {
    return {
        serialize$: $((v) => {
            return v
                ? v.toString()
                : defaultValue
                    ? defaultValue.toString()
                    : undefined
        }),
        parse$: $(v => {
            {
                if (!v) return defaultValue
                const parsedEnum = v as unknown as Enum
                if (validEnums.includes(parsedEnum)) return parsedEnum
                return undefined
            }
        }),
        defaultValue: defaultValue
    }
}


export const parseAsStringLiteral = <Literal extends string>(validLiterals: Literal [], defaultValue?: Literal): SearchParamSerializer<Literal> => {
    return {
        serialize$: $((v) => {
            return v
                ? v.toString()
                : defaultValue
                    ? defaultValue.toString()
                    : undefined
        }),
        parse$: $(v => {
            {
                if (!v) return defaultValue
                const parsedLiteral = v as unknown as Literal
                if (validLiterals.includes(parsedLiteral)) return parsedLiteral
                return undefined
            }
        }),
        defaultValue: defaultValue
    }
}

export const parseAsNumberLiteral = <Literal extends number>(validLiterals: Literal [], defaultValue?: Literal): SearchParamSerializer<Literal> => {
    return {
        serialize$: $((v) => {
            return v
                ? v.toString()
                : defaultValue
                    ? defaultValue.toString()
                    : undefined
        }),
        parse$: $(v => {
            {
                if (!v) return defaultValue
                const parsedLiteral = parseFloat(v) as unknown as Literal
                if (validLiterals.includes(parsedLiteral)) return parsedLiteral
                return undefined
            }
        }),
        defaultValue: defaultValue
    }
}

export const parseAsJson = <T>(defaultValue?: T): SearchParamSerializer<T> => {
    return {
        serialize$: $((v) => {
            return v
                ? JSON.stringify(v)
                : defaultValue
                    ? JSON.stringify(defaultValue)
                    : undefined
        }),
        parse$: $(v => {
            try {
                if (!v) return defaultValue
                const deserialized = JSON.parse(v)
                return deserialized as T
            } catch {
                return undefined
            }
        }),
        defaultValue: defaultValue
    }
}
