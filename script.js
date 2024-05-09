const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var height = 400;
var width = 400;

canvas.height = height;
canvas.width = width;

const biomeseedcountH = document.getElementById('biome_seed_count')

// An array of the center points of each biome
var seed_locs = []

// The biome data for each biome
var biome_data = []

// An array to store colors for debugging biome setting
var seed_colors = []

var t_height = [];
var t_heat = [];
var t_humidity = [];
var t_map = []

var x_quads = 3;
var y_quads = 3;

const showNoise = false;
function Test() {
    seed_locs = []
    seed_colors = []

    biome_data = []

    t_height = [];
    t_heat = [];
    t_humidity = [];
    t_map = []
    // if (renderCount > 0) {
    this.width = document.getElementById('width').value;
    this.height = document.getElementById('height').value;

    canvas.height = height;
    canvas.width = width;

    this.x_quads = document.getElementById('x_quads').value;
    this.y_quads = document.getElementById('y_quads').value;
    // }

    generate_quadrants(x_quads, y_quads) // Will generate x * y quadrants
    biomeseedcountH.innerHTML = "Biome Seed Count: " + seed_locs.length;

    generate_noise_maps();
    generate_tile_map();
    set_biome_index();

    add_biome_nodes();
    compute_biome_averages();

    set_biome_types();

    // new_noise_map(width, height); // Show noise var
    show_quadrants();
    draw_biome_centers(3, "red")
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
    constructor(_point) {
        this.point = _point;
    }
}

function random(min, max) {
    let range = max - min + 1;
    let rand = Math.random() * range;
    return min + Math.floor(rand);
}

function generate_quadrants(x_div, y_div) {
    let quad_width = width / x_div;
    let quad_height = height / y_div;

    for (let x = 0; x < x_div; x++) {
        for (let y = 0; y < y_div; y++) {
            let temp_point = new Point(random(0, quad_width) + x * quad_width, random(0, quad_height) + y * quad_height);
            seed_locs.push(temp_point)
            biome_data.push(new BiomeData())
        }
    }
}

function draw_biome_centers(size, color) {
    for (let i = 0; i < seed_locs.length; i++) {
        let x = seed_locs[i].x;
        let y = seed_locs[i].y;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
    }
}

var noise_image = ctx.createImageData(canvas.width, canvas.height);
var noise_data = noise_image.data;

function new_noise_map(_x, _y) {
    var map = []

    perlin.seed()
    for (var x = 0; x < _x; x++) {
        map[x] = []
        for (var y = 0; y < _y; y++) {
            var value = Math.abs(perlin.get(x / 75, y / 75));
            value *= 256;

            map[x][y] = value;

            // For showing it as image
            var cell = (x + y * _x) * 4;
            noise_data[cell] = noise_data[cell + 1] = noise_data[cell + 2] = value;
            noise_data[cell + 3] = 255; // alpha.
        }
    }

    if (showNoise) ctx.putImageData(noise_image, 0, 0);

    return map;
}

function generate_noise_maps() {
    t_heat = new_noise_map(height, width)
    t_humidity = new_noise_map(height, width)
    t_height = new_noise_map(height, width)
}

function set_biome_index() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
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

        if (dist < closest_seed_dist /*&& dist > 2*/) { // TODO: Check why it should be greater than 2
            closest_seed_index = seed_index;
            closest_seed_dist = dist;
        }
    }
    return closest_seed_index;
}

function generate_tile_map() {
    for (let x = 0; x < width; x++) {
        t_map[x] = []
        for (let y = 0; y < height; y++) {
            t_map[x][y] = new Tile(new Point(x, y))
        }
    }
}

function add_biome_nodes() {
    t_map.forEach(element => {
        element.forEach(tile => {
            biome_data[tile.biome_index].add_node(tile.height, tile.heat, tile.humidity)
        });
    });
}

var biome_image = ctx.createImageData(canvas.width, canvas.height);
var biome_image_data = biome_image.data;

function show_quadrants() {
    for (var i = 0; i < seed_locs.length; i++) {
        seed_colors.push(new RGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)))
    }

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            var cell = (x + y * width) * 4;
            biome_image_data[cell + 0] = seed_colors[t_map[x][y].biome_index].r
            biome_image_data[cell + 1] = seed_colors[t_map[x][y].biome_index].g
            biome_image_data[cell + 2] = seed_colors[t_map[x][y].biome_index].b
            biome_image_data[cell + 3] = 255; // alpha.
        }
    }

    ctx.putImageData(biome_image, 0, 0);
}

function compute_biome_averages() {
    biome_data.forEach(biome => {
        biome.compute_averages();
    })
}

function set_biome_types() {
    biome_data.forEach(biome => {
        // Maybe change this system in the future
        let reqs = []
        if (biome.avg_heat >= 0.5) reqs.push("hot")
        if (biome.avg_heat < 0.5) reqs.push("cold")
        if (biome.avg_humidity >= 0.5) reqs.push("humid")
        if (biome.avg_humidity < 0.5) reqs.push("dry")
        if (biome.avg_height >= 0.5) reqs.push("high")
        if (biome.avg_height < 0.5) reqs.push("low")

        biome.requirements = reqs

        biome.biome_type = new BiomeType(reqs)
        biome.biome_type.set_biome();
    })
}

// Test();