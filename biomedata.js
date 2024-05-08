class BiomeData {

    biome_type = "none"
    biome_index = -1

    height_nodes = []
    heat_nodes = []
    humidity_nodes = []

    avg_height = -1
    avg_heat = -1
    avg_humidity = -1

    constructor() { }

    static average(vals) {
        let sum = 0;

        for (let i = 0; i < vals.length; i++) {
            sum += vals[i];
        }

        const average = sum / vals.length;
        return average;
    }

    add_node(height, heat, humidity) {
        this.height_nodes.push(height)
        this.heat_nodes.push(heat)
        this.humidity_nodes.push(humidity)
    }

    compute_averages() {
        this.avg_height = average(this.height_nodes)
        this.avg_heat = average(this.heat_nodes)
        this.avg_humidity = average(this.humidity_nodes)
    }

    get avg_heat() { return this.avg_heat }
    get avg_height() { return this.avg_height }
    get avg_humidity() { return this.avg_humidity }
}

class BiomeType {
    name = "none"
    requirements = []
    color = "white"

    biomes = [
        ["Grasslands", ["low", "humid", "hot"], [30, 200, 30]],
        ["Tundra", ["low", "dry", "cold"], [240, 240, 240]],
        ["Mountain", ["high", "dry", "cold"], [100, 100, 100]]
        ["Desert", ["low", "dry", "cold"], [195, 212, 119]]
        ["Null", ["", "", ""], [180, 63, 209]]
    ]

    constructor(name, reqs) {
        this.name = name
        this.requirements = reqs
    }

    set_biome() { // TODO: revampt this system
        this.biomes.forEach(biome => {
            if (this.requirements.includes(biome[1][0]) && this.requirements.includes(biome[1][1]) && this.requirements.includes(biome[1][2])) {
                this.biome_type = biome[0]
                this.color = biome[2]
            } else {
                this.biome_type = "Null"
                this.color = [180, 63, 209]
            }
        })
    }
}