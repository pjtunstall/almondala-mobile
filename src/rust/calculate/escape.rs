use num::complex::Complex;

use super::Params;

pub fn get_escape_iteration(x: usize, y: usize, params: &Params) -> usize {
    let Params {
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
        ..
    } = *params;

    let absolute_x = tile_left + (x as f64);
    let absolute_y = tile_top + (y as f64);

    // Use the absolute position to calculate the complex coordinates
    let cx = mid_x + ratio * (absolute_x as f64 / canvas_width as f64 - 0.5) * 3.0 * scale;
    let cy = mid_y - (absolute_y as f64 / canvas_height as f64 - 0.5) * 3.0 * scale;

    let c = Complex::new(cx, cy);
    let mut z = Complex::new(0.0, 0.0);

    let mut escape_iteration = 0;

    while escape_iteration < max_iterations && z.norm_sqr() < 4.0 {
        z = z.powi(power) + c;
        escape_iteration += 1;
    }

    escape_iteration
}
