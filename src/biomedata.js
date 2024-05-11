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

    average(vals) {
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
        this.avg_height = this.average(this.height_nodes)
        this.avg_heat = this.average(this.heat_nodes)
        this.avg_humidity = this.average(this.humidity_nodes)
    }

    get avg_heat() { return this.avg_heat }
    get avg_height() { return this.avg_height }
    get avg_humidity() { return this.avg_humidity }

    set_biome_info() {
        
    }
}