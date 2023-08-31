import json


def extract_variables(filepath: str) -> list[str]:
    with open(filepath, 'r') as input_file:
        header = input_file.readline()
        last_line = input_file.readlines()[-1]

    if header == "" or last_line == "":
        raise Exception("Empty header or last line")

    # header, split on comma
    # last_line split on comma, then look through for elements with ;

    out = header.split(",")

    vars = last_line.split(",")

    for var in vars:
        split = var.split(";")
        if len(split) == 2:
            out.append(split[0])

    return out


def group_variables(variables: list[str]) -> tuple[dict[str, list[str]], list[str]]:
    datapoints = {}

    script_variables = []

    script_variables_reached = False

    numbers = set([f"{x}" for x in range(0, 10)])
    for x in ["x", "y", "z"]:
        numbers.add(x)

    for var in variables:
        if script_variables_reached:
            script_variables.append(var)
        elif var == 'vars..\n':
            script_variables_reached = True
            continue
        else:
            split = var.split("_")
            if split[-1] in numbers:
                var_name = var[:-(1 + len(split[-1]))]
                if datapoints.get(var_name) == None:
                    datapoints[var_name] = []
                datapoints[var_name].append(var)
            else:
                datapoints[var] = [var]

    return datapoints, script_variables


def format_to_md(datapoints: dict[str, list[str]], script_variables: list[str]) -> str:
    out = "# EDDE Variables:\n\n"

    var_names = datapoints.keys()
    for name in var_names:
        if len(datapoints[name]) > 1:
            out += f"\n{create_fold_out(name, datapoints[name])}\n"
        else:
            out += f"\n- **{name}**\n\n"

    out += "\n# Script Variables:\n\n"

    on_robot = []

    ours = []

    for script_var in script_variables:
        lowercased = script_var.lower()
        if lowercased.startswith("on_") or lowercased.startswith("vg_"):
            on_robot.append(script_var)
        else:
            ours.append(script_var)

    out += "\n## OnRobot Variables:\n\n"

    for script_var in on_robot:
        out += f"\n- {script_var}\n\n"

    out += "\n## Our Variables:\n\n"

    for script_var in ours:
        out += f"\n- {script_var}\n\n"

    return out


def create_fold_out(var_name: str, var_variants: list[str]) -> str:
    out = f"- <details><summary>{var_name}</summary>\n"

    for variant in var_variants:
        out += f"\n\t- {variant}"

    out += "\n</details>\n"
    return out


def save_md(markdown: str, run_name: str) -> None:
    with open(f"datapoint_overview-{run_name}.md", "w") as f:
        f.write(markdown)

def save_string(string: str, run_name: str) -> None:
    with open(f"string-{run_name}.txt", "w") as f:
        f.write(string)

def generate_path(run_name: str) -> str:
    return f"WITH_POWER/{run_name}/{run_name}-0.csv"

def main(run_name: str):
    extracted = extract_variables(generate_path(run_name))

    print(extracted)

    save_string(str(extracted), run_name)

    datapoints, script_variables = group_variables(extracted)

    print(datapoints, script_variables)

    formatted = format_to_md(datapoints, script_variables)

    print(formatted)

    save_md(formatted, run_name)


def compare_runs(runs: list[str]) -> None:
    extracted_headers = []

    for run in runs:
        vars = extract_variables(generate_path(run))
        vars.sort()
        extracted_headers.append(vars)

    first = extracted_headers.pop(0)


    for header in extracted_headers:
        # if len(header) != len(first):
        if header != first:
            print(f"oh no h:{len(header)}  f:{len(first)}")
            print(f"first has {set(first).difference(set(header))} that header does not have")
            print(f"header has {set(header).difference(set(first))} that first does not have")
        else:
            print("equals")


if __name__ == '__main__':
    # main("2_4_miss")

    runs = [
        # "2_4_miss",
        "2_4_overlap",
        # "2_4_partial",
        # "central_miss",
        # "central_overlap",
        # "central_partial",
        "control",
        # "hard_push",
        # "high_pickup",
        # "long_failure",
        # "pushed",
        # "tile_hold",
    ]

    compare_runs(runs)
