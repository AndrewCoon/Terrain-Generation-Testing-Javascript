const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var canvas_size = 256;

canvas.height = canvas_size;
canvas.width = canvas_size;

var grid_size = 4
var resolution = 128

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

var rendered = false;
function Test() {
    if (rendered) {
        seed_locs = []
        seed_colors = []

        biome_data = []

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

    read_biomes_json('biome_data/test.json');

    set_biome_types();

    show_quadrants();
    draw_biome_centers(3, "red")
}

function TestNoise() {
    if (rendered) {
        seed_locs = []
        seed_colors = []

        biome_data = []

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

    new_noise_map(canvas_size, canvas_size, showNoise=true); // Show noise var
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
    let quad_width = canvas_size / x_div;
    let quad_height = canvas_size / y_div;

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


function new_noise_map(_x, _y, showNoise = false) {
    var map = []

    if(do_seed_change) perlin.seed();

    let pixSize = canvas_size / resolution
    for (var y = 0; y < grid_size; y += grid_size / resolution) {
        for (var x = 0; x < grid_size; x += grid_size / resolution){
            var v = parseInt((perlin.get(x, y)/2 + 0.5) * 255)
            if(showNoise) {
                ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'
                ctx.fillRect(x * (canvas_size / grid_size), y * (canvas_size / grid_size), pixSize, pixSize)
            }
        }
    }

    // for (var x = 0; x < grid_size; x += grid_size / width) {
    //     map[x * this.width/resolution] = []
    //     for (var y = 0; y < grid_size; y += grid_size / height) {
    //         // var value = Math.abs(perlin.get(x / 75, y / 75)); // Snake lookin one
    //         var value = parseInt(perlin.get(x, y)/2+0.5) * 255

    //         map[x * this.width/resolution][y * this.height/resolution] = value;

    //         // For showing it as image
    //         var cell = (x * this.width/resolution + y * this.height/resolution * _x) * 4;
    //         noise_data[cell] = noise_data[cell + 1] = noise_data[cell + 2] = value;
    //         noise_data[cell + 3] = 255; // alpha.
    //     }
    // }

    // if (showNoise) ctx.putImageData(noise_image, 0, 0);

    return map;
}

function generate_noise_maps() {
    t_heat = new_noise_map(canvas_size, canvas_size)
    t_humidity = new_noise_map(canvas_size, canvas_size)
    t_height = new_noise_map(canvas_size, canvas_size)
}

function set_biome_index() {
    for (let y = 0; y < canvas_size; y++) {
        for (let x = 0; x < canvas_size; x++) {
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
    for (let x = 0; x < canvas_size; x++) {
        t_map[x] = []
        for (let y = 0; y < canvas_size; y++) {
            let temp = new Tile(new Point(x, y))
            temp.heat = t_heat[x][y]
            temp.height = t_height[x][y]
            temp.humidity = t_humidity[x][y]
            t_map[x][y] = temp;
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

var biome_image = ctx.createImageData(this.canvas_size, this.canvas_size);
var biome_image_data = biome_image.data;

function show_quadrants() {
    for (var i = 0; i < seed_locs.length; i++) {
        seed_colors.push(new RGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)))
    }

    for (let x = 0; x < this.canvas_size; x++) {
        for (let y = 0; y < this.height; y++) {
            var cell = (x + y * this.canvas_size) * 4;
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
    console.log(data);
  })
  .catch(error => {
    console.error('There was a problem fetching the JSON file:', error);
  });

}

function set_biome_types() {
    biome_data.forEach(biome => {
        biome.set_biome_info();
    })
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
Test();