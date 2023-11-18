export function cleanName(name) {
    if (name === undefined) {
        return undefined;
    }

    if (name.endsWith(".value")) {
        name = name.substring(0, name.length - 6)
    }

    const path_parts = name.split(".")

    name = path_parts[path_parts.length - 1]

    return name
}