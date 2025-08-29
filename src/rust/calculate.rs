mod escape;
mod perimeter;
mod pixels;

use wasm_bindgen::prelude::*;

use generate_tables::generate_color_tables;

generate_color_tables!();

pub struct Params {
    max_iterations: usize,
    tile_width: usize,
    tile_height: usize,
    canvas_width: usize,
    canvas_height: usize,
    ratio: f64,
    tile_left: f64,
    tile_top: f64,
    mid_x: f64,
    mid_y: f64,
    scale: f64,
    power: i32,
}

#[wasm_bindgen]
pub fn calculate_mandelbrot(
    tile_width: usize,
    tile_height: usize,
    canvas_width: usize,
    canvas_height: usize,
    max_iterations: usize,
    tile_left: f64,
    tile_top: f64,
    mid_x: f64,
    mid_y: f64,
    scale: f64,
    ratio: f64,
    power: i32,
    grayscale: bool,
) -> Vec<u8> {
    let params = Params {
        tile_width,
        tile_height,
        canvas_width,
        canvas_height,
        max_iterations,
        tile_left,
        tile_top,
        mid_x,
        mid_y,
        scale,
        ratio,
        power,
    };

    if perimeter::is_perimeter_all_black(&params) {
        return vec![[0, 0, 0, 255]; tile_width * tile_height]
            .into_iter()
            .flatten()
            .collect();
    }

    if grayscale {
        pixels::get_pixels(&params, &SHADES)
    } else {
        pixels::get_pixels(&params, &COLORS)
    }
}
