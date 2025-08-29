use crate::calculate::{escape, Params};

pub fn get_pixels(params: &Params, table: &[[u8; 4]; 1024]) -> Vec<u8> {
    let Params {
        tile_width,
        tile_height,
        ..
    } = *params;

    (0..tile_width * tile_height)
        .flat_map(|index| {
            let x = index % tile_width;
            let y = index / tile_width;

            let escape_iteration = escape::get_escape_iteration(x, y, &params);

            if escape_iteration >= params.max_iterations {
                [0, 0, 0, 255]
            } else {
                table[escape_iteration]
            }
        })
        .collect()
}
