const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var canvas_size = 256;

canvas.height = canvas_size;
canvas.width = canvas_size;

var grid_size = 4
var resolution = 128

const value_range = 3000;

var do_seed_change = true;

const biomeseedcountH = document.getElementById('biome_seed_count')
var biome_data_div = document.getElementById('biome_info')

// An array of the center points of each biome
var seed_locs = []

// The biome data for each biome
var biome_data = []

// List of the data for each biome from the json file
var biomes_list = []

// An array to store colors for debugging biome setting
var seed_colors = []

var t_height = [];
var t_heat = [];
var t_humidity = [];
var t_map = []

var x_quads = 3;
var y_quads = 3;

read_biomes_json('biome_data/test.json');

var rendered = false;
var quadrants_rendered = false;
function TestQuadrants() {
    if (rendered) {
        if(do_seed_change) { 
            biome_data = []; 
            if(quadrants_rendered) {
                seed_colors = []; 
            }
            seed_locs = []; 
        }

        t_height = [];
        t_heat = [];
        t_humidity = [];
        t_map = []

        this.canvas_size = document.getElementById('size').value;

        this.resolution = document.getElementById('res').value;
        this.grid_size = document.getElementById('g_size').value;

        canvas.height = canvas_size;
        canvas.width = canvas_size;

        this.x_quads = document.getElementById('x_quads').value;
        this.y_quads = document.getElementById('y_quads').value;
        
        biome_data_div = document.createElement('div')
    } else { 
        document.getElementById('size').value = this.canvas_size;

        document.getElementById('x_quads').value = this.x_quads;
        document.getElementById('y_quads').value = this.y_quads;

        document.getElementById('res').value = this.resolution;
        document.getElementById('g_size').value = this.grid_size;

        rendered = true 
    }
    
    generate_quadrants(x_quads, y_quads) // Will generate x * y quadrants
    biomeseedcountH.innerHTML = "Biome Seed Count: " + seed_locs.length;

    generate_noise_maps();
    generate_tile_map();
    set_biome_index();

    show_quadrants();
    draw_biome_centers(3, "white")
    quadrants_rendered = true;
}

function TestNoise() {
    if (rendered) {
        if(do_seed_change) { 
            biome_data = []; 
            seed_colors = []; 
            seed_locs = []; 
        }

        t_height = [];
        t_heat = [];
        t_humidity = [];
        t_map = []

        this.canvas_size = document.getElementById('size').value;

        this.resolution = document.getElementById('res').value;
        this.grid_size = document.getElementById('g_size').value;

        canvas.height = canvas_size;
        canvas.width = canvas_size;

        this.x_quads = document.getElementById('x_quads').value;
        this.y_quads = document.getElementById('y_quads').value;
        
        biome_data_div = document.createElement('div')
    } else { 
        document.getElementById('size').value = this.canvas_size;

        document.getElementById('x_quads').value = this.x_quads;
        document.getElementById('y_quads').value = this.y_quads;

        document.getElementById('res').value = this.resolution;
        document.getElementById('g_size').value = this.grid_size;

        rendered = true 
    }
    biomeseedcountH.innerHTML = "";

    new_noise_map(showNoise=true); // Show noise var
    draw_biome_centers(3, "red")
}

function TestTerrain() {
    if (rendered) {
        if(do_seed_change) { 
            biome_data = []; 
            seed_colors = []; 
            seed_locs = []; 
        }

        t_height = [];
        t_heat = [];
        t_humidity = [];
        t_map = []

        this.canvas_size = document.getElementById('size').value;

        this.resolution = document.getElementById('res').value;
        this.grid_size = document.getElementById('g_size').value;

        canvas.height = canvas_size;
        canvas.width = canvas_size;

        this.x_quads = document.getElementById('x_quads').value;
        this.y_quads = document.getElementById('y_quads').value;
        
        biome_data_div = document.createElement('div')
    } else { 
        document.getElementById('size').value = this.canvas_size;

        document.getElementById('x_quads').value = this.x_quads;
        document.getElementById('y_quads').value = this.y_quads;

        document.getElementById('res').value = this.resolution;
        document.getElementById('g_size').value = this.grid_size;

        rendered = true 
    }
    

    generate_quadrants(x_quads, y_quads) // Will generate x * y quadrants
    biomeseedcountH.innerHTML = "Biome Seed Count: " + seed_locs.length;

    generate_noise_maps();
    generate_tile_map();
    set_biome_index();

    add_biome_nodes();
    compute_biome_averages();

    set_biome_types();
    set_tile_colors();

    draw_quadrant_biomes();
    draw_biome_centers(3, "white")
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class RGB {
    constructor(r, g, b) {
        this.r = r;
        this.b = b;
        this.g = g;
    }
}

class Tile {
    height;
    heat;
    humidity;
    color;
    biome_index;

    constructor(_point) {
        this.point = _point;
    }

    get height() { return this.height }
    get heat() { return this.heat }
    get humidity() { return this.humidity }
    get color() { return this.color }
}

function random(min, max) {
    let range = max - min + 1;
    let rand = Math.random() * range;
    return min + Math.floor(rand);
}

function generate_quadrants(x_div, y_div) {
    if(!do_seed_change) return;
    
    let quad_width = resolution / x_div;
    let quad_height = resolution / y_div;

    for (let x = 0; x < x_div; x++) {
        for (let y = 0; y < y_div; y++) {
            let temp_point = new Point(random(0, quad_width) + x * quad_width, random(0, quad_height) + y * quad_height);
            seed_locs.push(temp_point)
            biome_data.push(new BiomeData())
        }
    }
}

function draw_biome_centers(size, color) {
    let pixel_size = canvas_size / resolution
    for (let i = 0; i < seed_locs.length; i++) {
        let x = seed_locs[i].x * pixel_size;
        let y = seed_locs[i].y * pixel_size;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
    }
}


function new_noise_map(show_noise = false) {
    var map = []
    if(do_seed_change || !show_noise) { noise.seed(Math.random()) }

    let pixel_size = canvas_size / resolution
    for (var x = 0; x < grid_size; x += grid_size / resolution){
        map[x * resolution / grid_size] = []
        for (var y = 0; y < grid_size; y += grid_size / resolution) {
            var v = Math.abs(parseInt((noise.perlin2(x, y) / 2 + .5) * 255))
            var t_v = v / 255 * value_range;

            map[x * resolution / grid_size][y * resolution / grid_size] = t_v;

            if(show_noise) {
                ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'
                ctx.fillRect(x * (canvas_size / grid_size), y * (canvas_size / grid_size), pixel_size, pixel_size)
            }

            
        }
    }
    return map;
}

function generate_noise_maps() {
    t_heat = new_noise_map()
    t_humidity = new_noise_map()
    t_height = new_noise_map()
}

function set_biome_index() {
    for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
            var tile_biome = get_closest_biome_seed(x, y);
            t_map[x][y].biome_index = tile_biome;
        }
    }
}

function get_closest_biome_seed(x, y) {
    let closest_seed_index = 0;
    let closest_seed_dist = Infinity;

    for (let seed_index = 0; seed_index < seed_locs.length; seed_index++) {
        let seed = seed_locs[seed_index];
        let dist = Math.pow(seed.x - x, 2) + Math.pow(seed.y - y, 2)
        dist = Math.sqrt(dist)

        if (dist < closest_seed_dist) { // TODO: Check why it should be greater than 2
            closest_seed_index = seed_index;
            closest_seed_dist = dist;
        }
    }
    return closest_seed_index;
}

function generate_tile_map() {
    var ret = []
    for (let x = 0; x < resolution; x++) {
        ret[x] = []
        t_map[x] = []
        for (let y = 0; y < resolution; y++) {
            var temp = new Tile(new Point(x, y))
            
            temp.heat = t_heat[x][y]
            temp.height = t_height[x][y]
            temp.humidity = t_humidity[x][y]

            ret[x][y] = temp;
            t_map[x][y] = temp;
        }
    }
    return ret;
}

function add_biome_nodes() {
    t_map.forEach(element => {
        element.forEach(tile => {
            biome_data[tile.biome_index].add_node(tile.height, tile.heat, tile.humidity)
        });
    });
}

function show_quadrants() {
    if(do_seed_change || !quadrants_rendered) {
        for (var i = 0; i < seed_locs.length; i++) {
            seed_colors.push(new RGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)))
        }
    }

    let pixel_size = canvas_size / resolution
    for (var x = 0; x < grid_size; x += grid_size / resolution){
        for (var y = 0; y < grid_size; y += grid_size / resolution) {
            let real_x = x * resolution / grid_size;
            let real_y = y * resolution / grid_size;
            
            ctx.fillStyle = 'rgb(' + seed_colors[t_map[real_x][real_y].biome_index].r + ',' + seed_colors[t_map[real_x][real_y].biome_index].g + ',' + seed_colors[t_map[real_x][real_y].biome_index].b + ')'
            ctx.fillRect(x * (canvas_size / grid_size), y * (canvas_size / grid_size), pixel_size, pixel_size)
        }
    }
}

function compute_biome_averages() {
    biome_data.forEach(biome => {
        biome.compute_averages();

        let temp = biome_data_div.appendChild(document.createElement('p'))
        temp.innerHTML = "Height: " + Math.floor(biome.avg_height) + " Heat: " + Math.floor(biome.avg_heat) + " Humidity: " + Math.floor(biome.avg_humidity);
    })
}

function read_biomes_json(src) {
    fetch(src)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            this.biomes_list = data;
        })
        .catch(error => {
            console.error('There was a problem fetching the JSON file:', error);
        });
}

function set_biome_types() {
    biome_data.forEach(biome => {
        biome.set_biome_info(find_biome(biome));
    })
}

function find_biome(quadrant) {
    for (const biome_name in biomes_list['biomes']) {
        const { height, heat, humidity } = biomes_list['biomes'][biome_name];
    
        if (
            quadrant.avg_height >= height.min && quadrant.avg_height <= height.max &&
            quadrant.avg_heat >= heat.min && quadrant.avg_heat <= heat.max &&
            quadrant.avg_humidity >= humidity.min && quadrant.avg_humidity <= humidity.max
        ) {
            return biome_name;
        }
    }

    return "Unknown";
}

function set_tile_colors() {
    t_map.forEach(element => {
        element.forEach(tile => {
            tile.color = biome_data[tile.biome_index].biome_info['color'];
        })
    })
}

function draw_quadrant_biomes() {
    let pixel_size = canvas_size / resolution

    for (var x = 0; x < grid_size; x += grid_size / resolution){
        for (var y = 0; y < grid_size; y += grid_size / resolution) {
            let real_x = x * resolution / grid_size;
            let real_y = y * resolution / grid_size;
           
            ctx.fillStyle = t_map[real_x][real_y].color;
            ctx.fillRect(x * (canvas_size / grid_size), y * (canvas_size / grid_size), pixel_size, pixel_size)
        }
    } 
}

const seed_change_button = document.getElementById('seed')
function change_seed() {
    if(!do_seed_change) {
        do_seed_change = true;
        seed_change_button.innerHTML = 'Changing Seed'
    } else {
        do_seed_change = false;
        seed_change_button.innerHTML = 'Seed Locked'
    }
}