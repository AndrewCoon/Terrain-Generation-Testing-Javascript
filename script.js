const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const height = 400;
const width = 400;

canvas.height = height;
canvas.width = width;

const biomeseedcountH = document.getElementById('biome_seed_count')

// An array of the center points of each biome
var seed_locs = []

function Test() {
    // generate_quadrants(3, 3) // Will generate x * y quadrants
    // draw_biome_centers(3, "red")
    // biomeseedcountH.innerHTML = "Biome Seed Count: " + seed_locs.length;

    new_noise_map();
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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

function new_noise_map(x, y) {
    for (var x = 0; x < canvas.width; x++) {
        //if (x % 100 == 0) {
        //  noise.seed(Math.random());
        //}
        for (var y = 0; y < canvas.height; y++) {
            var value = Math.abs(noise.perlin2(x / 100, y / 100));
            value *= 256;

            var cell = (x + y * canvas.width) * 4;
            data[cell] = data[cell + 1] = data[cell + 2] = value;
            data[cell] += Math.max(0, (25 - value) * 8);
            data[cell + 3] = 255; // alpha.
        }
    }
}

function generate_noise() {

}



Test();