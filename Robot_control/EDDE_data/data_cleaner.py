def main():
    pass
    desired_variables = (
        "robot_epoch",
        "protective_stop",
        *create_multi_name("current_window_max_*", count=6),
    )

    indexes = create_indexes_from_names(desired_variables, "WITH_POWER/control/control-0.csv")

    write_cleaned_file(indexes, "WITH_POWER/control/control-0.csv")


def create_multi_name(name: str, count: int, wildcard: str = "*", start_from: int = 0) -> list[str]:
    out = []

    for i in range(start_from, count + start_from):
        out.append(name.replace(wildcard, str(i)))

    return out


def create_indexes_from_names(names: tuple[str, ...], filepath: str) -> tuple[int, ...]:
    out = []

    with open(filepath, 'r') as input_file:
        header = input_file.readline().split(",")
        last_line = input_file.readlines()[-1]

    for i, name in enumerate(header):
        if name in names:
            out.append(i)

    return tuple(out)


def write_cleaned_file(indexes: tuple[int, ...], filepath: str) -> None:
    print(indexes)

    with open(filepath, 'r') as input_file:
        with open("cleaned_output.csv", "w") as output_file:
            while True:
                line = input_file.readline()
                if not line:
                    break
                # end of file reached

                line = line.split(",")

                # print(line)
                out = line[indexes[0]]

                for index in indexes[1:]:
                    out += "," + line[index]

                output_file.write(out + "\n")

    pass


if __name__ == '__main__':
    main()
