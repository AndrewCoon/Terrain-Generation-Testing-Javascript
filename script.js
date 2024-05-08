const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const height = 400;
const width = 400;

canvas.height = height;
canvas.width = width;

const biomeseedcountH = document.getElementById('biome_seed_count')

// An array of the center points of each biome
var seed_locs = []

var t_height = [];
var t_heat = [];
var t_humidity = [];
var t_map = []

const showNoise = true;
function Test() {
    // new_noise_map(400, 400); // Show noise var
 
    generate_quadrants(3, 3) // Will generate x * y quadrants
    draw_biome_centers(3, "red")
    biomeseedcountH.innerHTML = "Biome Seed Count: " + seed_locs.length;

    generate_noise_maps();
    generate_tile_map();

}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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

var image = ctx.createImageData(canvas.width, canvas.height);
var data = image.data;

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
            data[cell] = data[cell + 1] = data[cell + 2] = value;
            data[cell + 3] = 255; // alpha.
        }
    }

    if(showNoise) ctx.putImageData(image, 0, 0);

    return map;
}

function generate_noise_maps() {
    t_heat = new_noise_map(height, width)
    t_humidity = new_noise_map(height, width)
    t_height = new_noise_map(height, width)
}

function set_biome_index() {
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            var tile_biome = get_closest_biome_seed(x, y);
            t_map[x][y].biome_index = tile_biome;
        }
    }
}

function get_closest_biome_seed(x, y) {
    let closest_seed_index = 0;
    let closest_seed_dist = Infinity;

    for ( let seed_index = 0; seed_index < seed_locs.length; seed_index++) {
        let seed = seed_locs[seed_index];
        let dist = Math.pow(seed.x - x, 2) + Math.pow(seed.y - y)
        dist = Math.pow(dist, .5)

        if (dist < closest_seed_dist && dist > 2) { // TODO: Check why it should be greater than 2
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
            
        });
    });
}

Test();