function get3dLayout(title, range) {
    return {
        title: title,
        autosize: true,
        margin: {
            l: 0,
            r: 0,
            b: 5,
            t: 30,
            pad: 4
        },
        xaxis: {
            automargin: true,
        },
        yaxis: {
            automargin: true,
        },
        paper_bgcolor: '#303f4b00',
        plot_bgcolor: '#b7b7b700',
        scene: {
            aspectmode: "manual",
            aspectratio: {
                x: 1, y: 1, z: 1,
            },
            xaxis: {
                title: 'x',
                range: [-range, range],
                color: "red"
            },
            yaxis: {
                title: 'y',
                range: [-range, range],
                color: "green"
            },
            zaxis: {
                title: 'z',
                range: [-range, range],
                color: "blue"
            }
        }
    }
}

function get2dLayout(title) {
    return {
        title: title,
        autosize: true,
        margin: {
            l: 0,
            r: 0,
            b: 25,
            t: 30,
            pad: 4
        },
        xaxis: {
            automargin: true,
        },
        yaxis: {
            automargin: true,
        },
        paper_bgcolor: '#303f4b00',
        plot_bgcolor: '#b7b7b700',
    }
}